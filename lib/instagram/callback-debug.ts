import crypto from 'node:crypto';

interface BuildDebugMetaArgs {
  requestId: string;
  requestUrl: string;
  code: string | null;
  state: string | null;
  headers: Headers;
  now?: Date;
}

export function fingerprintValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16);
}

export function buildInstagramCallbackDebugMeta({
  requestId,
  requestUrl,
  code,
  state,
  headers,
  now = new Date(),
}: BuildDebugMetaArgs) {
  const url = new URL(requestUrl);

  return {
    requestId,
    at: now.toISOString(),
    path: url.pathname,
    codeLength: code?.length ?? 0,
    codeFingerprint: code ? fingerprintValue(code) : null,
    stateLength: state?.length ?? 0,
    stateFingerprint: state ? fingerprintValue(state) : null,
    userAgent: headers.get('user-agent'),
    forwardedFor: headers.get('x-forwarded-for'),
    referer: headers.get('referer'),
  };
}
