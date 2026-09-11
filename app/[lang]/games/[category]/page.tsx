import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale, getDictionary, categoryHref, href } from '@/lib/i18n';
import { games, categories } from '@/content/games.generated';
import GameCard from '@/components/GameCard';
import SubscribeCta from '@/components/SubscribeCta';
import styles from '../catalog.module.css';

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => categories.map((c) => ({ lang, category: c.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}): Promise<Metadata> {
  const { lang, category } = await params;
  const locale = isLocale(lang) ? (lang as Locale) : 'es';
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return {};
  const t = getDictionary(locale);
  return {
    title: cat.label[locale],
    description: t.seo.gameCategory(cat.label[locale], cat.count),
    alternates: {
      canonical: `/${locale}/games/${cat.slug}/`,
      languages: {
        es: `/es/games/${cat.slug}/`,
        en: `/en/games/${cat.slug}/`,
        'x-default': `/es/games/${cat.slug}/`,
      },
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}) {
  const { lang, category } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const t = getDictionary(locale);
  const list = games.filter((g) => g.category === cat.slug);

  return (
    <>
      <div className={styles.shell}>
        <h1 className={styles.title}>{cat.label[locale]}</h1>
        <p className={styles.sub}>{t.catalog.subtitle}</p>
        <p className={styles.count}>{t.catalog.count(list.length)}</p>

        <ul className={styles.filters}>
          <li>
            <Link href={href(locale, 'games')} className={styles.chip}>
              {t.catalog.all} <span className={styles.chipCount}>{games.length}</span>
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={categoryHref(locale, c.slug)}
                className={styles.chip}
                data-active={c.slug === cat.slug ? 'true' : undefined}
              >
                {c.label[locale]} <span className={styles.chipCount}>{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>

        {list.length ? (
          <ul className={styles.grid}>
            {list.map((g, i) => (
              <li key={g.slug}>
                <GameCard game={g} lang={locale} size="grid" priority={i < 5} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>{t.catalog.empty}</p>
        )}
      </div>

      <div className={styles.ctaBlock}>
        <SubscribeCta lang={locale} />
      </div>
    </>
  );
}
