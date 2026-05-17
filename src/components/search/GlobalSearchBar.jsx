import React from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';

export default function GlobalSearchBar() {
  const navigate = useNavigate();
  const { language } = useI18n();
  return (
    <button
      onClick={() => navigate('/search')}
      className="flex items-center gap-2 w-full mx-3 px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80"
      style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text-secondary)' }}
    >
      <Search className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-xs">{language === 'ar' ? 'بحث...' : 'Search...'}</span>
    </button>
  );
}