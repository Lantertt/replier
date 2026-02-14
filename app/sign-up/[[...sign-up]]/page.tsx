export default async function SignUpPage() {
  if (process.env.SKIP_CLERK === 'true') {
    return (
      <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">SKIP_CLERK 모드에서는 회원가입 화면을 렌더링하지 않습니다.</p>
      </main>
    );
  }

  const clerk = await import('@clerk/nextjs');
  const SignUp = clerk.SignUp;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
    </main>
  );
}
