import React from 'react';
import Link from 'next/link';
import { ArrowRight, Instagram, LockKeyhole, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
      <Card className="w-full overflow-hidden">
        <CardContent className="relative p-10 sm:p-14">
          <div className="pointer-events-none absolute -right-16 top-0 h-52 w-52 rounded-full bg-[hsl(var(--accent))/0.2] blur-3xl" />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[hsl(var(--muted-foreground))]">K-Beauty Conversion System</p>
              <h1 className="ink-heading text-4xl leading-tight sm:text-5xl">
                댓글 응답을
                <br />
                매출 전환 플로우로 자동화하세요
              </h1>
              <p className="text-base leading-relaxed text-[hsl(var(--muted-foreground))]">
                사용자 OAuth 연동, 게시물/댓글 조회, AI 답글 생성, 실제 Publish까지 하나의 대시보드에서 처리합니다.
              </p>
              <p className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--secondary))/0.6] px-4 py-2 text-sm text-[hsl(var(--foreground))]">
                <LockKeyhole className="h-4 w-4 text-[hsl(var(--accent))]" />
                회원가입 후 로그인해야 대시보드와 계정 연결 기능을 사용할 수 있습니다.
              </p>
            </div>

            <div className="glass-panel space-y-4 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">Get Started</p>
              <Button asChild className="w-full justify-between rounded-full" size="lg">
                <Link href="/sign-up">
                  회원가입 시작
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between rounded-full" size="lg">
                <Link href="/sign-in">
                  로그인
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-between rounded-full" size="lg">
                <Link href="/dashboard">
                  <span className="inline-flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    대시보드 열기
                  </span>
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
