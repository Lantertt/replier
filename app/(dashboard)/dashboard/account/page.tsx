'use client';

import React, { useEffect, useState } from 'react';

import ConnectionCard from '@/components/account/connection-card';

interface AccountPayload {
  account: {
    igUserId: string;
    username: string;
  } | null;
}

export default function AccountPage() {
  const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID || '';
  const facebookSdkInitScript = `
    window.fbAsyncInit = function() {
      FB.init({
        appId: ${JSON.stringify(metaAppId)},
        cookie: true,
        xfbml: true,
        version: 'v23.0'
      });
      FB.AppEvents.logPageView();
    };
  `;

  const [account, setAccount] = useState<AccountPayload['account']>(null);
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

        setAccount(data.account);
        if (data.account) {
          setStatusMessage(`연결됨: @${data.account.username} (${data.account.igUserId})`);
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

  return (
    <div className="space-y-6">
      {metaAppId ? (
        <>
          <script id="facebook-jssdk-init" dangerouslySetInnerHTML={{ __html: facebookSdkInitScript }} />
          <script
            id="facebook-jssdk"
            async
            defer
            crossOrigin="anonymous"
            src="https://connect.facebook.net/en_US/sdk.js"
          />
        </>
      ) : null}

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
      <ConnectionCard connected={Boolean(account)} username={account?.username} igUserId={account?.igUserId} />
    </div>
  );
}
