import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateDraft, generateDraftFromPrompt } from '@/lib/ai/draft';

describe('generateDraft', () => {
  it('injects link and discount for lead intent', () => {
    const draft = generateDraft({
      commentText: '어디서 사요?',
      intent: 'lead',
      context: {
        productName: 'Booster Pro',
        uspText: '피부결 개선',
        salesLink: 'https://example.com/product',
        discountCode: 'KBEAUTY10',
        requiredKeywords: ['진정'],
        bannedKeywords: ['완치'],
        toneNotes: '친근하고 짧게',
      },
    });

    expect(draft).toContain('https://example.com/product');
    expect(draft).toContain('KBEAUTY10');
  });
});

describe('generateDraftFromPrompt', () => {
  const originalApiKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalApiKey;
    vi.restoreAllMocks();
  });

  it('creates draft text from operational prompt via OpenAI responses API', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ output_text: '운영 프롬프트 기반 답변입니다.' }), { status: 200 }),
    );

    const draft = await generateDraftFromPrompt({
      commentText: '이거 어디서 사요?',
      intent: 'lead',
      operationalPrompt: '브랜드 톤 가이드',
    });

    expect(draft).toBe('운영 프롬프트 기반 답변입니다.');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, requestInit] = fetchMock.mock.calls[0];
    const payload = JSON.parse(String(requestInit?.body)) as Record<string, unknown>;
    expect(payload.temperature).toBeUndefined();
  });
});
