import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Loader2, User } from 'lucide-react';

export function UserMessage({ text }) {
  return (
    <div className="flex justify-end mb-4 gap-2 items-end">
      <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed text-white"
        style={{ background: 'var(--mizan-emerald)' }}>
        {text}
      </div>
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
        style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
        <User className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
      </div>
    </div>
  );
}

export function AIMessage({ text, loading }) {
  return (
    <div className="flex justify-start mb-4 gap-2 items-end">
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
        style={{ background: 'var(--mizan-emerald)' }}>
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed"
        style={{
          background: 'var(--mizan-surface)',
          border: '1px solid var(--mizan-border)',
          color: 'var(--mizan-text)',
        }}>
        {loading ? (
          <div className="flex items-center gap-2" style={{ color: 'var(--mizan-text-secondary)' }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--mizan-emerald)', animationDelay: '0ms' }} />
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--mizan-emerald)', animationDelay: '150ms' }} />
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--mizan-emerald)', animationDelay: '300ms' }} />
          </div>
        ) : (
          <ReactMarkdown
            className="prose prose-sm max-w-none"
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
              strong: ({ children }) => <strong style={{ color: 'var(--mizan-emerald)', fontWeight: 600 }}>{children}</strong>,
              ul: ({ children }) => <ul className="mb-2 space-y-1 list-none ps-0">{children}</ul>,
              li: ({ children }) => (
                <li className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--mizan-emerald)' }} />
                  <span>{children}</span>
                </li>
              ),
              ol: ({ children }) => <ol className="mb-2 ps-4 list-decimal space-y-1">{children}</ol>,
              h3: ({ children }) => <h3 className="font-semibold text-sm mb-1 mt-2" style={{ color: 'var(--mizan-text)' }}>{children}</h3>,
              code: ({ children }) => <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--mizan-elevated)', color: 'var(--mizan-emerald)' }}>{children}</code>,
              blockquote: ({ children }) => (
                <blockquote className="border-s-2 ps-3 my-2 italic text-xs" style={{ borderColor: 'var(--mizan-gold)', color: 'var(--mizan-text-secondary)' }}>
                  {children}
                </blockquote>
              ),
            }}
          >
            {text}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}