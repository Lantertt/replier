'use client';

import React from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">게시물 목록</CardTitle>
          <Badge variant="outline" className="rounded-full px-3 py-1">
            {posts.length} posts
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {posts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
            게시물을 불러오면 이 영역에 목록이 표시됩니다.
          </p>
        ) : null}

        {posts.map((post) => {
          const selected = selectedPostId === post.id;
          return (
            <Button
              key={post.id}
              type="button"
              variant={selected ? 'secondary' : 'ghost'}
              className="h-auto w-full justify-start rounded-2xl px-3 py-3 text-left"
              onClick={() => onSelect(post.id)}
            >
              <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
                {selected ? <Sparkles className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
              </span>
              <span className="line-clamp-2 text-sm leading-relaxed">{post.caption || post.id}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
