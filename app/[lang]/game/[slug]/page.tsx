import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale, getDictionary, categoryHref, href } from '@/lib/i18n';
import { games, categories, gameBySlug } from '@/content/games.generated';
import { gameDesc } from '@/lib/describe';
import SubscribeCta from '@/components/SubscribeCta';
import Rail from '@/components/Rail';
import styles from './game.module.css';

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => games.map((g) => ({ lang, slug: g.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? (lang as Locale) : 'es';
  const game = gameBySlug(slug);
  if (!game) return {};
  return {
    title: game.title,
    description: gameDesc(locale, game.slug, game.descEn).slice(0, 155),
    alternates: {
      canonical: `/${locale}/game/${game.slug}/`,
      languages: {
        es: `/es/game/${game.slug}/`,
        en: `/en/game/${game.slug}/`,
        'x-default': `/es/game/${game.slug}/`,
      },
    },
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const game = gameBySlug(slug);
  if (!game) notFound();

  const t = getDictionary(locale);
  const cat = categories.find((c) => c.slug === game.category);
  const related = games
    .filter((g) => g.category === game.category && g.slug !== game.slug)
    .slice(0, 12);

  return (
    <>
      <article className={styles.shell}>
        <p className={styles.crumbs}>
          <Link href={href(locale, 'games')}>{t.catalog.title}</Link>
          <span aria-hidden="true"> / </span>
          {cat ? <Link href={categoryHref(locale, cat.slug)}>{cat.label[locale]}</Link> : null}
        </p>

        <div className={styles.layout}>
          <div className={styles.artWrap}>
            {game.imageLg ? (
              <Image
                src={game.imageLg}
                alt={game.title}
                width={1200}
                height={675}
                className={styles.art}
                sizes="(max-width: 900px) 100vw, 640px"
                priority
              />
            ) : (
              <div className={styles.artFallback} aria-hidden="true" />
            )}
          </div>

          <div className={styles.info}>
            <h1 className={styles.title}>{game.title}</h1>

            <p className={styles.tags}>
              {cat ? (
                <Link href={categoryHref(locale, cat.slug)} className={styles.tag}>
                  {cat.label[locale]}
                </Link>
              ) : null}
              {game.year ? (
                <span className={styles.year}>
                  {t.catalog.released} {game.year}
                </span>
              ) : null}
            </p>

            <p className={styles.desc}>{gameDesc(locale, game.slug, game.descEn)}</p>

            <p className={styles.html5}>{t.home.html5}</p>

            {/* The demo genuinely plays, on our own URL. The note next to it says
                plainly what is free and what is not, so neither claim can mislead. */}
            {game.playUrl && game.demoSafe ? (
              <p className={styles.playRow}>
                <Link href={`/${locale}/play/${game.slug}/`} className={styles.play}>
                  {t.catalog.play}
                </Link>
              </p>
            ) : null}
            <p className={styles.gate}>
              {game.demoSafe ? t.catalog.playNote : t.catalog.noDemo}
            </p>
            <SubscribeCta lang={locale} />
          </div>
        </div>
      </article>

      {related.length ? (
        <Rail title={t.catalog.more} games={related} lang={locale} seeAllHref={cat ? categoryHref(locale, cat.slug) : undefined} />
      ) : null}
    </>
  );
}
