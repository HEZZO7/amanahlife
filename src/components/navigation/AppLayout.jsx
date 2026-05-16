import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomTabs from './BottomTabs';
import { useI18n } from '@/lib/i18n';

export default function AppLayout() {
  const { isRTL } = useI18n();
  const [isLarge, setIsLarge] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsLarge(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const mainStyle = isLarge
    ? { [isRTL ? 'marginRight' : 'marginLeft']: '16rem' }
    : {};

  return (
    <div className="mizan-pattern-bg min-h-screen" style={{ background: 'var(--mizan-bg)', width: '100vw', maxWidth: '100%', overflowX: 'hidden', margin: 0, padding: 0 }}>
      <Sidebar />
      <BottomTabs />
      <main
        className="relative z-10 pb-20 lg:pb-0 min-h-screen"
        style={{ ...mainStyle, width: '100%', overflowX: 'hidden' }}
      >
        <Outlet />
      </main>
    </div>
  );
}