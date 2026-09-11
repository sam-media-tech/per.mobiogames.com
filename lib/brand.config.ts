// =============================================================================
// brand.config.ts — the SINGLE source of truth for every per-brand / per-carrier
// value. Entity consistency and price consistency are the two things Google Ads
// cross-checks hardest (LP vs portfolio vs payment profile), so they are made
// structural here: every surface reads these, and nothing types a price twice.
//
// To launch a new brand: copy this file and change the values.
// =============================================================================

export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
// Spanish is the default: the market is Peru, the carrier is Entel, and the
// operator-approved legal text is Spanish. The bare URL serves es with nothing
// appended — /xkh55 stays exactly /xkh55, and /en/… is the alternate.
export const DEFAULT_LOCALE: Locale = 'es';

export const brand = {
  name: 'BeyondVR',
  domain: 'per.mobiogames.com',
  logo: '/images/beyondvr.png',

  // The service name and the domain differ, and a reviewer WILL notice. So state
  // the relationship plainly everywhere rather than leaving it to be inferred:
  // Mobio Games is the platform the service is published on, BeyondVR is the
  // service. Both are operated by the single legal entity below — `platform` is
  // a product name, never presented as a company.
  platform: { name: 'Mobio Games', domain: 'mobiogames.com' },

  // The service's own domain, named in the footer so the relationship between
  // the brand and the domain the ads run on is stated rather than inferred:
  // mobiogames.com is the authorised promotional domain FOR this.
  // ⚠️ OPEN: confirm `beyondvr.co` is a domain we actually control before this
  // ships. The only BeyondVR host in evidence anywhere in this project is the
  // video CDN `cdn.beyond-vr.com` (different spelling, different TLD). Naming a
  // domain we do not own — on the page that says it is the official one — is
  // the kind of claim Google checks and the kind it suspends for.
  officialDomain: 'beyondvr.co',

  // Legal entity — transcribed verbatim from the live footer + LP legal block.
  // ⚠️ Open item: custom_portfolio records 60009705 as *Mobimilia B.V.*, while this
  // page says *Sam Media B.V.* Confirm against the Google payment profile before launch;
  // until then we ship exactly what the reviewed live page says.
  // THREE roles, exactly as the original page separates them — checked against
  // video-beyondvr-gent7251-email/src/localization/translations/{es,en}.json:
  //   operated by  Sam Media B.V.  (the company, with the registration number)
  //   promoted by  Mobimilia B.V.
  //   billed by    Mobimilia B.V.  ← the MCC record; this is the name that shows
  //                                  on the subscriber's phone bill, and it is
  //                                  NOT the operator. Do not collapse the two.
  entity: {
    name: 'Sam Media B.V.',
    registrationNumber: '60009705',
    address: {
      es: 'Van Diemenstraat 356, 1013 CR Ámsterdam, Países Bajos',
      en: 'Van Diemenstraat 356, 1013 CR Amsterdam, The Netherlands',
    },
    promotedBy: 'Mobimilia B.V.',
    // CORRECTED 2026-09-11 by the account manager. Mobimilia is the Google MCC
    // and does the marketing/promotion; it is NOT the biller. Sam Media B.V. is
    // the entity contracted with Entel and the name on the subscriber's bill.
    // (The original Ouisys page's own translations said Mobimilia here — they
    // were wrong, which is exactly the kind of entity mismatch Google checks.)
    billedBy: 'Sam Media B.V.',

    // ONE canonical sentence, word for word from the original page's own
    // translations (video-beyondvr-gent7251-email/src/localization/translations).
    // Everywhere that states who runs the service renders this string rather than
    // assembling it from parts, so the wording cannot drift page to page.
    statement: {
      es: 'BeyondVR es operado por Sam Media B.V. (número de registro 60009705), con domicilio social en Van Diemenstraat 356, 1013 CR Ámsterdam, Países Bajos, y promocionado por Mobimilia B.V.',
      en: 'BeyondVR is operated by Sam Media B.V. (company registration number 60009705), whose registered office is at Van Diemenstraat 356, 1013 CR Amsterdam, The Netherlands, and promoted by Mobimilia B.V.',
    },
  },

  support: { email: 'help@mobiogames.com' },

  // Carrier billing — Peru / Entel. Two plans, both shown wherever a price is shown.
  carrier: 'Entel',
  price: {
    currency: 'S/',
    plans: [
      { key: 'prepaid', amount: 'S/1.20', period: 'day' },
      { key: 'postpaid', amount: 'S/12.90', period: 'month' },
    ],
    taxNote: { es: 'IGV incluido', en: 'VAT included' },
  },

  // Cancellation — SMS keyword AND email must always be rendered together.
  cancellation: {
    sms: { keyword: 'SALIR', shortcode: '2011' },
    email: 'help@mobiogames.com',
  },
  refund: { days: 30 },

  // CARRIER-APPROVED TEXT — copied byte-for-byte from the live page's legals
  // block (window.pac_analytics.visitor.legals[0], service beyond-vr, scenario
  // pe-email-beyondvr, id 2859). Entel signed this wording off. Do not rewrite,
  // reformat or "improve" it; if it needs to change, it changes at the source.
  carrierLegal: {
    pricePoint: 'prepago es de S/1.20 incluido IGV postpago es de S/12.90 incluido IGV',
    disclaimer:
      'Condiciones del servicio: Servicio de suscripción válido solo para usuarios Entel. El servicio está disponible para usuarios prepago y postpagos no corporativos. El valor del servicio para usuarios prepago es de S/1.20 incluido IGV el cual se cobra de forma diaria, descontado del saldo de recarga. El valor del servicio para usuarios postpago es de S/12.90 incluido IGV el cual se cobra de forma mensual, con cargo a la facturación del plan postpago. Para cancelar la suscripción envía un SMS al 2011 con la palabra SALIR. Al dar click en el botón AFILIARME se aceptan los términos y condiciones del servicio.',

    // COURTESY TRANSLATION — for the English surface only, and never a
    // replacement for the string above. An English visitor previously met the
    // Spanish paragraph with nothing to explain why, which reads as a bug; the
    // page now shows the approved Spanish text AND this, each labelled for what
    // it is. Entel approved the Spanish, so the Spanish is the binding version
    // and is always rendered. Keep this in step with the original if it changes.
    disclaimerEn:
      'Service conditions: subscription service valid only for Entel users. The service is available to prepaid and non-corporate postpaid users. For prepaid users the service costs S/1.20 including VAT, charged daily and deducted from the top-up balance. For postpaid users the service costs S/12.90 including VAT, charged monthly to the postpaid plan bill. To cancel the subscription, send an SMS to 2011 with the word SALIR. Clicking the AFILIARME button constitutes acceptance of the terms and conditions of the service.',
  },

  // The subscription LP. Lives at the ROOT of the domain (per.mobiogames.com/xkh55),
  // not under a /lp/ prefix — the Ads account is suspended so the URL cannot change.
  // It is a LITERAL route — app/xkh55/page.tsx — so it wins over app/[lang]/
  // with no rewrite, and stays statically prerenderable. That file asserts this
  // value matches its own folder name, so the two can never drift apart.
  lp: { slug: 'xkh55' },

  // Carrier-billing config passed server-side to Tallyman.
  //
  // Every value below is taken from the suspended page's own configuration, not
  // inferred: `video-beyondvr-gent7251-email/config.json` supplies flow, slug,
  // device, country and service; `.env` confirms strategy=pin; and the live
  // page's window.pac_analytics supplies offer=1 and cid=13822.
  billing: {
    country: 'PE',            // flowConfig.country — uppercase, as the API receives it
    countryCode: '+51',
    strategy: 'pin',          // .env strategy=pin
    service: 'beyond-vr',     // flowConfig.service
    scenario: 'pe-email-beyondvr',
    slug: 'pe-email-beyondvr', // flowConfig.slug — the Tallyman slug IS the scenario here
    device: 'smart',          // flowConfig.device
    offerId: '1',             // pac_analytics.visitor.offer
    cid: '13822',             // pac_analytics.visitor.cid — campaign id, for reference
  },

  // Tracking — DISABLED. Zero third-party scripts until the account is healthy.
  // Pacman is deliberately absent (it is the shared-fingerprint tracker).
  tracking: { gtmId: '' },
} as const;

export type Brand = typeof brand;

// Convenience: "S/ 1.20 al día · S/ 12.90 al mes (IGV incluido)"
const PERIOD: Record<Locale, Record<string, string>> = {
  es: { day: 'al día', month: 'al mes' },
  en: { day: 'per day', month: 'per month' },
};

export function priceLine(lang: Locale): string {
  const plans = brand.price.plans
    .map((p) => `${p.amount} ${PERIOD[lang][p.period]}`)
    .join(' · ');
  return `${plans} (${brand.price.taxNote[lang]})`;
}
