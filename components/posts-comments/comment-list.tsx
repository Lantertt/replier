'use client';

import React from 'react';

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
    <section>
      <h3>댓글 목록</h3>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <button type="button" onClick={() => onSelect(comment)}>
              {selectedCommentId === comment.id ? '[선택] ' : ''}
              @{comment.username}: {comment.text}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
