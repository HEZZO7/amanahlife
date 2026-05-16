import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { buildContext } from '@/lib/aiContextBuilder';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function UserBubble({ text }) {
  return (
    <div className="flex justify-end mb-3">
      <div
        className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed text-white"
        style={{ background: 'var(--mizan-emerald)' }}
      >
        {text}
      </div>
    </div>
  );
}

function AIBubble({ text, loading }) {
  return (
    <div className="flex justify-start mb-3">
      <div
        className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
        style={{
          background: 'var(--mizan-surface)',
          border: '1px solid var(--mizan-border)',
          borderLeft: '3px solid var(--mizan-emerald)',
          color: 'var(--mizan-text)',
        }}
      >
        {loading ? (
          <div className="flex items-center gap-2" style={{ color: 'var(--mizan-text-secondary)' }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>...</span>
          </div>
        ) : (
          text
        )}
      </div>
    </div>
  );
}

const SUGGESTED = [
  { en: 'How am I doing this month?', ar: 'كيف حالي هذا الشهر؟' },
  { en: 'Tips to improve my prayer streak', ar: 'نصائح لتحسين انتظامي في الصلاة' },
  { en: 'Help me set a new financial goal', ar: 'ساعدني في وضع هدف مالي جديد' },
];

export default function AIAssistant() {
  const { t } = useI18n();
  const { settings } = useUserSettings();
  const language = settings?.language || 'ar';
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextStr, setContextStr] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    buildContext().then(setContextStr).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    const historyText = messages.map(m =>
      m.role === 'user' ? `User: ${m.text}` : `Assistant: ${m.text}`
    ).join('\n');

    const prompt = `${contextStr}\n\n${historyText ? historyText + '\n' : ''}User: ${userText}\nAssistant:`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setLoading(false);
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] lg:h-screen" style={{ background: 'var(--mizan-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0"
        style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--mizan-emerald)' }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}
          </h1>
          <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'مدرك بسياق حياتك' : 'Context-aware life companion'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-2">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}
            >
              <Sparkles className="w-8 h-8" style={{ color: 'var(--mizan-emerald)' }} />
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--mizan-text)' }}>
                {language === 'ar' ? 'كيف يمكنني مساعدتك؟' : 'How can I help you today?'}
              </p>
              <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
                {language === 'ar'
                  ? 'أنا أعرف بياناتك — اسألني أي شيء'
                  : 'I know your data — ask me anything'}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {SUGGESTED.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s[language] || s.en)}
                  className="px-4 py-2.5 rounded-xl text-sm text-left transition-all hover:opacity-80"
                  style={{
                    background: 'var(--mizan-surface)',
                    border: '1px solid var(--mizan-border)',
                    color: 'var(--mizan-text)',
                    textAlign: language === 'ar' ? 'right' : 'left',
                  }}
                >
                  {s[language] || s.en}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === 'user'
            ? <UserBubble key={i} text={m.text} />
            : <AIBubble key={i} text={m.text} />
        )}
        {loading && <AIBubble loading />}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div
        className="flex-shrink-0 px-4 py-3 border-t"
        style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)' }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-2xl"
          style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type a message...'}
            className="flex-1 bg-transparent text-sm outline-none py-1"
            style={{ color: 'var(--mizan-text)' }}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: 'var(--mizan-emerald)' }}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}