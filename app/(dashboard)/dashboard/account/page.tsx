'use client';

import React, { useEffect, useState } from 'react';

import ConnectionCard from '@/components/account/connection-card';

interface ConnectedAccount {
  igUserId: string;
  username: string;
  isActive: boolean;
}

interface AccountPayload {
  account: {
    igUserId: string;
    username: string;
  } | null;
  accounts: ConnectedAccount[];
}

export default function AccountPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedIgUserId, setSelectedIgUserId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadAccountStatus() {
      try {
        const response = await fetch('/api/instagram/account');
        if (!response.ok) {
          throw new Error('계정 상태를 불러오지 못했습니다.');
        }

        const data = (await response.json()) as AccountPayload;
        if (!mounted) return;

        setAccounts(data.accounts ?? []);
        const selected = data.account ?? null;
        setSelectedIgUserId(selected?.igUserId ?? null);

        if (selected) {
          setStatusMessage(`연결됨: @${selected.username} (${selected.igUserId})`);
        }
      } catch {
        if (mounted) {
          setStatusMessage('연결 상태를 확인할 수 없어 수동 연결 버튼을 표시합니다.');
        }
      }
    }

    void loadAccountStatus();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSelectAccount(nextIgUserId: string) {
    if (!nextIgUserId || nextIgUserId === selectedIgUserId) {
      return;
    }

    const previousAccounts = accounts;
    const previousSelected = selectedIgUserId;
    const selectedAccount = accounts.find((accountOption) => accountOption.igUserId === nextIgUserId);

    setIsSelecting(true);
    setSelectedIgUserId(nextIgUserId);
    setAccounts((current) =>
      current.map((accountOption) => ({
        ...accountOption,
        isActive: accountOption.igUserId === nextIgUserId,
      })),
    );

    try {
      const response = await fetch('/api/instagram/account/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ igUserId: nextIgUserId }),
      });

      if (!response.ok) {
        throw new Error('계정 선택 변경에 실패했습니다.');
      }

      if (selectedAccount) {
        setStatusMessage(`사용 계정 변경됨: @${selectedAccount.username} (${selectedAccount.igUserId})`);
      }
    } catch {
      setAccounts(previousAccounts);
      setSelectedIgUserId(previousSelected);
      setStatusMessage('계정 선택 변경에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSelecting(false);
    }
  }

  const activeAccount = selectedIgUserId
    ? accounts.find((accountOption) => accountOption.igUserId === selectedIgUserId) ?? null
    : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Account</p>
        <h2 className="ink-heading text-3xl">계정 연결</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          사용자 OAuth 승인 후 `ig_user_id`가 저장되고, 관리자 컨텍스트 매핑에 사용됩니다.
        </p>
      </div>
      {statusMessage ? (
        <p className="rounded-2xl border border-[hsl(var(--border))/0.8] bg-[hsl(var(--secondary))/0.6] px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
          {statusMessage}
        </p>
      ) : null}
      <ConnectionCard
        connected={Boolean(activeAccount)}
        username={activeAccount?.username}
        igUserId={activeAccount?.igUserId}
        accounts={accounts}
        selectedIgUserId={activeAccount?.igUserId}
        onSelectAccount={handleSelectAccount}
        isSelecting={isSelecting}
      />
    </div>
  );
}
