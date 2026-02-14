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

interface GenerateDraftFromPromptInput {
  commentText: string;
  intent: Intent;
  operationalPrompt: string;
}

interface OpenAIResponsesPayload {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
}

function shouldLogPromptIO(): boolean {
  if (process.env.LOG_PROMPT_IO === 'true') {
    return true;
  }
  if (process.env.LOG_PROMPT_IO === 'false') {
    return false;
  }
  return process.env.NODE_ENV !== 'production';
}

function isGpt5OrHigher(model: string): boolean {
  const major = /^gpt-(\d+)/i.exec(model)?.[1];
  return major ? Number(major) >= 5 : false;
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

  const sanitized = sanitizeBannedWords(draft, context.bannedKeywords);
  const toneSuffix = context.toneNotes ? ' 친근하고 신뢰감 있는 톤으로 안내드릴게요.' : '';

  return `${sanitized}${toneSuffix}\n원댓글: ${commentText}`;
}

function extractResponseText(payload: OpenAIResponsesPayload): string {
  if (payload.output_text && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const combined = (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((item) => item.text ?? '')
    .join('\n')
    .trim();

  if (!combined) {
    throw new Error('OpenAI response contained no draft text');
  }

  return combined;
}

export async function generateDraftFromPrompt(input: GenerateDraftFromPromptInput): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }

  const model = process.env.REPLY_DRAFT_MODEL || 'gpt-5.2';
  const gpt5OrHigher = isGpt5OrHigher(model);
  const reasoning = gpt5OrHigher ? { effort: 'medium' as const } : undefined;
  const systemPrompt = [
    input.operationalPrompt,
    '출력 규칙:',
    '- 한국어로 작성한다.',
    '- 인스타그램 댓글 답글 형태로 1~3문장 이내로 작성한다.',
    '- 마크다운/코드블록/따옴표 없이 답글 본문만 출력한다.',
  ].join('\n');
  const userPrompt = `의도: ${input.intent}\n원댓글: ${input.commentText}`;
  const logEnabled = shouldLogPromptIO();
  if (logEnabled) {
    console.info(
      '[prompt-io] draft-generation input',
      JSON.stringify({
        model,
        reasoningEffort: reasoning?.effort,
        systemPrompt,
        userPrompt,
      }),
    );
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      ...(reasoning ? { reasoning } : {}),
      ...(gpt5OrHigher ? {} : { temperature: 0.5 }),
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: systemPrompt,
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: userPrompt,
            },
          ],
        },
      ],
      max_output_tokens: 400,
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI draft generation failed (${response.status}): ${raw}`);
  }

  let payload: OpenAIResponsesPayload;
  try {
    payload = JSON.parse(raw) as OpenAIResponsesPayload;
  } catch {
    throw new Error('Failed to parse OpenAI draft payload');
  }

  const generatedDraft = extractResponseText(payload);
  if (logEnabled) {
    console.info(
      '[prompt-io] draft-generation output',
      JSON.stringify({
        model,
        generatedDraft,
      }),
    );
  }

  return generatedDraft;
}
