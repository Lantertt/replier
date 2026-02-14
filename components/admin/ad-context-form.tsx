'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">관리자 컨텍스트 주입</CardTitle>
        <CardDescription>사용자 Instagram ID별로 광고 정보와 금지어를 설정해 답글 품질을 고정합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="targetIgUserId">Instagram User ID</Label>
              <Input
                id="targetIgUserId"
                value={form.targetIgUserId}
                onChange={(event) => onFieldChange('targetIgUserId', event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={form.productName}
                onChange={(event) => onFieldChange('productName', event.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="uspText">USP</Label>
              <Textarea
                id="uspText"
                value={form.uspText}
                onChange={(event) => onFieldChange('uspText', event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salesLink">Sales Link</Label>
              <Input
                id="salesLink"
                value={form.salesLink}
                onChange={(event) => onFieldChange('salesLink', event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountCode">Discount Code</Label>
              <Input
                id="discountCode"
                value={form.discountCode}
                onChange={(event) => onFieldChange('discountCode', event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredKeywords">Required Keywords (comma separated)</Label>
              <Input
                id="requiredKeywords"
                value={form.requiredKeywords}
                onChange={(event) => onFieldChange('requiredKeywords', event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bannedKeywords">Banned Keywords (comma separated)</Label>
              <Input
                id="bannedKeywords"
                value={form.bannedKeywords}
                onChange={(event) => onFieldChange('bannedKeywords', event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="toneNotes">Tone Notes</Label>
              <Textarea
                id="toneNotes"
                value={form.toneNotes}
                onChange={(event) => onFieldChange('toneNotes', event.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={loading} className="px-6">
              저장
            </Button>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{message}</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
