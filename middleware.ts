import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { isProtectedPath } from '@/lib/protected-routes';

const shouldSkipClerk = process.env.SKIP_CLERK === 'true';

const middleware = shouldSkipClerk
  ? () => {
    return NextResponse.next();
  }
  : clerkMiddleware(async (auth, request) => {
    if (isProtectedPath(request.nextUrl.pathname)) {
      await auth.protect();
    }

    return NextResponse.next();
  });

export default middleware;

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
