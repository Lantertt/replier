'use client';

import React from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function DashboardUserMenu() {
  return (
    <>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <Button asChild size="sm" variant="outline" className="h-9 rounded-full px-3">
          <Link href="/sign-in" className="inline-flex items-center gap-1.5">
            <LogIn className="h-4 w-4" />
            로그인
          </Link>
        </Button>
      </SignedOut>
    </>
  );
}
