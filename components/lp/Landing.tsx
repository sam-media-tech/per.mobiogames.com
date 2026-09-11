import Image from 'next/image';
import { brand, priceLine, type Locale } from '@/lib/brand.config';
import { getDictionary, href, lpHref, LP_URLS } from '@/lib/i18n';
import { games, categories } from '@/content/games.generated';
import { tallyman } from '@/lib/integrations';
import SiteHeader from '@/components/SiteHeader';
import BillingStrip from '@/components/BillingStrip';
import SiteFooter from '@/components/SiteFooter';
import Rail from '@/components/Rail';
import SubscribeReveal from '@/components/lp/SubscribeReveal';
import styles from '@/app/xkh55/lp.module.css';

// =============================================================================
// The landing page body, shared by both language routes.
//
// There are TWO routes, not one route with a ?lang= switch:
//
//   /xkh55       Spanish — the ad destination, byte-identical URL to the live
//                page, and the only one campaigns point at.
//   /xkh55/en/   English — a real path.
//
// It used to be `?lang=es`. A query parameter cannot work on the static preview
// host (there is no server to read it), so the language pill changed the URL and
// left the page in the other language — and links to the query form resolved to
// nothing, which is how a visitor ended up on the home page with a client router
// pointing at a route that was never served. Paths work identically on a Next
// server and on plain static hosting.
// =============================================================================

export default function Landing({
  lang,
  tracking,
}: {
  lang: Locale;
  /** Campaign / affiliate parameters, captured server-side for attribution. */
  tracking: Record<string, string>;
}) {
  const t = getDictionary(lang);
  // Server component, so this reads the real server config. It decides whether
  // the form actually subscribes anyone and whether the "no charge" notice is
  // shown — the two can no longer disagree. See components/lp/SubscribeCard.tsx.
  const live = tallyman.enabled;
  const es = lang === 'es';

  const hero = games.find((g) => g.slug === 'basketball-stars-3') ?? games[0];
  const featured = games.filter((g) => g.hot && g.imageLg).slice(0, 12);
  const { sms, email } = brand.cancellation;

  // One representative tile per category, for the "what can you play" grid.
  const catCards = categories.map((c) => ({
    ...c,
    art: games.find((g) => g.category === c.slug && g.image)?.image ?? null,
  }));

  const includes = [
    {
      t: es ? 'Biblioteca de juegos móvil' : 'A mobile games library',
      d: es
        ? 'Acción, aventura, carreras, puzzles y partidas casuales, para pausas cortas y sesiones más largas.'
        : 'Action, adventure, racing, puzzles and casual play, for short breaks and longer sessions.',
    },
    {
      t: es ? 'Acceso multiplataforma' : 'Cross-platform access',
      d: es
        ? 'Celular, tableta o PC compatible: tu acceso sigue activo mientras tu suscripción lo esté.'
        : 'Phone, tablet or compatible PC: your access stays active while your subscription does.',
    },
    {
      t: es ? 'Sin instalaciones largas' : 'No long installs',
      d: es
        ? 'Juega desde el navegador: abre, prueba y sigue jugando en segundos. Sin descargas ni APK.'
        : 'Play in the browser: open, try and keep playing in seconds. No downloads, no APK.',
    },
    {
      t: es ? 'Cancela cuando quieras' : 'Cancel whenever you like',
      d: es
        ? `Sin permanencia. Envía ${sms.keyword} al ${sms.shortcode} y tu cobro se detiene.`
        : `No commitment. Text ${sms.keyword} to ${sms.shortcode} and the charges stop.`,
    },
  ];

  return (
    <>
      {/* Hoisted into <head> by React, not declared through the metadata API:
          `trailingSlash: true` normalises metadata URLs, which would turn the
          ad destination /xkh55 into /xkh55/ — a URL no campaign points at.
          Each language self-canonicalises and the pair is linked by hreflang,
          because they are the same offer in two languages, not duplicates. */}
      <link rel="canonical" href={`https://${brand.domain}${LP_URLS[lang]}`} />
      <link rel="alternate" hrefLang="es" href={`https://${brand.domain}${LP_URLS.es}`} />
      <link rel="alternate" hrefLang="en" href={`https://${brand.domain}${LP_URLS.en}`} />
      <link rel="alternate" hrefLang="x-default" href={`https://${brand.domain}${LP_URLS.es}`} />

      <SiteHeader lang={lang} langHref={lpHref(es ? 'en' : 'es')} />
      <BillingStrip lang={lang} />

      <main lang={lang}>
        {/* Hero: the explanation sits beside the form, never behind it — a
            reviewer must understand the service before being asked for a number. */}
        <section className={styles.hero} data-intro>
          {hero.imageLg ? (
            <Image src={hero.imageLg} alt="" fill priority sizes="100vw" className={styles.heroArt} />
          ) : null}
          <div className={styles.heroVeil} aria-hidden="true" />

          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <h1 className={styles.h1}>
                {es ? 'Entra a jugar con ' : 'Start playing with '}
                <span className={styles.mark}>{brand.name}</span>
              </h1>
              <p className={styles.lede}>
                {es
                  ? `${brand.name} es un servicio de suscripción de juegos móviles: acción, aventura, carreras, puzzles y más, para jugar desde el navegador de tu celular, tableta o PC compatible.`
                  : `${brand.name} is a mobile games subscription: action, adventure, racing, puzzles and more, played in the browser on your phone, tablet or compatible PC.`}
              </p>
              <p className={styles.html5}>{t.home.html5}</p>


            </div>

            <div className={styles.formSlot} data-cta>
              <SubscribeReveal
                lang={lang}
                tracking={tracking}
                tone="art"
                label={t.home.heroPlay}
                live={live}
              />
            </div>
          </div>
        </section>

        <section className={styles.block}>
          <div className={styles.shell}>
            <h2 className={styles.h2}>{es ? '¿Qué puedes jugar?' : 'What can you play?'}</h2>
            <p className={styles.blockLede}>
              {es
                ? `Una muestra de las ${categories.length} categorías que viven en ${brand.name}: ${games.length} juegos para abrir, probar y seguir jugando.`
                : `A sample of the ${categories.length} categories inside ${brand.name}: ${games.length} games to open, try and keep playing.`}
            </p>

            <ul className={styles.catGrid}>
              {catCards.map((c) => (
                <li key={c.slug} className={styles.catCard}>
                  {c.art ? (
                    <Image
                      src={c.art}
                      alt=""
                      width={480}
                      height={360}
                      sizes="(max-width: 700px) 100vw, 32vw"
                      className={styles.catArt}
                    />
                  ) : null}
                  <span className={styles.catShade} aria-hidden="true" />
                  <span className={styles.catName}>{c.label[lang]}</span>
                  <span className={styles.catCount}>
                    {c.count} {es ? 'juegos' : 'games'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Rail
          title={es ? 'Algunos de los juegos incluidos' : 'Some of the games included'}
          games={featured}
          lang={lang}
          seeAllHref={href(lang, 'games')}
        />

        <section className={styles.block}>
          <div className={styles.shell}>
            <h2 className={styles.h2}>{es ? 'Todo en una sola suscripción' : 'All in one subscription'}</h2>
            <ul className={styles.featGrid}>
              {includes.map((f) => (
                <li key={f.t} className={styles.feat}>
                  <h3 className={styles.featTitle}>{f.t}</h3>
                  <p className={styles.featBody}>{f.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className={styles.panels}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>{es ? 'Política de precios' : 'Pricing policy'}</h2>
            <p className={styles.priceBig}>{priceLine(lang)}</p>
            <ul className={styles.list}>
              <li>
                {es
                  ? 'Renovación automática para un servicio ininterrumpido, hasta que canceles.'
                  : 'Automatic renewal for uninterrupted service, until you cancel.'}
              </li>
              <li>
                {es
                  ? 'Todos los impuestos incluidos. Sin cargos sorpresa.'
                  : 'All taxes included. No surprise charges.'}
              </li>
              <li>
                {es
                  ? 'Usuarios prepago: se cobra diariamente. Usuarios postpago: se cobra mensualmente.'
                  : 'Prepaid users are charged daily. Postpaid users are charged monthly.'}
              </li>
            </ul>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>
              {es ? 'Cancelación / Desuscripción' : 'Cancellation / Unsubscribe'}
            </h2>
            <ul className={styles.list}>
              <li>
                {es ? 'Envía un SMS con el texto ' : 'Send an SMS with the text '}
                <strong>{sms.keyword}</strong> {es ? 'al' : 'to'} <strong>{sms.shortcode}</strong>.
              </li>
              <li>
                {es ? 'O escríbenos a ' : 'Or email us at '}
                <a href={`mailto:${email}`} className={styles.link}>
                  {email}
                </a>
                .
              </li>
              <li>
                <a href={href(lang, 'unsubscribeRefund')} className={styles.link}>
                  {es ? 'Consulta esta página para más información' : 'See this page for more information'}
                </a>
                .
              </li>
            </ul>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>{es ? 'Política de reembolso' : 'Refund policy'}</h2>
            <p className={styles.body}>
              {es
                ? `Si se cobró una tarifa por los servicios de ${brand.name} dentro de los ${brand.refund.days} días anteriores a tu solicitud, puedes pedir el reembolso escribiendo a `
                : `If a charge for ${brand.name} services was made within ${brand.refund.days} days before your request, you can request a refund by writing to `}
              <a href={`mailto:${email}`} className={styles.link}>
                {email}
              </a>
              {es
                ? ', indicando tu nombre y apellido, número de móvil, correo electrónico, el nombre del servicio y el método de pago utilizado.'
                : ', stating your full name, mobile number, email address, the service name and the payment method used.'}
            </p>
          </section>
        </div>

        {/* A second real form, not an anchor back to the first: an in-page jump
            would be auto-scroll on click, which is a circumvention signal. */}
        <section className={styles.closer} data-cta>
          <div className={styles.closerCopy}>
            <h2 className={styles.h2}>
              {es ? '¿Listo para tu próxima partida?' : 'Ready for your next game?'}
            </h2>
            <p className={styles.body}>{t.home.html5}</p>
          </div>
          <SubscribeReveal lang={lang} tracking={tracking} label={t.home.heroPlay} live={live} />
        </section>

        {/* The operator-approved disclaimer. Entel approved it in Spanish, so the
            Spanish is always rendered verbatim and is the version that binds.
            On the English surface it used to appear alone, with nothing to say
            why the page had switched language — which reads as a bug. English
            now gets a labelled translation above it, and the approved original
            stays exactly where it was, unaltered. */}
        {es ? (
          <p className={styles.conditions} data-legal lang="es">
            {brand.carrierLegal.disclaimer}
          </p>
        ) : (
          <div data-legal>
            <p className={styles.conditions}>{brand.carrierLegal.disclaimerEn}</p>
            <p className={styles.conditionsNote}>
              {t.legal.translated} {t.legal.officialEs}
            </p>
            <p className={styles.conditionsEs} lang="es">
              {brand.carrierLegal.disclaimer}
            </p>
          </div>
        )}

        <p className={styles.conditions}>{brand.entity.statement[lang]}</p>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
