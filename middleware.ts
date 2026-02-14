import { clerkMiddleware } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export default async function middleware(request: NextRequest) {
  if (process.env.SKIP_CLERK === 'true') {
    return NextResponse.next();
  }

  return clerkMiddleware()(request, {} as never);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
