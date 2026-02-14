import React from 'react';

import SignUpView from './sign-up-view';

export default function SignUpPage() {
  if (process.env.SKIP_CLERK === 'true') {
    return (
      <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">SKIP_CLERK 모드에서는 회원가입 화면을 렌더링하지 않습니다.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
      <SignUpView />
    </main>
  );
}
