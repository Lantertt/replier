'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInView() {
  return <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />;
}
