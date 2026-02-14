'use client';

import React from 'react';

export interface PostItem {
  id: string;
  caption: string | null;
}

interface PostListProps {
  posts: PostItem[];
  selectedPostId: string | null;
  onSelect: (postId: string) => void;
}

export default function PostList({ posts, selectedPostId, onSelect }: PostListProps) {
  return (
    <section>
      <h3>게시물 목록</h3>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <button type="button" onClick={() => onSelect(post.id)}>
              {selectedPostId === post.id ? '[선택] ' : ''}
              {post.caption || post.id}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
