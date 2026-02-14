import React from 'react';
import type { ReactNode } from 'react';

import DashboardHeader from '@/components/dashboard/header';
import Sidebar from '@/components/dashboard/sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <DashboardHeader />
      <div>
        <Sidebar isAdmin />
        <main>{children}</main>
      </div>
    </div>
  );
}
