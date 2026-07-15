export function maybeFixMojibake(text: string): string {
  if (!text) return text;
  try {
    return decodeURIComponent(escape(text));
  } catch {
    return text;
  }
}

export function hasMojibakeNoise(text: string): boolean {
  if (!text) return false;
  return /[\ufffd\u0080-\u00ff]/.test(text);
}

export function containsAnyKeyword(haystack: string, keywords: string[]): boolean {
  const h = haystack.toLowerCase();
  return keywords.some((k) => h.includes(k));
}

export function firstNonEmpty(...candidates: (string | undefined | null)[]): string {
  for (const c of candidates) {
    if (c !== undefined && c !== null && c.trim()) {
      return c.trim();
    }
  }
  return '';
}

export function hasCjk(text: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff\uac00-\ud7af]/.test(text || '');
}

export function isMostlyEnglish(text: string): boolean {
  const s = text || '';
  if (!s) return false;
  const englishChars = s.match(/[a-zA-Z]/g)?.length || 0;
  const totalChars = s.replace(/\s/g, '').length;
  if (totalChars === 0) return false;
  return englishChars / totalChars > 0.5;
}
