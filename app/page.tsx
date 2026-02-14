import Link from 'next/link';
import { ArrowRight, Instagram } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
      <Card className="w-full overflow-hidden">
        <CardContent className="relative p-10 sm:p-14">
          <div className="pointer-events-none absolute -right-12 top-0 h-44 w-44 rounded-full bg-[hsl(var(--accent))/0.2] blur-3xl" />
          <div className="max-w-3xl space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[hsl(var(--muted-foreground))]">K-Beauty Conversion System</p>
            <h1 className="ink-heading text-4xl leading-tight sm:text-5xl">
              댓글 응답을
              <br />
              매출 전환으로 바꾸는 운영 대시보드
            </h1>
            <p className="text-base leading-relaxed text-[hsl(var(--muted-foreground))]">
              사용자 OAuth 연동, 게시물/댓글 조회, AI 답글 초안 생성, 실제 댓글 Publish를 하나의 플로우로 제공합니다.
            </p>
            <Button asChild size="lg" className="rounded-full px-7">
              <Link href="/dashboard" className="gap-2">
                <Instagram className="h-4 w-4" />
                대시보드 열기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
