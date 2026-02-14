const PROTECTED_PREFIXES = ['/dashboard', '/api'];
const PUBLIC_API_PATHS = new Set(['/api/instagram/callback']);

export function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_API_PATHS.has(pathname)) {
    return false;
  }

  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
