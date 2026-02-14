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

const BASE_SYSTEM_PROMPT = `You are a senior social commerce prompt engineer.
Create an operational reply prompt for Instagram comment response assistants.

Rules:
- Output in Korean.
- Make the prompt directly usable as an instruction block for an AI replier.
- Keep it concise but practical for production operations.
- Include clear sections:
  1) Brand/Product Positioning
  2) Tone and Safety Rules
  3) Comment Intent Handling Rules
  4) CTA and conversion style
  5) Forbidden response patterns
- Do not include markdown code fences.
- Do not include implementation explanation.`;

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

  const model = process.env.OPERATIONAL_PROMPT_MODEL || 'gpt-4.1-mini';
  const userPayload = {
    productName: input.productName,
    productInfo: input.productInfo,
    audienceInfo: input.audienceInfo ?? '',
    additionalRequirements: input.additionalRequirements ?? '',
  };

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: BASE_SYSTEM_PROMPT }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: JSON.stringify(userPayload, null, 2) }],
        },
      ],
      max_output_tokens: 1200,
      temperature: 0.4,
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

  return extractResponseText(payload);
}
