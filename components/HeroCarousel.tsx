import Image from 'next/image';
import Link from 'next/link';
import { brand, type Locale } from '@/lib/brand.config';
import { getDictionary, gameHref } from '@/lib/i18n';
import { categories } from '@/content/games.generated';
import type { Game } from '@/content/games.generated';
import SubscribeCta from './SubscribeCta';
import styles from './HeroCarousel.module.css';

// =============================================================================
// Full-bleed hero carousel — artwork edge to edge, copy centred on top,
// numbered pagination underneath.
//
// Pure CSS: hidden radio inputs drive `:checked ~` sibling selectors, and the
// numbers are <label>s. So it works with JavaScript disabled, adds no client
// bundle, changes no history entries (the Back button stays honest), and it does
// not scroll the page on click — an in-page jump would read as auto-scroll.
//
// There is no auto-advance. A slide that moves on its own is motion the visitor
// did not ask for, and it makes the price disclosure a moving target.
//
// The subscribe CTA and its price disclosure sit OUTSIDE the slides, once, in a
// band under the stage. They used to be inside every slide, which meant the
// price, the renewal and the cancellation terms existed six times in the DOM
// with five of those copies inside `visibility: hidden` — text a compliance scan
// reports as concealed, and duplication that has no reason to exist. One slide
// is showing at a time; one CTA is all a visitor can press.
// =============================================================================

export default function HeroCarousel({ lang, slides }: { lang: Locale; slides: Game[] }) {
  const t = getDictionary(lang);
  const es = lang === 'es';

  return (
    <section className={styles.hero} aria-roledescription="carousel">
      {slides.map((g, i) => (
        <input
          key={`r-${g.slug}`}
          type="radio"
          name="hero-slide"
          id={`hero-${i}`}
          // Carousel position, not a consent control — the only checkboxes that
          // carry consent are in SubscribeCard and both start unchecked.
          defaultChecked={i === 0}
          className={styles.radio}
          aria-label={`${es ? 'Diapositiva' : 'Slide'} ${i + 1}: ${g.title}`}
        />
      ))}

      <div className={styles.stage}>
        {slides.map((g, i) => (
          <article key={g.slug} className={styles.slide}>
            {g.imageLg ? (
              <Image
                src={g.imageLg}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className={styles.art}
                aria-hidden="true"
              />
            ) : null}
            <div className={styles.veil} aria-hidden="true" />

            <div className={styles.copy}>
              {/* The page's h1 states what the service IS, so a reviewer knows
                  within seconds. It stays constant while the slides change. */}
              <h1 className={styles.kicker}>
                {brand.name} — {t.home.heroKicker}
              </h1>

              <p className={styles.title}>{g.title}</p>
              <p className={styles.sub}>
                {(() => {
                  const cat = categories.find((c) => c.slug === g.category);
                  const label = cat ? cat.label[lang] : '';
                  return es
                    ? `${label} · Juega en el navegador, sin descargas ni APK`
                    : `${label} · Play in the browser, no downloads, no APK`;
                })()}
              </p>

              {/* Per-slide, because it points at THIS slide's game. The
                  subscribe CTA is shared and lives below the stage. */}
              <div className={styles.actions}>
                <Link href={gameHref(lang, g.slug)} className={styles.ghost}>
                  {es ? 'Ver el juego' : 'View the game'}
                </Link>
              </div>
            </div>
          </article>
        ))}

        <p className={styles.scrollHint} aria-hidden="true">
          <span className={styles.mouse} />
          {es ? 'Desliza hacia abajo' : 'Scroll down'}
        </p>

        <div className={styles.dots}>
          {slides.map((g, i) => (
            <label key={`d-${g.slug}`} htmlFor={`hero-${i}`} className={styles.dot}>
              {String(i + 1).padStart(2, '0')}
            </label>
          ))}
        </div>
      </div>

      {/* The one CTA, with the FULL disclosure — price, frequency, renewal,
          both cancellation methods and the billing entity. Nothing is hidden
          and nothing is repeated. */}
      <div className={styles.ctaBand}>
        <SubscribeCta lang={lang} label={t.home.heroPlay} align="center" tone="art" />
      </div>
    </section>
  );
}
