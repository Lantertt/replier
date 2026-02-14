'use client';

import React from 'react';
import { WandSparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

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
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">답글 패널</CardTitle>
          <Badge variant={selectedCommentId ? 'secondary' : 'outline'} className="rounded-full px-3 py-1">
            {selectedCommentId ? `선택: ${selectedCommentId}` : '댓글 미선택'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          className="min-h-[210px]"
          placeholder="AI가 만든 초안이 이 영역에 표시됩니다."
        />

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void onGenerateDraft()} disabled={loading || !selectedCommentId}>
            <WandSparkles className="mr-2 h-4 w-4" />
            AI Draft 생성
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void onPublish()}
            disabled={loading || !selectedCommentId || !draft.trim()}
          >
            Publish
          </Button>
        </div>

        <p className="rounded-xl border border-[hsl(var(--border))/0.8] bg-[hsl(var(--secondary))/0.5] px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
          {statusMessage || 'AI Draft 생성 후 필요 시 수정하고 Publish 하세요.'}
        </p>
      </CardContent>
    </Card>
  );
}
