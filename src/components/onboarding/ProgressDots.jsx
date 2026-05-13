import React from 'react';

export default function ProgressDots({ total, current }) {
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            background: i === current ? 'var(--mizan-emerald)' : 'var(--mizan-border)',
          }}
        />
      ))}
    </div>
  );
}