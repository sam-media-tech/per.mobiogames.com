import { brand, LOCALES, DEFAULT_LOCALE, type Locale } from './brand.config';

export { LOCALES, DEFAULT_LOCALE };
export type { Locale };

export function isLocale(x: string): x is Locale {
  return (LOCALES as readonly string[]).includes(x);
}

// Route map. The slugs stay ENGLISH even under /es/ because the live site does that
// and the Ads account is suspended — these exact URLs must keep resolving.
// `games` / `game` are new (the live site has no catalogue) and follow the same convention.
export const ROUTES = {
  home: '',
  games: 'games',
  videos: 'videos',
  pricing: 'pricing',
  about: 'about',
  carrierBilling: 'carrier-billing',
  contact: 'contact',
  unsubscribeRefund: 'unsubscribe-refund',
  terms: 'terms',
  privacy: 'privacy-policies',
  cookies: 'cookies',
  signin: 'signin',
} as const;

// Always trailing-slashed: /es/ , /es/pricing/ — matches the live URLs exactly.
export const href = (lang: Locale, route: keyof typeof ROUTES) =>
  ROUTES[route] ? `/${lang}/${ROUTES[route]}/` : `/${lang}/`;

// The landing page has TWO urls, one per language, and both are real paths.
//
//   es  /xkh55       the ad destination — byte-identical to the live URL, never
//                    redirected, never given a trailing slash
//   en  /xkh55/en/   a normal trailing-slashed route
//
// Deliberately NOT `?lang=en`: a query parameter needs a server to read it, and
// the preview ships as static files. There the pill changed the URL and left the
// page in the old language, which is exactly what QA reported.
export const LP_URLS: Record<Locale, string> = {
  es: `/${brand.lp.slug}`,
  en: `/${brand.lp.slug}/en/`,
};

export const lpHref = (lang: Locale) => LP_URLS[lang];

export const gameHref = (lang: Locale, slug: string) => `/${lang}/game/${slug}/`;
export const videoHref = (lang: Locale, slug: string) => `/${lang}/video/${slug}/`;
export const videoCategoryHref = (lang: Locale, slug: string) => `/${lang}/videos/${slug}/`;
export const categoryHref = (lang: Locale, slug: string) => `/${lang}/games/${slug}/`;

const dictionaries = {
  es: {
    nav: {
      games: 'Juegos',
      videos: 'Videos 360°',
      pricing: 'Precios',
      about: 'Nosotros',
      contact: 'Contacto',
      signin: 'Mi cuenta',
      subscribe: 'Suscríbete',
      menu: 'Menú',
      close: 'Cerrar',
    },
    billing: {
      // The persistent strip under the header. Price comes from brand.config.
      renews: 'Se renueva automáticamente hasta que la canceles',
      cancel: 'Cancela enviando SALIR al 2011 o escribe a',
      cancelShort: 'Cancela:',
      orEmail: 'o escribe a',
      charged: 'El cargo aparece en tu recibo de Entel o se descuenta del saldo de tu recarga, facturado por',
    },
    home: {
      heroKicker: 'Juegos móviles por suscripción',
      heroPlay: 'Suscríbete y juega',
      heroBrowse: 'Ver el catálogo',
      html5: 'Juegos HTML5 que se abren en el navegador de tu celular. Sin descargas ni APK.',
      railAll: 'Ver todos',
      howTitle: 'Cómo funciona',
      howSteps: [
        {
          t: 'Ingresa tu número Entel',
          d: 'Abre la página de suscripción y escribe el número móvil que usarás.',
        },
        {
          t: 'Confirma con el PIN',
          d: 'Te llega un PIN por SMS. Escríbelo para confirmar la suscripción.',
        },
        {
          t: 'Juega desde el navegador',
          d: 'Con la suscripción activa entras al catálogo completo. Sin instalar nada.',
        },
      ],
      includesTitle: 'Qué incluye tu suscripción',
      includes: [
        { t: 'Catálogo completo', d: 'Acceso a todos los juegos del catálogo mientras tu suscripción esté activa.' },
        { t: 'Sin descargas', d: 'Todo funciona en el navegador: celular, tableta o PC compatible.' },
        { t: 'Sin permanencia', d: 'Cancelas cuando quieras enviando SALIR al 2011.' },
        { t: 'Sin tarjeta', d: 'El cargo va a tu recibo Entel o se descuenta de tu saldo.' },
        { t: 'Precio claro', d: 'El precio y la renovación están escritos en cada página, sin letra chica.' },
        { t: 'Soporte por correo', d: 'Escríbenos a help@mobiogames.com y te respondemos.' },
      ],
    },
    catalog: {
      title: 'Catálogo de juegos',
      subtitle: 'Explora por categoría. Todos los juegos son HTML5 y se abren en el navegador.',
      all: 'Todos',
      count: (n: number) => `${n} juegos`,
      empty: 'No hay juegos en esta categoría.',
      play: 'Jugar demo',
      playNote:
        'Puedes probar esta demo sin coste. El acceso al catálogo completo requiere una suscripción activa.',
      noDemo:
        'Este juego forma parte del catálogo de BeyondVR y se juega con una suscripción activa.',
      released: 'Publicado en',
      category: 'Categoría',
      back: 'Volver al catálogo',
      more: 'Más de esta categoría',
    },
    video: {
      title: 'Videos 360°',
      subtitle:
        'Documentales y música grabados con cámara 360°. Se reproducen en el navegador, sin descargas.',
      count: (n: number) => `${n} videos`,
      watch: 'Ver el video',
      duration: 'Duración',
      category: 'Categoría',
      more: 'Más de esta categoría',
      empty: 'No hay videos en esta categoría.',
      note: 'Incluido en tu suscripción. Se reproduce en el navegador, sin instalar nada.',
      dataNote:
        'Reproducir video consume datos de tu plan móvil. Te recomendamos usar Wi-Fi.',
    },
    footer: {
      partOf: (promoDomain: string, officialDomain: string) =>
        `Esta oferta es presentada por ${promoDomain}, que es el dominio promocional oficial y autorizado de ${officialDomain}.`,
      operatedBy: 'es operado por',
      registeredAt: 'con domicilio social en',
      promotedBy: 'y promocionado por',
      billedNote: 'Los cargos aparecen en tu recibo móvil a nombre de',
      explore: 'Explora',
      legal: 'Legal',
      help: 'Ayuda',
      tagline: 'Juegos móviles por suscripción, con precios claros y soporte visible.',
      links: {
        home: 'Inicio',
        games: 'Juegos',
        videos: 'Videos 360°',
        pricing: 'Precios',
        about: 'Nosotros',
        contact: 'Contacto',
        signin: 'Mi cuenta',
        terms: 'Términos y condiciones',
        privacy: 'Política de privacidad',
        cookies: 'Política de cookies',
        carrierBilling: 'Facturación por operador',
        unsubscribeRefund: 'Cancelación y reembolso',
      },
      rights: 'Todos los derechos reservados.',
    },
    legal: {
      // Only rendered on the non-Spanish surface — see `en.legal` below.
      officialEs: '',
      translated: '',
    },
    seo: {
      homeTitle: `${brand.name} | Juegos móviles por suscripción`,
      home: 'Catálogo de juegos HTML5 y videos 360° por suscripción, para jugar en el navegador de tu celular. Precio, renovación y cancelación visibles en cada página.',
      pricing: 'S/1.20 al día en prepago y S/12.90 al mes en postpago, IGV incluido. Se renueva automáticamente hasta que canceles enviando SALIR al 2011.',
      about: 'Quién opera BeyondVR, qué incluye la suscripción y cómo ponerte en contacto con nosotros.',
      contact: 'Escríbenos a help@mobiogames.com para soporte, cancelación o reembolsos. Respondemos por correo.',
      carrierBilling: 'Cómo funciona el cobro a través de Entel: prepago, postpago, renovación automática y cancelación.',
      unsubscribeRefund: 'Cancela enviando SALIR al 2011 o escribiendo a help@mobiogames.com, y cómo solicitar un reembolso.',
      terms: 'Términos y condiciones del servicio de suscripción BeyondVR en Perú, facturado a través de Entel.',
      privacy: 'Qué datos personales tratamos, con qué finalidad, durante cuánto tiempo y cómo ejercer tus derechos.',
      cookies: 'Qué cookies usa BeyondVR, para qué sirven y cómo controlarlas desde tu navegador.',
      signin: 'Gestiona tu suscripción de BeyondVR: cómo acceder, cómo consultar tu estado y cómo cancelar.',
      gameCategory: (label: string, n: number) =>
        `${label}: ${n} juegos HTML5 incluidos en la suscripción de BeyondVR, para jugar en el navegador sin descargas.`,
      videoCategory: (label: string, n: number) =>
        `${label}: ${n} videos grabados en 360°, incluidos en la suscripción de BeyondVR y reproducidos en el navegador.`,
      demo: (title: string) =>
        `Juega la demo de ${title} en el navegador, sin coste y sin instalar nada. El catálogo completo requiere una suscripción activa.`,
    },
  },

  en: {
    nav: {
      games: 'Games',
      videos: '360° videos',
      pricing: 'Pricing',
      about: 'About',
      contact: 'Contact',
      signin: 'My account',
      subscribe: 'Subscribe',
      menu: 'Menu',
      close: 'Close',
    },
    billing: {
      renews: 'Renews automatically until you cancel',
      cancel: 'Cancel by texting SALIR to 2011, or email',
      cancelShort: 'Cancel:',
      orEmail: 'or email',
      charged: 'The charge appears on your Entel bill or is deducted from your balance, billed by',
    },
    home: {
      heroKicker: 'Mobile games by subscription',
      heroPlay: 'Subscribe and play',
      heroBrowse: 'Browse the catalogue',
      html5: 'HTML5 games that open in your phone browser. No downloads, no APK.',
      railAll: 'See all',
      howTitle: 'How it works',
      howSteps: [
        { t: 'Enter your Entel number', d: 'Open the subscription page and type the mobile number you will use.' },
        { t: 'Confirm with the PIN', d: 'A PIN arrives by SMS. Enter it to confirm your subscription.' },
        { t: 'Play in the browser', d: 'With an active subscription you get the full catalogue. Nothing to install.' },
      ],
      includesTitle: "What your subscription includes",
      includes: [
        { t: 'The full catalogue', d: 'Access to every game in the catalogue while your subscription is active.' },
        { t: 'No downloads', d: 'Everything runs in the browser: phone, tablet or compatible PC.' },
        { t: 'No commitment', d: 'Cancel whenever you like by texting SALIR to 2011.' },
        { t: 'No card needed', d: 'The charge goes to your Entel bill or comes off your prepaid balance.' },
        { t: 'Clear pricing', d: 'The price and the renewal are written on every page. No small print.' },
        { t: 'Email support', d: 'Write to help@mobiogames.com and we will get back to you.' },
      ],
    },
    catalog: {
      title: 'Game catalogue',
      subtitle: 'Browse by category. Every game is HTML5 and opens in the browser.',
      all: 'All',
      count: (n: number) => `${n} games`,
      empty: 'No games in this category.',
      play: 'Play the demo',
      playNote:
        'You can try this demo at no cost. Access to the full catalogue requires an active subscription.',
      noDemo:
        'This game is part of the BeyondVR catalogue and is played with an active subscription.',
      released: 'Released',
      category: 'Category',
      back: 'Back to the catalogue',
      more: 'More from this category',
    },
    video: {
      title: '360° videos',
      subtitle:
        'Documentaries and music filmed with a 360° camera. They play in the browser, no downloads.',
      count: (n: number) => `${n} videos`,
      watch: 'Watch the video',
      duration: 'Length',
      category: 'Category',
      more: 'More from this category',
      empty: 'No videos in this category.',
      note: 'Included in your subscription. Plays in the browser, nothing to install.',
      dataNote: 'Playing video uses your mobile data. Wi-Fi is recommended.',
    },
    footer: {
      partOf: (promoDomain: string, officialDomain: string) =>
        `This offer is brought to you by ${promoDomain}, which serves as the official and authorised promotional domain for ${officialDomain}.`,
      operatedBy: 'is operated by',
      registeredAt: 'whose registered office is at',
      promotedBy: 'and promoted by',
      billedNote: 'Charges appear on your mobile bill under',
      explore: 'Explore',
      legal: 'Legal',
      help: 'Help',
      tagline: 'Mobile games by subscription, with clear pricing and visible support.',
      links: {
        home: 'Home',
        games: 'Games',
        videos: '360° videos',
        pricing: 'Pricing',
        about: 'About',
        contact: 'Contact',
        signin: 'My account',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        cookies: 'Cookies Policy',
        carrierBilling: 'Carrier Billing',
        unsubscribeRefund: 'Unsubscribe & Refund',
      },
      rights: 'All rights reserved.',
    },
    legal: {
      // The operator-approved conditions exist in Spanish only. Rather than drop
      // an unexplained Spanish paragraph onto the English page — or ship an
      // unapproved translation in its place — the English page labels both.
      officialEs: 'Official version, approved by Entel (Spanish):',
      translated: 'English translation, provided for information.',
    },
    seo: {
      homeTitle: `${brand.name} | Mobile games by subscription`,
      home: 'HTML5 games and 360° videos by subscription, played in your phone browser. Price, renewal and cancellation are visible on every page.',
      pricing: 'S/1.20 per day on prepaid and S/12.90 per month on postpaid, VAT included. Renews automatically until you cancel by texting SALIR to 2011.',
      about: 'Who operates BeyondVR, what the subscription includes and how to get in touch with us.',
      contact: 'Write to help@mobiogames.com for support, cancellation or refunds. We answer by email.',
      carrierBilling: 'How billing through Entel works: prepaid, postpaid, automatic renewal and cancellation.',
      unsubscribeRefund: 'Cancel by texting SALIR to 2011 or writing to help@mobiogames.com, and how to request a refund.',
      terms: 'Terms and conditions of the BeyondVR subscription service in Peru, billed through Entel.',
      privacy: 'What personal data we process, why, for how long, and how to exercise your rights.',
      cookies: 'Which cookies BeyondVR uses, what they are for and how to control them from your browser.',
      signin: 'Manage your BeyondVR subscription: how to get in, how to check its status and how to cancel.',
      gameCategory: (label: string, n: number) =>
        `${label}: ${n} HTML5 games included in the BeyondVR subscription, played in the browser with no downloads.`,
      videoCategory: (label: string, n: number) =>
        `${label}: ${n} videos filmed in 360°, included in the BeyondVR subscription and played in the browser.`,
      demo: (title: string) =>
        `Play the ${title} demo in your browser, at no cost and with nothing to install. The full catalogue requires an active subscription.`,
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)['en'];
export const getDictionary = (lang: Locale): Dictionary =>
  dictionaries[lang] as unknown as Dictionary;
