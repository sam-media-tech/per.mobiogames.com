import type { MetadataRoute } from 'next';
import { brand, LOCALES } from '@/lib/brand.config';
import { ROUTES, LP_URLS } from '@/lib/i18n';
import { games, categories } from '@/content/games.generated';
import { videos, videoCategories } from '@/content/videos.generated';

// The live site has no sitemap (and no robots.txt) — both currently 404.
// Every catalogue page is real, crawlable and listed here.

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${brand.domain}`;
  const urls: MetadataRoute.Sitemap = [];

  for (const lang of LOCALES) {
    for (const route of Object.values(ROUTES)) {
      urls.push({
        url: `${base}/${lang}/${route ? `${route}/` : ''}`,
        changeFrequency: route === '' ? 'daily' : 'monthly',
        priority: route === '' ? 1 : 0.6,
      });
    }
    for (const c of categories) {
      urls.push({ url: `${base}/${lang}/games/${c.slug}/`, changeFrequency: 'weekly', priority: 0.7 });
    }
    for (const g of games) {
      urls.push({ url: `${base}/${lang}/game/${g.slug}/`, changeFrequency: 'monthly', priority: 0.5 });
    }
    for (const g of games.filter((x) => x.demoSafe)) {
      urls.push({ url: `${base}/${lang}/play/${g.slug}/`, changeFrequency: 'monthly', priority: 0.4 });
    }
    for (const c of videoCategories) {
      urls.push({ url: `${base}/${lang}/videos/${c.slug}/`, changeFrequency: 'weekly', priority: 0.7 });
    }
    for (const v of videos) {
      urls.push({ url: `${base}/${lang}/video/${v.slug}/`, changeFrequency: 'monthly', priority: 0.5 });
    }
  }

  // Both landing-page routes. The Spanish one is the ad destination and keeps
  // its slash-less form; the English one is an ordinary trailing-slashed page.
  urls.push({ url: `${base}${LP_URLS.es}`, changeFrequency: 'weekly', priority: 0.9 });
  urls.push({ url: `${base}${LP_URLS.en}`, changeFrequency: 'weekly', priority: 0.7 });

  return urls;
}
