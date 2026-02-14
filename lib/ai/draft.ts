import type { Intent } from '@/lib/ai/intent';

export interface DraftContext {
  productName: string;
  uspText: string;
  salesLink: string;
  discountCode: string;
  requiredKeywords: string[];
  bannedKeywords: string[];
  toneNotes: string;
}

export interface GenerateDraftInput {
  commentText: string;
  intent: Intent;
  context: DraftContext;
}

function sanitizeBannedWords(text: string, bannedKeywords: string[]): string {
  return bannedKeywords.reduce((acc, keyword) => {
    if (!keyword) return acc;
    return acc.split(keyword).join('');
  }, text);
}

function requiredKeywordsPhrase(requiredKeywords: string[]): string {
  if (requiredKeywords.length === 0) {
    return '';
  }

  return ` ${requiredKeywords.join(', ')} 포인트도 참고해 주세요.`;
}

export function generateDraft(input: GenerateDraftInput): string {
  const { commentText, intent, context } = input;

  let draft = '';

  if (intent === 'lead') {
    draft = `문의 주셔서 감사해요. ${context.productName}는 ${context.uspText}에 도움을 주는 제품이에요. 구매는 ${context.salesLink} 에서 가능하고, 할인코드는 ${context.discountCode} 입니다.${requiredKeywordsPhrase(context.requiredKeywords)}`;
  } else if (intent === 'qa') {
    draft = `좋은 질문 감사해요. ${context.productName}는 ${context.uspText} 중심으로 안내드릴 수 있어요.${requiredKeywordsPhrase(context.requiredKeywords)} 자세한 정보는 ${context.salesLink} 에서 확인해 주세요.`;
  } else if (intent === 'reaction') {
    draft = `좋게 봐주셔서 감사해요. ${context.productName}도 관심 가져주셔서 고마워요.`;
  } else {
    draft = `불편을 드려 죄송해요. 해당 내용은 담당자와 확인해서 정확하게 다시 안내드릴게요.`;
  }

  const withTone = `${draft} (${context.toneNotes})`;
  const sanitized = sanitizeBannedWords(withTone, context.bannedKeywords);

  return `${sanitized}\n원댓글: ${commentText}`;
}
