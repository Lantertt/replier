'use client';

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PromptTemplateItem {
  id: string;
  name: string;
  productName: string;
  promptBody: string;
}

interface PromptAssignmentItem {
  id: string;
  targetIgUserId: string;
  promptName: string;
  productName: string;
}

const initialPromptForm = {
  name: '',
  productName: '',
  promptBody: '',
};

const initialAssignmentForm = {
  targetIgUserId: '',
  promptTemplateId: '',
};

export default function PromptManagement() {
  const [prompts, setPrompts] = useState<PromptTemplateItem[]>([]);
  const [assignments, setAssignments] = useState<PromptAssignmentItem[]>([]);
  const [promptForm, setPromptForm] = useState(initialPromptForm);
  const [assignmentForm, setAssignmentForm] = useState(initialAssignmentForm);
  const [promptMessage, setPromptMessage] = useState('');
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadPrompts() {
    const response = await fetch('/api/admin/prompts');
    if (!response.ok) {
      throw new Error('프롬프트 목록 불러오기에 실패했습니다.');
    }
    const data = (await response.json()) as { prompts: PromptTemplateItem[] };
    setPrompts(data.prompts);
  }

  async function loadAssignments(igUserId: string) {
    if (!igUserId) {
      setAssignments([]);
      return;
    }

    const response = await fetch(`/api/admin/prompt-assignments?igUserId=${encodeURIComponent(igUserId)}`);
    if (!response.ok) {
      throw new Error('할당 목록 조회에 실패했습니다.');
    }
    const data = (await response.json()) as { assignments: PromptAssignmentItem[] };
    setAssignments(data.assignments);
  }

  useEffect(() => {
    void loadPrompts().catch(() => {
      setPromptMessage('프롬프트 목록을 불러오지 못했습니다.');
    });
  }, []);

  async function handleCreatePrompt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setPromptMessage('');

    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptForm),
      });
      if (!response.ok) {
        throw new Error('프롬프트 저장에 실패했습니다.');
      }
      await loadPrompts();
      setPromptForm(initialPromptForm);
      setPromptMessage('프롬프트를 저장했습니다.');
    } catch (error) {
      setPromptMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignPrompt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setAssignmentMessage('');

    try {
      const response = await fetch('/api/admin/prompt-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentForm),
      });
      if (!response.ok) {
        throw new Error('사용자 프롬프트 권한 부여에 실패했습니다.');
      }

      await loadAssignments(assignmentForm.targetIgUserId);
      setAssignmentMessage('사용자에게 프롬프트 권한을 부여했습니다.');
    } catch (error) {
      setAssignmentMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">프롬프트 템플릿 관리</CardTitle>
          <CardDescription>제품별 프롬프트 원문은 관리자만 확인하고 수정할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={handleCreatePrompt}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="promptName">프롬프트 이름</Label>
                <Input
                  id="promptName"
                  value={promptForm.name}
                  onChange={(event) => setPromptForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promptProductName">제품명</Label>
                <Input
                  id="promptProductName"
                  value={promptForm.productName}
                  onChange={(event) => setPromptForm((prev) => ({ ...prev, productName: event.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promptBody">프롬프트 본문</Label>
              <Textarea
                id="promptBody"
                value={promptForm.promptBody}
                onChange={(event) => setPromptForm((prev) => ({ ...prev, promptBody: event.target.value }))}
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading}>
                프롬프트 저장
              </Button>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{promptMessage}</p>
            </div>
          </form>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">등록된 프롬프트</p>
            {prompts.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">등록된 프롬프트가 없습니다.</p>
            ) : (
              <ul className="space-y-2">
                {prompts.map((prompt) => (
                  <li key={prompt.id} className="rounded-xl border border-[hsl(var(--border))/0.8] bg-[hsl(var(--secondary))/0.4] p-3">
                    <p className="text-sm font-semibold">{prompt.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">제품: {prompt.productName}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">사용자 프롬프트 권한 부여</CardTitle>
          <CardDescription>선택한 사용자(Instagram ID)가 사용할 수 있는 프롬프트 목록을 제어합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={handleAssignPrompt}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assignmentIgUserId">Instagram User ID</Label>
                <Input
                  id="assignmentIgUserId"
                  value={assignmentForm.targetIgUserId}
                  onChange={(event) => setAssignmentForm((prev) => ({ ...prev, targetIgUserId: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignmentPromptId">할당할 프롬프트</Label>
                <select
                  id="assignmentPromptId"
                  value={assignmentForm.promptTemplateId}
                  onChange={(event) => setAssignmentForm((prev) => ({ ...prev, promptTemplateId: event.target.value }))}
                  className="flex h-10 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))/0.7] px-3 py-2 text-sm text-[hsl(var(--foreground))] ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">프롬프트 선택</option>
                  {prompts.map((prompt) => (
                    <option key={prompt.id} value={prompt.id}>
                      {prompt.name} ({prompt.productName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading || prompts.length === 0}>
                권한 부여
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!assignmentForm.targetIgUserId}
                onClick={() => {
                  void loadAssignments(assignmentForm.targetIgUserId).catch(() => {
                    setAssignmentMessage('할당 목록 조회에 실패했습니다.');
                  });
                }}
              >
                사용자 권한 조회
              </Button>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{assignmentMessage}</p>
            </div>
          </form>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">현재 사용자 권한</p>
            {assignments.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">표시할 권한 정보가 없습니다.</p>
            ) : (
              <ul className="space-y-2">
                {assignments.map((assignment) => (
                  <li key={assignment.id} className="rounded-xl border border-[hsl(var(--border))/0.8] bg-[hsl(var(--secondary))/0.4] p-3">
                    <p className="text-sm font-semibold">{assignment.promptName}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      사용자: {assignment.targetIgUserId} · 제품: {assignment.productName}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
