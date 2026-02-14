'use client';

import React, { useState } from 'react';

import DraftTable, { type DraftHistoryItem } from '@/components/drafts/draft-table';

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
    <div>
      <h2>답변 기록</h2>
      <button type="button" onClick={() => void loadHistory()}>
        기록 불러오기
      </button>
      <p>{statusMessage}</p>
      <DraftTable drafts={drafts} />
    </div>
  );
}
