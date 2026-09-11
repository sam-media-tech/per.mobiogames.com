import type { Locale } from './brand.config';
import { gameDescEs, videoDescEs } from '@/content/descriptions.es';

// The catalogue feeds carry English copy only. These resolve the Spanish text
// from the hand-written file, falling back to the source language so a missing
// translation degrades to readable English rather than to an empty page.

export const gameDesc = (lang: Locale, slug: string, fallback: string): string =>
  (lang === 'es' ? gameDescEs[slug] : undefined) ?? fallback;

export const videoDesc = (lang: Locale, slug: string, fallback: string): string =>
  (lang === 'es' ? videoDescEs[slug] : undefined) ?? fallback;
