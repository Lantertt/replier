'use client';

import React from 'react';
import { MessageSquareQuote } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface CommentItem {
  id: string;
  text: string;
  username: string;
}

interface CommentListProps {
  comments: CommentItem[];
  selectedCommentId: string | null;
  onSelect: (comment: CommentItem) => void;
}

export default function CommentList({ comments, selectedCommentId, onSelect }: CommentListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">댓글 목록</CardTitle>
          <Badge variant="outline" className="rounded-full px-3 py-1">
            {comments.length} comments
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {comments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
            게시물을 선택하면 댓글이 표시됩니다.
          </p>
        ) : null}

        {comments.map((comment) => {
          const selected = selectedCommentId === comment.id;
          return (
            <Button
              key={comment.id}
              type="button"
              variant={selected ? 'secondary' : 'ghost'}
              className="h-auto w-full justify-start rounded-2xl px-3 py-3 text-left"
              onClick={() => onSelect(comment)}
            >
              <span className="mr-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
                <MessageSquareQuote className="h-4 w-4" />
              </span>
              <span className="space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                  @{comment.username}
                </span>
                <span className="line-clamp-2 block text-sm leading-relaxed">{comment.text}</span>
              </span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
