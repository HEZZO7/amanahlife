import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { raw_input } = await req.json();
    if (!raw_input?.trim()) {
      return Response.json({ error: 'No input provided' }, { status: 400 });
    }

    // Use InvokeLLM to analyze transactions
    const analysisResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an Islamic finance compliance assistant. Analyze each transaction for halal compliance based on Quran, Sunnah, and contemporary Islamic finance scholars.

Raw transaction input:
${raw_input}

For EACH transaction/line item:
1. Extract merchant name and amount
2. Classify as: "halal" ✓ / "questionable" ⚠️ / "avoid" ✗
3. Provide a brief, respectful reason (1-2 sentences max)

Classification rules:
- AVOID (✗): alcohol, tobacco, gambling, adult entertainment, riba-based interest charges, pork products, conventional banking interest
- QUESTIONABLE (⚠️): mixed-use restaurants (may serve alcohol), entertainment venues, subscription services with unclear content, conventional banks
- HALAL (✓): groceries, halal restaurants, Islamic financial services, utilities, clothing, books, etc.

Return ONLY valid JSON array with no markdown:
[
  {
    "merchant": "Store Name",
    "amount": 50.25,
    "status": "halal|questionable|avoid",
    "reason": "Brief Islamic finance explanation"
  }
]`,
      response_json_schema: {
        type: "object",
        properties: {
          transactions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                merchant: { type: "string" },
                amount: { type: "number" },
                status: { type: "string" },
                reason: { type: "string" }
              }
            }
          }
        }
      },
    });

    const transactions = analysisResponse.transactions || [];
    
    // Calculate halal score
    const halal_count = transactions.filter(t => t.status === 'halal').length;
    const total = transactions.length;
    const halal_score = total > 0 ? Math.round((halal_count / total) * 100) : 0;

    // Store result
    const result = await base44.entities.HalalScanResults.create({
      scan_date: new Date().toISOString().split('T')[0],
      raw_input,
      results: transactions,
      halal_score,
    });

    return Response.json({
      success: true,
      halal_score,
      transactions,
      resultId: result.id,
    });
  } catch (error) {
    console.error('Halal analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});