const WORDS_PER_MINUTE = 200;

export function calculateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatReadingTime(body: string): string {
  const minutes = calculateReadingMinutes(body);
  return `${minutes} min read`;
}
