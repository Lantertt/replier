'use client';

import React, { useMemo, useState } from 'react';

import CommentList, { type CommentItem } from '@/components/posts-comments/comment-list';
import PostList, { type PostItem } from '@/components/posts-comments/post-list';
import ReplyPanel from '@/components/posts-comments/reply-panel';
import { Button } from '@/components/ui/button';

export default function PostsCommentsPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedComment, setSelectedComment] = useState<CommentItem | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const selectedPostCaption = useMemo(() => posts.find((post) => post.id === selectedPostId)?.caption ?? '', [posts, selectedPostId]);

  async function loadPosts() {
    setLoading(true);
    try {
      const response = await fetch('/api/instagram/posts');
      if (!response.ok) {
        throw new Error('게시물 불러오기에 실패했습니다.');
      }
      const data = (await response.json()) as { posts: PostItem[] };
      setPosts(data.posts);
      setStatusMessage(`게시물 ${data.posts.length}개를 불러왔습니다.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectPost(postId: string) {
    setSelectedPostId(postId);
    setSelectedComment(null);
    setDraft('');
    setLoading(true);

    try {
      const response = await fetch(`/api/instagram/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error('댓글 불러오기에 실패했습니다.');
      }
      const data = (await response.json()) as { comments: CommentItem[] };
      setComments(data.comments);
      setStatusMessage(`댓글 ${data.comments.length}개를 불러왔습니다.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateDraft() {
    if (!selectedComment || !selectedPostId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/replies/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          igCommentId: selectedComment.id,
          commentText: selectedComment.text,
          postId: selectedPostId,
        }),
      });
      if (!response.ok) {
        throw new Error('AI Draft 생성에 실패했습니다.');
      }

      const data = (await response.json()) as { draft: { aiDraft: string; status: string } };
      setDraft(data.draft.aiDraft);
      setStatusMessage(`초안 생성 완료 (status: ${data.draft.status})`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!selectedComment || !draft.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/replies/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          igCommentId: selectedComment.id,
          message: draft,
        }),
      });
      if (!response.ok) {
        throw new Error('Publish에 실패했습니다.');
      }
      setStatusMessage('댓글 답글을 게시했습니다.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Operations</p>
          <h2 className="ink-heading text-3xl">게시물 &amp; 댓글</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            게시물 선택 → 댓글 조회 → AI Draft 생성 → Publish 순서로 실시간 대응합니다.
          </p>
        </div>
        <Button type="button" onClick={() => void loadPosts()} disabled={loading} size="lg" className="rounded-full px-6">
          게시물 불러오기
        </Button>
      </div>

      {selectedPostId ? (
        <p className="rounded-2xl border border-[hsl(var(--border))/0.8] bg-[hsl(var(--secondary))/0.5] px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
          선택된 게시물: <span className="font-semibold text-[hsl(var(--foreground))]">{selectedPostCaption || selectedPostId}</span>
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1fr_1.1fr]">
        <PostList posts={posts} selectedPostId={selectedPostId} onSelect={(postId) => void handleSelectPost(postId)} />
        <CommentList
          comments={comments}
          selectedCommentId={selectedComment?.id ?? null}
          onSelect={(comment) => setSelectedComment(comment)}
        />
        <ReplyPanel
          selectedCommentId={selectedComment?.id ?? null}
          draft={draft}
          onDraftChange={setDraft}
          onGenerateDraft={handleGenerateDraft}
          onPublish={handlePublish}
          loading={loading}
          statusMessage={statusMessage}
        />
      </div>
    </div>
  );
}
