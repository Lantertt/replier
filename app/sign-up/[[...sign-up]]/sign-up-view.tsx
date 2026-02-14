'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpView() {
  return <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />;
}
