import { describe, expect, it } from 'vitest';
import { generateDraft } from '@/lib/ai/draft';

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
