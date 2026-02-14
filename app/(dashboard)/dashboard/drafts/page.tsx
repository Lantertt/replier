'use client';

import React, { useState } from 'react';

import DraftTable, { type DraftHistoryItem } from '@/components/drafts/draft-table';
import { Button } from '@/components/ui/button';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftHistoryItem[]>([]);
  const [statusMessage, setStatusMessage] = useState('');

  async function loadHistory() {
    try {
      const response = await fetch('/api/replies/history');
      if (!response.ok) {
        throw new Error('기록 불러오기에 실패했습니다.');
      }

      const data = (await response.json()) as { drafts: DraftHistoryItem[] };
      setDrafts(data.drafts);
      setStatusMessage(`답변 기록 ${data.drafts.length}개를 불러왔습니다.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">History</p>
          <h2 className="ink-heading text-3xl">답변 기록</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            생성/보류/게시 상태를 시간순으로 점검하고 다음 액션을 계획하세요.
          </p>
        </div>
        <Button type="button" onClick={() => void loadHistory()} size="lg" className="rounded-full px-6">
          기록 불러오기
        </Button>
      </div>

      {statusMessage ? (
        <p className="rounded-2xl border border-[hsl(var(--border))/0.8] bg-[hsl(var(--secondary))/0.6] px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
          {statusMessage}
        </p>
      ) : null}

      <DraftTable drafts={drafts} />
    </div>
  );
}
