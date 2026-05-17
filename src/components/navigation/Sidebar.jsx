import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import {
  LayoutDashboard, Wallet, Target, CalendarDays, Heart,
  Moon, Users, BookOpen, Briefcase, Activity, BarChart3, Settings, Sparkles, Trophy, Archive, Vault
} from 'lucide-react';
import GlobalSearchBar from '@/components/search/GlobalSearchBar';

const NAV_ITEMS = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard },
  { key: 'ai', path: '/ai', icon: Sparkles },
  { key: 'finance', path: '/finance', icon: Wallet },
  { key: 'goals', path: '/goals', icon: Target },
  { key: 'planner', path: '/planner', icon: CalendarDays },
  { key: 'spiritual', path: '/spiritual', icon: Heart },
  { key: 'ramadan', path: '/ramadan', icon: Moon },
  { key: 'family', path: '/family', icon: Users },
  { key: 'learning', path: '/learning', icon: BookOpen },
  { key: 'work', path: '/work', icon: Briefcase },
  { key: 'wellness', path: '/wellness', icon: Activity },
  { key: 'analytics', path: '/analytics', icon: BarChart3 },
  { key: 'achievements', path: '/achievements', icon: Trophy },
  { key: 'archive', path: '/archive', icon: Archive },
  { key: 'vault', path: '/vault', icon: Vault },
];

export default function Sidebar() {
  const { t, isRTL } = useI18n();
  const location = useLocation();

  return (
    <aside
      className="hidden lg:flex flex-col w-64 h-screen fixed top-0 z-40"
      style={{
        background: 'var(--mizan-bg)',
        borderColor: 'var(--mizan-border)',
        [isRTL ? 'right' : 'left']: 0,
        [isRTL ? 'borderLeft' : 'borderRight']: '1px solid var(--mizan-border)',
      }}
    >
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'var(--mizan-emerald)' }}
        >
          A
        </div>
        <span className="text-lg font-bold" style={{ color: 'var(--mizan-text)' }}>
          {t('app.name')}
        </span>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <GlobalSearchBar />
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ key, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={key}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${active ? '' : 'hover:opacity-80'}`}
              style={{
                background: active ? 'var(--mizan-emerald)' : 'transparent',
                color: active ? 'white' : 'var(--mizan-text-secondary)',
              }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{t(`nav.${key}`)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 pb-4">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${location.pathname === '/settings' ? '' : 'hover:opacity-80'}`}
          style={{
            background: location.pathname === '/settings' ? 'var(--mizan-emerald)' : 'transparent',
            color: location.pathname === '/settings' ? 'white' : 'var(--mizan-text-secondary)',
          }}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span>{t('nav.settings')}</span>
        </Link>
      </div>
    </aside>
  );
}