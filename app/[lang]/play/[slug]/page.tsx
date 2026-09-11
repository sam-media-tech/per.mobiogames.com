import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { brand, LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale, getDictionary, gameHref, href } from '@/lib/i18n';
import { games, gameBySlug } from '@/content/games.generated';
import SubscribeCta from '@/components/SubscribeCta';
import styles from './play.module.css';

// =============================================================================
// The playable demo. The game runs in an iframe on OUR url (/es/play/<slug>/),
// so the visitor never leaves per.mobiogames.com and the Back button behaves.
//
// Honesty rules baked into the copy below: this is a demo you can genuinely play
// for free, and the page says plainly that the full catalogue needs a paid
// subscription. Neither claim may drift — "free" attached to a service that
// actually requires a recurring charge is the classic deceptive-offer failure.
//
// cdn.game-lords.com is the ONLY external host in the whole build. It is the
// content provider's CDN, and it is loaded here and nowhere else.
// =============================================================================

export function generateStaticParams() {
  return LOCALES.flatMap((lang) =>
    games.filter((g) => g.demoSafe).map((g) => ({ lang, slug: g.slug })),
  );
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
  const t = getDictionary(locale);
  return {
    title: `${game.title} — demo`,
    description: t.seo.demo(game.title),
    alternates: {
      canonical: `/${locale}/play/${game.slug}/`,
      languages: {
        es: `/es/play/${game.slug}/`,
        en: `/en/play/${game.slug}/`,
        'x-default': `/es/play/${game.slug}/`,
      },
    },
  };
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const game = gameBySlug(slug);
  // Never render the frame for a game that carries third-party scripts.
  if (!game || !game.playUrl || !game.demoSafe) notFound();

  const t = getDictionary(locale);
  const es = locale === 'es';

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <Link href={gameHref(locale, game.slug)} className={styles.back}>
          <span aria-hidden="true">←</span> {es ? 'Volver' : 'Back'}
        </Link>
        <p className={styles.name}>{game.title}</p>
        <span className={styles.tag}>{es ? 'Demo' : 'Demo'}</span>
      </div>

      <div className={styles.frame}>
        <iframe
          src={game.playUrl}
          title={game.title}
          className={styles.game}
          allow="autoplay; fullscreen"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>

      <div className={styles.after}>
        <p className={styles.note}>
          {es
            ? 'Esta es una demo de muestra que puedes jugar sin coste. El acceso al catálogo completo requiere una suscripción activa.'
            : 'This is a sample demo you can play at no cost. Access to the full catalogue requires an active subscription.'}
        </p>
        <SubscribeCta
          lang={locale}
          label={t.home.heroPlay}
          secondary={
            <Link href={href(locale, 'games')} className={styles.ghost}>
              {es ? 'Ver el catálogo' : 'Browse the catalogue'}
            </Link>
          }
        />
      </div>
    </div>
  );
}
