'use client';

import React from 'react';

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

export default function DraftTable({ drafts }: DraftTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Comment ID</th>
          <th>Intent</th>
          <th>Status</th>
          <th>Draft</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        {drafts.map((draft) => (
          <tr key={draft.id}>
            <td>{draft.igCommentId}</td>
            <td>{draft.intent}</td>
            <td>{draft.status}</td>
            <td>{draft.aiDraft}</td>
            <td>{draft.createdAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
