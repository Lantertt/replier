'use client';

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { normalizeInstagramUsernames } from '@/lib/instagram/username';

interface PromptTemplateItem {
  id: string;
  name: string;
  productName: string;
  promptBody: string;
}

interface PromptAssignmentItem {
  id: string;
  targetIgUserId: string;
  targetUsername?: string;
  promptName: string;
  productName: string;
}

interface InstagramUserSuggestion {
  igUserId: string;
  username: string;
}

const initialGenerateForm = {
  name: '',
  productName: '',
  productInfo: '',
  audienceInfo: '',
  additionalRequirements: '',
};

const initialAssignmentForm = {
  targetUsernamesText: '',
  promptTemplateId: '',
  lookupUsername: '',
};

function parseUsernames(input: string): string[] {
  return normalizeInstagramUsernames(input.split(/[\n,]/g));
}

export default function PromptManagement() {
  const [prompts, setPrompts] = useState<PromptTemplateItem[]>([]);
  const [assignments, setAssignments] = useState<PromptAssignmentItem[]>([]);
  const [generateForm, setGenerateForm] = useState(initialGenerateForm);
  const [assignmentForm, setAssignmentForm] = useState(initialAssignmentForm);
  const [promptMessage, setPromptMessage] = useState('');
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameQuery, setUsernameQuery] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState<InstagramUserSuggestion[]>([]);
  const [showUsernameSuggestions, setShowUsernameSuggestions] = useState(false);
  const [isSearchingUsernames, setIsSearchingUsernames] = useState(false);

  async function loadPrompts() {
    const response = await fetch('/api/admin/prompts');
    if (!response.ok) {
      throw new Error('프롬프트 목록 불러오기에 실패했습니다.');
    }
    const data = (await response.json()) as { prompts: PromptTemplateItem[] };
    setPrompts(data.prompts);
  }

  async function loadAssignments(username: string) {
    const normalizedUsername = parseUsernames(username)[0];
    if (!normalizedUsername) {
      setAssignments([]);
      return;
    }

    const response = await fetch(`/api/admin/prompt-assignments?username=${encodeURIComponent(normalizedUsername)}`);
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

  useEffect(() => {
    const normalizedQuery = parseUsernames(usernameQuery)[0] ?? '';
    if (normalizedQuery.length < 2) {
      setUsernameSuggestions([]);
      setIsSearchingUsernames(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearchingUsernames(true);
      void fetch(`/api/admin/instagram-users?q=${encodeURIComponent(normalizedQuery)}`)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('username 검색에 실패했습니다.');
          }
          const data = (await response.json()) as { suggestions: InstagramUserSuggestion[] };
          setUsernameSuggestions(data.suggestions);
        })
        .catch(() => {
          setUsernameSuggestions([]);
        })
        .finally(() => {
          setIsSearchingUsernames(false);
        });
    }, 350);

    return () => clearTimeout(timer);
  }, [usernameQuery]);

  function appendUsernameSuggestion(username: string) {
    const current = parseUsernames(assignmentForm.targetUsernamesText);
    const next = Array.from(new Set([...current, username]));

    setAssignmentForm((prev) => ({
      ...prev,
      targetUsernamesText: next.map((value) => `@${value}`).join(', '),
    }));
    setUsernameQuery('');
    setUsernameSuggestions([]);
    setShowUsernameSuggestions(false);
  }

  async function handleGeneratePrompt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setPromptMessage('');

    try {
      const response = await fetch('/api/admin/prompts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generateForm),
      });
      if (!response.ok) {
        throw new Error('운영 프롬프트 생성에 실패했습니다.');
      }

      await loadPrompts();
      setGenerateForm(initialGenerateForm);
      setPromptMessage('운영 프롬프트를 생성하고 저장했습니다.');
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
      const targetUsernames = parseUsernames(assignmentForm.targetUsernamesText);
      if (targetUsernames.length === 0) {
        throw new Error('허용할 Instagram username을 1개 이상 입력해 주세요.');
      }

      const response = await fetch('/api/admin/prompt-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUsernames,
          promptTemplateId: assignmentForm.promptTemplateId,
        }),
      });
      if (!response.ok) {
        throw new Error('사용자 프롬프트 권한 부여에 실패했습니다.');
      }

      const data = (await response.json()) as { assignedCount?: number };
      const lookupTarget = parseUsernames(assignmentForm.lookupUsername)[0] || targetUsernames[0];
      await loadAssignments(lookupTarget);
      setAssignmentForm((prev) => ({
        ...prev,
        lookupUsername: lookupTarget,
      }));
      setAssignmentMessage(`${data.assignedCount ?? targetUsernames.length}개 IG 계정에 프롬프트 권한을 부여했습니다.`);
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
          <CardDescription>관리자는 제품정보를 넣어 운영용 프롬프트를 자동 생성하고 저장할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={handleGeneratePrompt}>
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">운영 프롬프트 자동 생성</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="promptName">프롬프트 이름</Label>
                <Input
                  id="promptName"
                  value={generateForm.name}
                  onChange={(event) => setGenerateForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promptProductName">제품명</Label>
                <Input
                  id="promptProductName"
                  value={generateForm.productName}
                  onChange={(event) => setGenerateForm((prev) => ({ ...prev, productName: event.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="productInfo">제품 정보</Label>
              <Textarea
                id="productInfo"
                value={generateForm.productInfo}
                onChange={(event) => setGenerateForm((prev) => ({ ...prev, productInfo: event.target.value }))}
                placeholder="제품 USP, 가격/혜택, 사용법, 주의사항 등"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="audienceInfo">타겟 고객 정보 (선택)</Label>
                <Input
                  id="audienceInfo"
                  value={generateForm.audienceInfo}
                  onChange={(event) => setGenerateForm((prev) => ({ ...prev, audienceInfo: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalRequirements">추가 요구사항 (선택)</Label>
                <Input
                  id="additionalRequirements"
                  value={generateForm.additionalRequirements}
                  onChange={(event) => setGenerateForm((prev) => ({ ...prev, additionalRequirements: event.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading}>
                운영 프롬프트 생성
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
          <CardDescription>관리자가 허용한 Instagram ID들만 해당 운영 프롬프트를 사용할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={handleAssignPrompt}>
            <div className="grid gap-4 md:grid-cols-2">
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
              <div className="space-y-2">
                <Label htmlFor="lookupUsername">권한 조회용 Instagram username</Label>
                <Input
                  id="lookupUsername"
                  value={assignmentForm.lookupUsername}
                  onChange={(event) => setAssignmentForm((prev) => ({ ...prev, lookupUsername: event.target.value }))}
                  placeholder="@creator_name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usernameSearch">Instagram username 검색</Label>
              <div className="relative">
                <Input
                  id="usernameSearch"
                  value={usernameQuery}
                  onFocus={() => setShowUsernameSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowUsernameSuggestions(false), 120);
                  }}
                  onChange={(event) => {
                    setUsernameQuery(event.target.value);
                    setShowUsernameSuggestions(true);
                  }}
                  placeholder="@creator_name"
                />
                {showUsernameSuggestions && (isSearchingUsernames || usernameSuggestions.length > 0) && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-[0_14px_35px_-18px_rgba(15,13,11,0.7)]">
                    {isSearchingUsernames ? (
                      <p className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">검색 중...</p>
                    ) : (
                      <ul className="max-h-60 overflow-auto">
                        {usernameSuggestions.map((suggestion) => (
                          <li key={suggestion.igUserId}>
                            <button
                              type="button"
                              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-[hsl(var(--secondary))/0.6]"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                appendUsernameSuggestion(suggestion.username);
                              }}
                            >
                              <span>@{suggestion.username}</span>
                              <span className="text-xs text-[hsl(var(--muted-foreground))]">{suggestion.igUserId}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetUsernamesText">허용할 Instagram username 목록</Label>
              <Textarea
                id="targetUsernamesText"
                value={assignmentForm.targetUsernamesText}
                onChange={(event) => setAssignmentForm((prev) => ({ ...prev, targetUsernamesText: event.target.value }))}
                placeholder="@creator_one, @creator_two"
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading || prompts.length === 0}>
                권한 부여
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!assignmentForm.lookupUsername}
                onClick={() => {
                  void loadAssignments(assignmentForm.lookupUsername).catch(() => {
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
                      사용자: @{assignment.targetUsername ?? 'unknown'} ({assignment.targetIgUserId}) · 제품: {assignment.productName}
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
