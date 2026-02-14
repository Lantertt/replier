import { OPERATIONAL_SYSTEM_TEMPLATE_GENERATOR_PROMPT } from '@/lib/ai/prompts/operational-system-template-generator';

interface OperationalPromptInput {
  productName: string;
  productInfo: string;
  audienceInfo?: string;
  additionalRequirements?: string;
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

function extractResponseText(payload: OpenAIResponsesPayload): string {
  if (payload.output_text && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const collected = (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((item) => item.text ?? '')
    .join('\n')
    .trim();

  if (!collected) {
    throw new Error('OpenAI response contained no prompt text');
  }

  return collected;
}

export async function generateOperationalPrompt(input: OperationalPromptInput): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }

  const model = process.env.OPERATIONAL_PROMPT_MODEL || 'gpt-5.2';
  const gpt5OrHigher = isGpt5OrHigher(model);
  const reasoning = gpt5OrHigher ? { effort: 'medium' as const } : undefined;
  const productInformation = [
    `제품명: ${input.productName}`,
    `제품 정보: ${input.productInfo}`,
    input.audienceInfo ? `타겟 고객 정보: ${input.audienceInfo}` : '',
    input.additionalRequirements ? `추가 요구사항: ${input.additionalRequirements}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const logEnabled = shouldLogPromptIO();
  if (logEnabled) {
    console.info(
      '[prompt-io] operational-generation input',
      JSON.stringify({
        model,
        reasoningEffort: reasoning?.effort,
        systemPrompt: OPERATIONAL_SYSTEM_TEMPLATE_GENERATOR_PROMPT,
        productInformation,
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
      ...(gpt5OrHigher ? {} : { temperature: 0.4 }),
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: OPERATIONAL_SYSTEM_TEMPLATE_GENERATOR_PROMPT }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: productInformation }],
        },
      ],
      max_output_tokens: 1200,
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI prompt generation failed (${response.status}): ${raw}`);
  }

  let payload: OpenAIResponsesPayload;
  try {
    payload = JSON.parse(raw) as OpenAIResponsesPayload;
  } catch {
    throw new Error('Failed to parse OpenAI prompt generation payload');
  }

  const generatedPrompt = extractResponseText(payload);
  if (logEnabled) {
    console.info(
      '[prompt-io] operational-generation output',
      JSON.stringify({
        model,
        generatedPrompt,
      }),
    );
  }

  return generatedPrompt;
}
