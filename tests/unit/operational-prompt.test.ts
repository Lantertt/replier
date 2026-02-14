import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateOperationalPrompt } from '@/lib/ai/operational-prompt';

describe('operational prompt generator', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    vi.restoreAllMocks();
  });

  it('calls OpenAI responses api with base system prompt and product info', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          output_text: 'generated prompt text',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    const result = await generateOperationalPrompt({
      productName: 'Vitamin C Serum',
      productInfo: '피부톤 개선, 민감성 피부 가능, 2주 사용 권장',
      audienceInfo: '20-35 여성',
    });

    expect(result).toBe('generated prompt text');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(String(requestUrl)).toBe('https://api.openai.com/v1/responses');
    expect(requestInit?.method).toBe('POST');
    const headers = requestInit?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer test-openai-key');
    expect(String(requestInit?.body)).toContain('Vitamin C Serum');
    expect(String(requestInit?.body)).toContain('피부톤 개선');
    expect(String(requestInit?.body)).toContain('SYSTEM PROMPT TEMPLATE:');
    const payload = JSON.parse(String(requestInit?.body)) as Record<string, unknown>;
    expect(payload.temperature).toBeUndefined();
  });

  it('throws detailed error when openai call fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'rate limit' } }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    await expect(
      generateOperationalPrompt({
        productName: 'A',
        productInfo: 'B',
      }),
    ).rejects.toThrow('rate limit');
  });
});
