'use client';

import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface DraftHistoryItem {
  id: string;
  igCommentId: string;
  intent: string;
  status: string;
  aiDraft: string;
  createdAt: string;
}

interface DraftTableProps {
  drafts: DraftHistoryItem[];
}

function statusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'published') return 'default';
  if (status === 'hold') return 'secondary';
  return 'outline';
}

export default function DraftTable({ drafts }: DraftTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Comment ID</TableHead>
          <TableHead>Intent</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Draft</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drafts.length === 0 ? (
          <TableRow>
            <TableCell className="py-10 text-center text-sm text-[hsl(var(--muted-foreground))]" colSpan={5}>
              아직 저장된 Draft 기록이 없습니다.
            </TableCell>
          </TableRow>
        ) : null}

        {drafts.map((draft) => (
          <TableRow key={draft.id}>
            <TableCell className="font-medium text-[hsl(var(--foreground))]">{draft.igCommentId}</TableCell>
            <TableCell>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px]">
                {draft.intent}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant(draft.status)} className="rounded-full px-3 py-1 text-[10px]">
                {draft.status}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[360px] text-sm leading-relaxed text-[hsl(var(--foreground))/0.84]">{draft.aiDraft}</TableCell>
            <TableCell className="text-xs text-[hsl(var(--muted-foreground))]">{draft.createdAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
