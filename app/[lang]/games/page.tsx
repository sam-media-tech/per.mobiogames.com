import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale, getDictionary, categoryHref, href } from '@/lib/i18n';
import { games, categories } from '@/content/games.generated';
import GameCard from '@/components/GameCard';
import SubscribeCta from '@/components/SubscribeCta';
import styles from './catalog.module.css';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? (lang as Locale) : 'es';
  const t = getDictionary(locale);
  return {
    title: t.catalog.title,
    description: t.catalog.subtitle,
    alternates: {
      canonical: `/${locale}/games/`,
      languages: { es: '/es/games/', en: '/en/games/', 'x-default': '/es/games/' },
    },
  };
}

export default async function GamesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = getDictionary(locale);

  return (
    <>
      <div className={styles.shell}>
        <h1 className={styles.title}>{t.catalog.title}</h1>
        <p className={styles.sub}>{t.catalog.subtitle}</p>
        <p className={styles.count}>{t.catalog.count(games.length)}</p>

        <ul className={styles.filters}>
          <li>
            <Link href={href(locale, 'games')} className={styles.chip} data-active="true">
              {t.catalog.all} <span className={styles.chipCount}>{games.length}</span>
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={categoryHref(locale, c.slug)} className={styles.chip}>
                {c.label[locale]} <span className={styles.chipCount}>{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>

        <ul className={styles.grid}>
          {games.map((g, i) => (
            <li key={g.slug}>
              <GameCard game={g} lang={locale} size="grid" priority={i < 5} />
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.ctaBlock}>
        <SubscribeCta lang={locale} />
      </div>
    </>
  );
}
