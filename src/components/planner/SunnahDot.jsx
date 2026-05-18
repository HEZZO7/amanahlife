import React, { useState } from 'react';

const SAGE = '#7C9A7E'; // sage green — within AmanahLife palette range

/**
 * Small sage dot for Sunnah fast suggestions.
 */
export default function SunnahDot({ suggestion, compact = false }) {
  const [open, setOpen] = useState(false);

  if (compact) {
    return (
      <>
        <button
          onClick={e => { e.stopPropagation(); setOpen(true); }}
          className="flex items-center gap-0.5 rounded px-1 py-0.5"
          style={{
            background: 'color-mix(in srgb, #7C9A7E 15%, transparent)',
            fontSize: '9px',
            color: SAGE,
            fontWeight: '500',
          }}
        >
          <span style={{ fontSize: '7px' }}>●</span>
          {suggestion.name}
        </button>
        {open && <SunnahCard suggestion={suggestion} onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{
          background: 'color-mix(in srgb, #7C9A7E 12%, transparent)',
          border: `1px solid color-mix(in srgb, #7C9A7E 35%, transparent)`,
          color: SAGE,
        }}
      >
        <span style={{ fontSize: '8px' }}>●</span>
        {suggestion.name}
      </button>
      {open && <SunnahCard suggestion={suggestion} onClose={() => setOpen(false)} />}
    </>
  );
}

function SunnahCard({ suggestion, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 bottom-sheet-overlay"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 shadow-2xl bottom-sheet-content"
        style={{ background: 'var(--mizan-elevated)', border: `1px solid ${SAGE}` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: SAGE, fontSize: '14px' }}>●</span>
          <p className="font-bold text-base" style={{ color: SAGE }}>{suggestion.name}</p>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--mizan-text-secondary)' }}>{suggestion.desc}</p>
        <p className="text-xs mt-2 italic" style={{ color: 'var(--mizan-text-secondary)', opacity: 0.6 }}>
          {suggestion.desc.includes('suggestion') || suggestion.desc.includes('سنة') ? '' : ''}
        </p>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl text-sm font-medium"
          style={{ background: 'var(--mizan-surface)', color: 'var(--mizan-text-secondary)', border: '1px solid var(--mizan-border)' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}