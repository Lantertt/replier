import React from 'react';

import ConnectionCard from '@/components/account/connection-card';

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Account</p>
        <h2 className="ink-heading text-3xl">계정 연결</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          사용자 OAuth 승인 후 `ig_user_id`가 저장되고, 관리자 컨텍스트 매핑에 사용됩니다.
        </p>
      </div>
      <ConnectionCard connected={false} />
    </div>
  );
}
