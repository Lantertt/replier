export type Intent = 'lead' | 'qa' | 'reaction' | 'risk';

export function classifyIntent(text: string): Intent {
  const normalized = text.toLowerCase();

  if (/환불|트러블|부작용|늦|불만|별로/.test(normalized)) {
    return 'risk';
  }

  if (/어디서|구매|할인|코드|링크|가격/.test(normalized)) {
    return 'lead';
  }

  if (/예뻐|좋아|대박|최고|사랑/.test(normalized)) {
    return 'reaction';
  }

  return 'qa';
}
