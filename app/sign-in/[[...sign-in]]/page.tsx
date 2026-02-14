export default async function SignInPage() {
  if (process.env.SKIP_CLERK === 'true') {
    return (
      <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">SKIP_CLERK 모드에서는 로그인 화면을 렌더링하지 않습니다.</p>
      </main>
    );
  }

  const clerk = await import('@clerk/nextjs');
  const SignIn = clerk.SignIn;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
    </main>
  );
}
