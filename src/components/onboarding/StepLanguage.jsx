import React from 'react';
import { motion } from 'framer-motion';

export default function StepLanguage({ onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6"
    >
      <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: 'var(--mizan-text)' }}>
        Mizan
      </h1>
      <p className="text-lg mb-2 text-center font-arabic" style={{ color: 'var(--mizan-text)' }}>
        ميزان
      </p>
      <p className="text-sm mb-12 text-center" style={{ color: 'var(--mizan-text-secondary)' }}>
        Choose your language / اختر لغتك
      </p>

      <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
        <button
          onClick={() => onSelect('en')}
          className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-transparent hover:border-[var(--mizan-emerald)] transition-all duration-200"
          style={{ background: 'var(--mizan-surface)' }}
        >
          <span className="text-2xl font-semibold font-inter" style={{ color: 'var(--mizan-text)' }}>
            English
          </span>
        </button>

        <button
          onClick={() => onSelect('ar')}
          className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-transparent hover:border-[var(--mizan-emerald)] transition-all duration-200"
          style={{ background: 'var(--mizan-surface)' }}
        >
          <span className="text-2xl font-semibold font-arabic" style={{ color: 'var(--mizan-text)' }}>
            عربي
          </span>
        </button>
      </div>
    </motion.div>
  );
}