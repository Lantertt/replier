'use client';

import React from 'react';

interface ReplyPanelProps {
  selectedCommentId: string | null;
  draft: string;
  onDraftChange: (value: string) => void;
  onGenerateDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  loading: boolean;
  statusMessage: string;
}

export default function ReplyPanel({
  selectedCommentId,
  draft,
  onDraftChange,
  onGenerateDraft,
  onPublish,
  loading,
  statusMessage,
}: ReplyPanelProps) {
  return (
    <section>
      <h3>답글 패널</h3>
      <p>{selectedCommentId ? `선택 댓글: ${selectedCommentId}` : '댓글을 선택해 주세요.'}</p>
      <textarea value={draft} onChange={(event) => onDraftChange(event.target.value)} rows={6} cols={50} />
      <div>
        <button type="button" onClick={() => void onGenerateDraft()} disabled={loading || !selectedCommentId}>
          AI Draft 생성
        </button>
        <button type="button" onClick={() => void onPublish()} disabled={loading || !selectedCommentId || !draft.trim()}>
          Publish
        </button>
      </div>
      <p>{statusMessage}</p>
    </section>
  );
}
