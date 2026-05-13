import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomTabs from './BottomTabs';

export default function AppLayout() {
  return (
    <div className="mizan-pattern-bg min-h-screen" style={{ background: 'var(--mizan-bg)' }}>
      <Sidebar />
      <BottomTabs />
      <main className="relative z-10 lg:ml-64 pb-20 lg:pb-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}