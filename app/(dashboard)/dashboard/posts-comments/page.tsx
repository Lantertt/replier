'use client';

import React, { useState } from 'react';

import CommentList, { type CommentItem } from '@/components/posts-comments/comment-list';
import PostList, { type PostItem } from '@/components/posts-comments/post-list';
import ReplyPanel from '@/components/posts-comments/reply-panel';

export default function PostsCommentsPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedComment, setSelectedComment] = useState<CommentItem | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

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
    <div>
      <h2>게시물 &amp; 댓글</h2>
      <button type="button" onClick={() => void loadPosts()} disabled={loading}>
        게시물 불러오기
      </button>
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
  );
}
