import React from 'react';

import AdContextForm from '@/components/admin/ad-context-form';
import PromptManagement from '@/components/admin/prompt-management';

export default function AdminContextPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Admin</p>
        <h2 className="ink-heading text-3xl">광고 컨텍스트</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          사용자 인스타 ID 기준으로 제품/키워드/톤 정보를 저장하고 Draft 생성 시 자동 주입합니다.
        </p>
      </div>
      <AdContextForm />
      <PromptManagement />
    </div>
  );
}
