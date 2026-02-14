import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Bot, FileClock, Link2, MessageCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const quickLinks = [
  {
    href: '/dashboard/account',
    title: '계정 연결',
    description: 'Meta OAuth 승인 및 계정 연결 상태 확인',
    icon: Link2,
  },
  {
    href: '/dashboard/posts-comments',
    title: '게시물 & 댓글',
    description: '댓글 수집, AI Draft 생성, Publish 실행',
    icon: MessageCircle,
  },
  {
    href: '/dashboard/drafts',
    title: 'Draft 기록',
    description: '생성/보류/게시 상태 이력 추적',
    icon: FileClock,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Dashboard</p>
        <h2 className="ink-heading text-3xl">운영 개요</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          계정 연동부터 댓글 게시까지, 전환 목적형 댓글 운영 플로우를 빠르게 실행하세요.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-2xl">AI Reply Engine</CardTitle>
            <Badge className="rounded-full px-3 py-1" variant="secondary">
              <Bot className="mr-1.5 h-3.5 w-3.5" />
              Ready
            </Badge>
          </div>
          <CardDescription>
            Intent 분류 + 컨텍스트 주입 + 답변 초안 생성을 단일 파이프라인으로 동작시킵니다.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="group">
              <Card className="h-full transition group-hover:-translate-y-1 group-hover:border-[hsl(var(--accent))/0.45]">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[hsl(var(--foreground))]">{item.title}</h3>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{item.description}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
                    Open
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
