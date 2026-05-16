import React, { useState } from 'react';

/**
 * Gold pill for Islamic events. Tapping shows a description card.
 */
export default function IslamicEventPill({ event, compact = false }) {
  const [open, setOpen] = useState(false);

  if (compact) {
    return (
      <>
        <button
          onClick={e => { e.stopPropagation(); setOpen(true); }}
          className="truncate rounded px-1 py-0.5 text-left"
          style={{
            background: 'color-mix(in srgb, var(--mizan-gold) 18%, transparent)',
            color: 'var(--mizan-gold)',
            fontSize: '9px',
            fontWeight: '600',
            maxWidth: '100%',
            display: 'block',
          }}
        >
          {event.name}
        </button>
        {open && <EventDescCard event={event} onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          background: 'color-mix(in srgb, var(--mizan-gold) 15%, transparent)',
          border: '1px solid color-mix(in srgb, var(--mizan-gold) 40%, transparent)',
          color: 'var(--mizan-gold)',
        }}
      >
        <span>☽</span>
        {event.name}
      </button>
      {open && <EventDescCard event={event} onClose={() => setOpen(false)} />}
    </>
  );
}

function EventDescCard({ event, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 shadow-2xl"
        style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-gold)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontSize: '20px' }}>☽</span>
          <p className="font-bold text-base" style={{ color: 'var(--mizan-gold)' }}>{event.name}</p>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--mizan-text-secondary)' }}>{event.desc}</p>
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