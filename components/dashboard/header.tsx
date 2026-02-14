import React from 'react';
import { Sparkles } from 'lucide-react';

import DashboardUserMenu from '@/components/dashboard/user-menu';
import { Badge } from '@/components/ui/badge';

interface DashboardHeaderProps {
  showUserMenu?: boolean;
}

export default function DashboardHeader({ showUserMenu = false }: DashboardHeaderProps) {
  return (
    <header className="glass-panel relative overflow-hidden px-6 py-7">
      <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[hsl(var(--accent))/0.22] blur-2xl" />
      <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />
      {showUserMenu ? (
        <div className="absolute right-5 top-5 z-20">
          <span className="sr-only">프로필 메뉴</span>
          <DashboardUserMenu />
        </div>
      ) : null}
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">K-Beauty Ops Console</p>
          <h1 className="ink-heading text-3xl leading-none text-[hsl(var(--foreground))] sm:text-4xl">K-Beauty Reply Assistant</h1>
          <p className="max-w-2xl text-sm text-[hsl(var(--muted-foreground))]">
            댓글 응답, 광고 문맥 주입, 게시까지 한 화면에서 처리하는 인스타 전환 운영 대시보드
          </p>
        </div>
        <Badge className="w-fit gap-1.5 rounded-full px-4 py-1.5 text-xs" variant="secondary">
          <Sparkles className="h-3.5 w-3.5" />
          Live Conversion Mode
        </Badge>
      </div>
    </header>
  );
}
