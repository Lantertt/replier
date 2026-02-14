'use client';

import React, { useState } from 'react';

interface FormState {
  targetIgUserId: string;
  productName: string;
  uspText: string;
  salesLink: string;
  discountCode: string;
  requiredKeywords: string;
  bannedKeywords: string;
  toneNotes: string;
}

const initialForm: FormState = {
  targetIgUserId: '',
  productName: '',
  uspText: '',
  salesLink: '',
  discountCode: '',
  requiredKeywords: '',
  bannedKeywords: '',
  toneNotes: '',
};

function splitKeywords(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdContextForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/ad-contexts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetIgUserId: form.targetIgUserId,
          productName: form.productName,
          uspText: form.uspText,
          salesLink: form.salesLink,
          discountCode: form.discountCode,
          requiredKeywords: splitKeywords(form.requiredKeywords),
          bannedKeywords: splitKeywords(form.bannedKeywords),
          toneNotes: form.toneNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('광고 컨텍스트 저장에 실패했습니다.');
      }

      setMessage('광고 컨텍스트를 저장했습니다.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function onFieldChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Instagram User ID
        <input
          value={form.targetIgUserId}
          onChange={(event) => onFieldChange('targetIgUserId', event.target.value)}
          required
        />
      </label>
      <label>
        Product Name
        <input value={form.productName} onChange={(event) => onFieldChange('productName', event.target.value)} required />
      </label>
      <label>
        USP
        <textarea value={form.uspText} onChange={(event) => onFieldChange('uspText', event.target.value)} required />
      </label>
      <label>
        Sales Link
        <input value={form.salesLink} onChange={(event) => onFieldChange('salesLink', event.target.value)} required />
      </label>
      <label>
        Discount Code
        <input
          value={form.discountCode}
          onChange={(event) => onFieldChange('discountCode', event.target.value)}
          required
        />
      </label>
      <label>
        Required Keywords (comma separated)
        <input
          value={form.requiredKeywords}
          onChange={(event) => onFieldChange('requiredKeywords', event.target.value)}
        />
      </label>
      <label>
        Banned Keywords (comma separated)
        <input value={form.bannedKeywords} onChange={(event) => onFieldChange('bannedKeywords', event.target.value)} />
      </label>
      <label>
        Tone Notes
        <textarea value={form.toneNotes} onChange={(event) => onFieldChange('toneNotes', event.target.value)} required />
      </label>

      <button type="submit" disabled={loading}>
        저장
      </button>
      <p>{message}</p>
    </form>
  );
}
