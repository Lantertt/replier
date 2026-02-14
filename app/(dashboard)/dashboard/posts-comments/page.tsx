'use client';

import React, { useEffect, useMemo, useState } from 'react';

import CommentList, { type CommentItem } from '@/components/posts-comments/comment-list';
import PostList, { type PostItem } from '@/components/posts-comments/post-list';
import ReplyPanel from '@/components/posts-comments/reply-panel';
import { Button } from '@/components/ui/button';

export default function PostsCommentsPage() {
  const [availablePrompts, setAvailablePrompts] = useState<Array<{ id: string; name: string; productName: string }>>([]);
  const [selectedPromptId, setSelectedPromptId] = useState('');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedComment, setSelectedComment] = useState<CommentItem | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const selectedPostCaption = useMemo(() => posts.find((post) => post.id === selectedPostId)?.caption ?? '', [posts, selectedPostId]);

  useEffect(() => {
    let mounted = true;

    async function loadAvailablePrompts() {
      try {
        const response = await fetch('/api/prompts/available');
        if (!response.ok) {
          throw new Error('사용 가능한 프롬프트 목록을 불러오지 못했습니다.');
        }
        const data = (await response.json()) as { prompts: Array<{ id: string; name: string; productName: string }> };
        if (!mounted) return;

        setAvailablePrompts(data.prompts);
        if (data.prompts.length > 0) {
          setSelectedPromptId(data.prompts[0].id);
        }
      } catch (error) {
        if (mounted) {
          setStatusMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
        }
      }
    }

    void loadAvailablePrompts();

    return () => {
      mounted = false;
    };
  }, []);

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
    if (!selectedPromptId) {
      setStatusMessage('사용 가능한 프롬프트가 없습니다. 관리자에게 권한 부여를 요청하세요.');
      return;
    }

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
          selectedPromptId,
        }),
      });
      if (!response.ok) {
        throw new Error('AI Draft 생성에 실패했습니다.');
      }

      const data = (await response.json()) as { draft: { aiDraft: string; status: string } };
      setDraft(data.draft.aiDraft);
      const promptName = availablePrompts.find((prompt) => prompt.id === selectedPromptId)?.name;
      setStatusMessage(`초안 생성 완료 (status: ${data.draft.status})${promptName ? ` · 프롬프트: ${promptName}` : ''}`);
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

      <div className="rounded-2xl border border-[hsl(var(--border))/0.8] bg-[hsl(var(--secondary))/0.45] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">사용 가능한 프롬프트</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <select
            value={selectedPromptId}
            onChange={(event) => setSelectedPromptId(event.target.value)}
            className="flex h-10 min-w-[260px] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))/0.7] px-3 py-2 text-sm text-[hsl(var(--foreground))] ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            {availablePrompts.length === 0 ? <option value="">권한 부여된 프롬프트 없음</option> : null}
            {availablePrompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.name} ({prompt.productName})
              </option>
            ))}
          </select>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            프롬프트 본문은 관리자만 볼 수 있으며, 사용자는 이름/제품명만 확인할 수 있습니다.
          </p>
        </div>
      </div>

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
