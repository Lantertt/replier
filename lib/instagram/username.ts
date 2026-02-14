export function normalizeInstagramUsername(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value.trim().replace(/^@+/, '').toLowerCase();
}

export function normalizeInstagramUsernames(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => normalizeInstagramUsername(value)).filter(Boolean)));
}
