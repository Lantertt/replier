import React from 'react';
import type { ReactNode } from 'react';

import DashboardHeader from '@/components/dashboard/header';
import Sidebar from '@/components/dashboard/sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute left-[8%] top-[20%] h-56 w-56 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute bottom-[8%] right-[12%] h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
      </div>

      <DashboardHeader />
      <div className="mt-6 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar isAdmin />
        <main className="glass-panel min-h-[70vh] p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
