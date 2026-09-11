import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brand, type Locale } from '@/lib/brand.config';
import { isLocale, getDictionary, categoryHref, href } from '@/lib/i18n';
import { games, categories } from '@/content/games.generated';
import { videos } from '@/content/videos.generated';
import HeroCarousel from '@/components/HeroCarousel';
import Rail from '@/components/Rail';
import VideoRail from '@/components/VideoRail';
import SubscribeCta from '@/components/SubscribeCta';
import styles from './home.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? (lang as Locale) : 'es';
  const t = getDictionary(locale);
  return {
    // `absolute` so the home page is not "Home · BeyondVR" — it is the brand
    // page, and it is the one title the layout template must not decorate.
    title: { absolute: t.seo.homeTitle },
    description: t.seo.home,
    alternates: {
      canonical: `/${locale}/`,
      languages: { es: '/es/', en: '/en/', 'x-default': '/es/' },
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = getDictionary(locale);

  // Hand-picked hero slides — chosen for artwork that carries a full-bleed hero
  // at 1200px. Deterministic, so the carousel never reshuffles between builds.
  const HERO = [
    'basketball-stars-3',
    'ben-10-heatblast-fight',
    'beary-spot-on',
    'barbie-spy-squad-academy',
    'smurfy-coloring',
    'daisy-and-ollie-matching-pairs',
  ];
  const slides = HERO.map((slug) => games.find((g) => g.slug === slug)).filter(
    (g): g is (typeof games)[number] => Boolean(g && g.imageLg),
  );

  const newest = games.filter((g) => g.category === 'novedades');
  // Destacados must not repeat what the Novedades rail already showed one row
  // above — the same tile twice in a row reads as a broken catalogue.
  const shownAbove = new Set([...slides.map((g) => g.slug), ...newest.map((g) => g.slug)]);
  const hot = games.filter((g) => g.hot && !shownAbove.has(g.slug)).slice(0, 14);

  return (
    <>
      <HeroCarousel lang={locale} slides={slides} />

      <Rail
        title={locale === 'es' ? 'Novedades' : 'New arrivals'}
        games={newest}
        lang={locale}
        seeAllHref={categoryHref(locale, 'novedades')}
        priority
      />

      <Rail
        title={locale === 'es' ? 'Destacados' : 'Featured'}
        games={hot}
        lang={locale}
        seeAllHref={href(locale, 'games')}
        showBadges={false}
      />

      <VideoRail
        title={t.video.title}
        videos={videos}
        lang={locale}
        seeAllHref={href(locale, 'videos')}
      />

      {categories
        .filter((c) => c.slug !== 'novedades')
        .map((c) => (
          <Rail
            key={c.slug}
            title={c.label[locale]}
            games={games.filter((g) => g.category === c.slug)}
            lang={locale}
            seeAllHref={categoryHref(locale, c.slug)}
          />
        ))}

      <section className={styles.band}>
        <div className={styles.shell}>
          <h2 className={styles.h2}>{t.home.howTitle}</h2>
          <ol className={styles.steps}>
            {t.home.howSteps.map((s, i) => (
              <li key={s.t} className={styles.step}>
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                <h3 className={styles.stepTitle}>{s.t}</h3>
                <p className={styles.stepBody}>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.shell}>
        <h2 className={styles.h2}>{t.home.includesTitle}</h2>
        <ul className={styles.includes}>
          {t.home.includes.map((f) => (
            <li key={f.t} className={styles.include}>
              <h3 className={styles.incTitle}>{f.t}</h3>
              <p className={styles.incBody}>{f.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.closer}>
        <div className={styles.shell}>
          <h2 className={styles.closerTitle}>
            {locale === 'es'
              ? `${games.length} juegos en una sola suscripción`
              : `${games.length} games in one subscription`}
          </h2>
          <p className={styles.closerNote}>{t.home.html5}</p>
          <SubscribeCta lang={locale} label={t.home.heroPlay} />
        </div>
      </section>

      {/* Entity is repeated near the conversion point, not only in the footer. */}
      <p className={styles.legalTail}>{brand.entity.statement[locale]}</p>
    </>
  );
}
