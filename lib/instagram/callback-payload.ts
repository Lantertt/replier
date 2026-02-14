type CallbackPayloadValue = string | string[];

export function buildInstagramCallbackPayload(searchParams: URLSearchParams): Record<string, CallbackPayloadValue> {
  const payload: Record<string, CallbackPayloadValue> = {};

  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key);
    payload[key] = values.length > 1 ? values : values[0] ?? '';
  }

  return payload;
}

export function shouldLogInstagramCallbackPayload(env: NodeJS.ProcessEnv): boolean {
  if (env.DEBUG_INSTAGRAM_CALLBACK_PAYLOAD === 'true') {
    return true;
  }

  return env.NODE_ENV !== 'production';
}
