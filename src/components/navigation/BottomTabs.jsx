import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import {
  LayoutDashboard, Wallet, Target, CalendarDays, Heart,
  Moon, Users, BookOpen, Briefcase, Activity, BarChart3, Settings, MoreHorizontal, X, Sparkles
} from 'lucide-react';

const MAIN_TABS = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard },
  { key: 'finance', path: '/finance', icon: Wallet },
  { key: 'ai', path: '/ai', icon: Sparkles },
  { key: 'planner', path: '/planner', icon: CalendarDays },
  { key: 'more', path: null, icon: MoreHorizontal },
];

const MORE_ITEMS = [
  { key: 'goals', path: '/goals', icon: Target },
  { key: 'spiritual', path: '/spiritual', icon: Heart },
  { key: 'ramadan', path: '/ramadan', icon: Moon },
  { key: 'family', path: '/family', icon: Users },
  { key: 'learning', path: '/learning', icon: BookOpen },
  { key: 'work', path: '/work', icon: Briefcase },
  { key: 'wellness', path: '/wellness', icon: Activity },
  { key: 'analytics', path: '/analytics', icon: BarChart3 },
  { key: 'settings', path: '/settings', icon: Settings },
];

export default function BottomTabs() {
  const { t } = useI18n();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }} />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-4 pb-8"
            style={{ background: 'var(--mizan-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--mizan-text)' }}>
                {t('nav.more')}
              </h3>
              <button onClick={() => setShowMore(false)}>
                <X className="w-5 h-5" style={{ color: 'var(--mizan-text-secondary)' }} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {MORE_ITEMS.map(({ key, path, icon: Icon }) => (
                <Link
                  key={key}
                  to={path}
                  onClick={() => setShowMore(false)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                  style={{
                    background: location.pathname === path ? 'var(--mizan-emerald)' : 'transparent',
                    color: location.pathname === path ? 'white' : 'var(--mizan-text-secondary)',
                  }}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{t(`nav.${key}`)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tab Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t"
        style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)' }}
      >
        <div className="flex items-center justify-around py-2 px-1 pb-[env(safe-area-inset-bottom,8px)]">
          {MAIN_TABS.map(({ key, path, icon: Icon }) => {
            const active = path ? location.pathname === path : showMore;
            const isMore = key === 'more';

            if (isMore) {
              return (
                <button
                  key={key}
                  onClick={() => setShowMore(!showMore)}
                  className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px]"
                  style={{ color: showMore ? 'var(--mizan-emerald)' : '#6B7280' }}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] font-medium">{t(`nav.${key}`)}</span>
                </button>
              );
            }

            return (
              <Link
                key={key}
                to={path}
                className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px]"
                style={{ color: active ? 'var(--mizan-emerald)' : '#6B7280' }}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-medium">{t(`nav.${key}`)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}