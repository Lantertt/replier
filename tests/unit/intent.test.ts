import { describe, expect, it } from 'vitest';
import { classifyIntent } from '@/lib/ai/intent';

describe('classifyIntent', () => {
  it('returns lead for purchase questions', () => {
    expect(classifyIntent('어디서 사요? 할인코드 있나요?')).toBe('lead');
  });

  it('returns risk for complaint comments', () => {
    expect(classifyIntent('배송이 너무 늦고 트러블 났어요')).toBe('risk');
  });
});
