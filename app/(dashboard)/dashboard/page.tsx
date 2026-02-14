import React from 'react';
import Sidebar from '@/components/dashboard/sidebar';

export default function DashboardPage() {
  return (
    <div>
      <Sidebar isAdmin />
      <section>
        <h2>Dashboard</h2>
      </section>
    </div>
  );
}
