import React from 'react';

import PromptManagement from '@/components/admin/prompt-management';

export default function AdminContextPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Admin</p>
        <h2 className="ink-heading text-3xl">운영 프롬프트 관리</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          제품 정보 기반 운영 프롬프트를 관리하고 사용자별 사용 권한을 설정합니다.
        </p>
      </div>
      <PromptManagement />
    </div>
  );
}
