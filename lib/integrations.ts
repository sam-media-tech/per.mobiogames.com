// =============================================================================
// integrations.ts — Tallyman (billing) · Evina (antifraud)
//
// Each is OFF until you provide its env var, so the app runs in safe "mock" mode
// now and goes live the moment Sam Media gives you the endpoints/credentials.
// Set these in `.env.local` (see .env.local.example).
//
// SAFETY MODEL:
//  - Tallyman  → SERVER-side only (called from /api/tallyman). Never exposed to the
//                browser, so the billing call never enters the crawlable fingerprint.
//  - Evina     → client-side (carrier-required antifraud token). Loaded from Evina's
//                own CDN with YOUR merchant id — NOT through Ouisys.
//  - Tracking  → your OWN GTM (components/Gtm.tsx). Pacman was REMOVED (it's the
//                shared-fingerprint tracker); conversions push to the GTM dataLayer.
// =============================================================================

// server-only
export const tallyman = {
  baseUrl: process.env.TALLYMAN_BASE_URL ?? '', // set in .env.local; same-origin proxy host
  get enabled() {
    return this.baseUrl.length > 0;
  },
};

// client-safe (NEXT_PUBLIC_*)
export const evina = {
  scriptUrl: process.env.NEXT_PUBLIC_EVINA_SCRIPT_URL ?? '',
  merchantId: process.env.NEXT_PUBLIC_EVINA_MERCHANT_ID ?? '',
  get enabled() {
    return this.scriptUrl.length > 0;
  },
};

// Pacman removed — conversion tracking goes through YOUR OWN GTM (dataLayer) instead.
// See components/Gtm.tsx + trackEvent() in clientIntegrations.ts.
