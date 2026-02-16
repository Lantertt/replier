import React from 'react';
import { CheckCircle2, Link2, ShieldAlert } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ConnectionCardProps {
  username?: string;
  igUserId?: string;
  connected: boolean;
  accounts: {
    igUserId: string;
    username: string;
    isActive: boolean;
  }[];
  selectedIgUserId?: string;
  onSelectAccount?: (igUserId: string) => void;
  isSelecting?: boolean;
}

export default function ConnectionCard({
  username,
  igUserId,
  connected,
  accounts,
  selectedIgUserId,
  onSelectAccount,
  isSelecting = false,
}: ConnectionCardProps) {
  return (
    <Card className="relative overflow-hidden border-[hsl(var(--border))/0.7]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[hsl(var(--accent))/0.22] blur-2xl" />
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-2xl">Instagram 계정 상태</CardTitle>
          <Badge variant={connected ? 'secondary' : 'outline'} className="gap-1.5 rounded-full px-3 py-1">
            {connected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
            {connected ? '연결됨' : '미연결'}
          </Badge>
        </div>
        <CardDescription>OAuth 승인을 완료하면 게시물/댓글 조회 및 실제 답글 Publish가 활성화됩니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {connected ? (
          <div className="space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))/0.65] p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">현재 사용 중인 계정</p>
            <p className="mt-1 text-base font-semibold text-[hsl(var(--foreground))]">
              {username} <span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">({igUserId})</span>
            </p>
            {accounts.length > 1 && selectedIgUserId && onSelectAccount ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))]">
                  사용할 인스타 계정 선택
                </p>
                <select
                  value={selectedIgUserId}
                  onChange={(event) => onSelectAccount(event.target.value)}
                  disabled={isSelecting}
                  className="h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {accounts.map((accountOption) => (
                    <option key={accountOption.igUserId} value={accountOption.igUserId}>
                      @{accountOption.username} ({accountOption.igUserId})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  게시물 조회, 댓글 조회, 답글 발행은 여기서 선택한 계정으로 수행됩니다.
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--background))/0.6] p-4 text-sm text-[hsl(var(--muted-foreground))]">
            아직 연결된 인스타 계정이 없습니다.
          </p>
        )}

        <Button asChild className="h-11 px-6 text-sm font-semibold">
          <a href="/api/instagram/connect" className="gap-2" role="button">
            <Link2 className="h-4 w-4" />
            {connected ? 'Instagram 계정 추가/재연결' : 'Instagram 연결'}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
