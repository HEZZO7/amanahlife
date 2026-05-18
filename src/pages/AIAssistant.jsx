import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { buildContext } from '@/lib/aiContextBuilder';
import { Send, Sparkles, Menu, X, RefreshCw, ChevronDown } from 'lucide-react';
import { UserMessage, AIMessage } from '@/components/ai/ChatMessage';
import ProactiveSuggestions from '@/components/ai/ProactiveSuggestions';
import ConversationHistory from '@/components/ai/ConversationHistory';

// Persist conversations in localStorage
const STORAGE_KEY = 'mizan_ai_conversations';

function loadConversations() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveConversations(convs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(convs)); } catch {}
}

const QUICK_ACTIONS = [
  { ar: 'ملخص يومي', en: 'Daily summary' },
  { ar: 'نصيحة مالية', en: 'Financial tip' },
  { ar: 'تذكيري بأهدافي', en: 'Remind my goals' },
  { ar: 'دعاء اليوم', en: 'Dua for today' },
];

export default function AIAssistant() {
  const { t } = useI18n();
  const { settings } = useUserSettings();
  const language = settings?.language || 'ar';
  const isAr = language === 'ar';

  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextStr, setContextStr] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    buildContext().then(setContextStr).catch(() => {});
  }, []);

  // Restore last active conversation
  useEffect(() => {
    if (conversations.length > 0 && !activeId) {
      const last = conversations[conversations.length - 1];
      setActiveId(last.id);
      setMessages(last.messages || []);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  };

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  const createNewConversation = useCallback(() => {
    const id = Date.now().toString();
    const conv = { id, title: '', preview: '', messages: [], createdAt: new Date().toISOString() };
    const updated = [conv, ...conversations];
    setConversations(updated);
    saveConversations(updated);
    setActiveId(id);
    setMessages([]);
    setSidebarOpen(false);
    inputRef.current?.focus();
  }, [conversations]);

  const selectConversation = useCallback((id) => {
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;
    setActiveId(id);
    setMessages(conv.messages || []);
    setSidebarOpen(false);
  }, [conversations]);

  const deleteConversation = useCallback((id) => {
    const updated = conversations.filter(c => c.id !== id);
    saveConversations(updated);
    setConversations(updated);
    if (activeId === id) {
      if (updated.length > 0) {
        setActiveId(updated[0].id);
        setMessages(updated[0].messages || []);
      } else {
        setActiveId(null);
        setMessages([]);
      }
    }
  }, [conversations, activeId]);

  const updateConversation = useCallback((id, newMessages) => {
    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id !== id) return c;
        const first = newMessages.find(m => m.role === 'user');
        const aiReply = newMessages.find(m => m.role === 'ai');
        return {
          ...c,
          messages: newMessages,
          title: first?.text?.slice(0, 40) || c.title,
          preview: aiReply?.text?.slice(0, 60) || c.preview,
        };
      });
      saveConversations(updated);
      return updated;
    });
  }, []);

  const send = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');

    // Ensure active conversation
    let convId = activeId;
    if (!convId) {
      const id = Date.now().toString();
      const conv = { id, title: '', preview: '', messages: [], createdAt: new Date().toISOString() };
      const updated = [conv, ...conversations];
      setConversations(updated);
      saveConversations(updated);
      setActiveId(id);
      convId = id;
    }

    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setLoading(true);

    // Build conversation history for context
    const historyText = messages.slice(-10).map(m =>
      m.role === 'user' ? `User: ${m.text}` : `Assistant: ${m.text}`
    ).join('\n');

    const prompt = `${contextStr}\n\n${historyText ? historyText + '\n' : ''}User: ${userText}\nAssistant:`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt, model: 'gpt_5_4' });
    setLoading(false);
    const finalMessages = [...newMessages, { role: 'ai', text: response }];
    setMessages(finalMessages);
    updateConversation(convId, finalMessages);
  };

  const isEmpty = messages.length === 0;
  const activeConv = conversations.find(c => c.id === activeId);

  return (
    <div className="flex h-[calc(100dvh-64px)] lg:h-screen relative overflow-hidden"
      style={{ background: 'var(--mizan-bg)' }} dir={isAr ? 'rtl' : 'ltr'}>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        absolute lg:relative z-40 lg:z-auto
        h-full w-64 flex-shrink-0 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : (isAr ? 'translate-x-full' : '-translate-x-full')}
        lg:translate-x-0
      `} style={{ borderInlineEnd: '1px solid var(--mizan-border)' }}>
        <ConversationHistory
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onDelete={deleteConversation}
          onNew={createNewConversation}
          language={language}
        />
      </div>

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
          style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)' }}>
          <button onClick={() => setSidebarOpen(v => !v)}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
            <Menu className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
          </button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--mizan-emerald)' }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm truncate" style={{ color: 'var(--mizan-text)' }}>
              {activeConv?.title || (isAr ? 'المساعد الذكي' : 'AI Assistant')}
            </h1>
            <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {isAr ? 'مدرك بسياق حياتك الكاملة' : 'Fully context-aware life companion'}
            </p>
          </div>
          {messages.length > 0 && (
            <button onClick={createNewConversation}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}
              title={isAr ? 'محادثة جديدة' : 'New chat'}>
              <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
            </button>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4">

          {/* Welcome / empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center min-h-full gap-6 text-center pb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                <Sparkles className="w-8 h-8" style={{ color: 'var(--mizan-emerald)' }} />
              </div>
              <div>
                <p className="font-bold text-lg mb-1" style={{ color: 'var(--mizan-text)' }}>
                  {isAr ? 'مرحباً! كيف يمكنني مساعدتك؟' : 'Hello! How can I help?'}
                </p>
                <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
                  {isAr
                    ? 'أنا أعرف بياناتك المالية والروحية والصحية — اسألني أي شيء'
                    : 'I know your finances, spiritual & wellness data — ask me anything'}
                </p>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {QUICK_ACTIONS.map((q, i) => (
                  <button key={i} onClick={() => send(q[isAr ? 'ar' : 'en'])}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-70"
                    style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}>
                    {q[isAr ? 'ar' : 'en']}
                  </button>
                ))}
              </div>

              <ProactiveSuggestions language={language} onSelect={send} />
            </div>
          )}

          {messages.map((m, i) =>
            m.role === 'user'
              ? <UserMessage key={i} text={m.text} />
              : <AIMessage key={i} text={m.text} />
          )}
          {loading && <AIMessage loading />}
          <div ref={bottomRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button onClick={scrollToBottom}
            className="absolute bottom-20 inset-x-0 mx-auto w-fit flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg transition-all"
            style={{ background: 'var(--mizan-emerald)', color: 'white' }}>
            <ChevronDown className="w-3.5 h-3.5" />
            {isAr ? 'للأسفل' : 'Scroll down'}
          </button>
        )}

        {/* Input bar */}
        <div className="flex-shrink-0 px-4 py-3 border-t"
          style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)' }}>
          <div className="flex items-end gap-2 px-4 py-2 rounded-2xl"
            style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={isAr ? 'اكتب رسالتك... (Enter للإرسال، Shift+Enter لسطر جديد)' : 'Type a message... (Enter to send, Shift+Enter for new line)'}
              className="flex-1 bg-transparent text-sm outline-none py-1 resize-none leading-relaxed"
              style={{ color: 'var(--mizan-text)', minHeight: '28px', maxHeight: '120px' }}
              dir={isAr ? 'rtl' : 'ltr'}
              rows={1}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 mb-0.5 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0"
              style={{ background: 'var(--mizan-emerald)' }}>
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-center text-xs mt-1.5" style={{ color: 'var(--mizan-text-secondary)', opacity: 0.5 }}>
            {isAr ? 'المساعد قد يخطئ — تحقق من المعلومات المهمة' : 'AI may make mistakes — verify important info'}
          </p>
        </div>
      </div>
    </div>
  );
}