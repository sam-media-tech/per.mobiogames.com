import type { Metadata } from 'next';
import { brand, DEFAULT_LOCALE } from '@/lib/brand.config';
import Landing from '@/components/lp/Landing';

// =============================================================================
// THE LANDING PAGE — public URL is /xkh55, and the folder name IS that URL.
//
// A LITERAL route segment, so it takes precedence over app/[lang]/ with no
// rewrite involved. The assert below keeps the folder name and brand.lp.slug
// from drifting apart.
//
// This is the destination of ads on a suspended account: the URL cannot change,
// the page must render identically for everyone, and nothing here may gate on a
// campaign parameter.
//
// Spanish, because the market is Peru — the language is decided by the ROUTE,
// not by a query parameter or by Accept-Language. English lives at
// /xkh55/en/ and renders the same component. See components/lp/Landing.tsx.
//
// The form is INLINE, not a modal. The live Ouisys page opens it in a dialog;
// the account manager's guidance is explicitly to avoid pop-ups, and a modal
// also forces the price disclosure to be duplicated (once by the button that
// opens it, once inside next to the button that actually charges you) and kept
// in sync forever. Inline, there is one CTA and one disclosure.
// =============================================================================

if (brand.lp.slug !== 'xkh55') {
  throw new Error(
    `app/xkh55/ does not match brand.lp.slug ("${brand.lp.slug}") — rename the folder to match.`,
  );
}

export const metadata: Metadata = {
  title: 'Suscríbete y juega',
  description:
    'Activa tu suscripción a BeyondVR con tu número Entel y juega desde el navegador. El precio, la renovación y la cancelación están a la vista antes de suscribirte.',
  // No `alternates` here: metadata URLs are normalised by trailingSlash, which
  // would point the canonical at /xkh55/ instead of the URL the ads use. The
  // canonical and hreflang tags are rendered inside <Landing>.
};

/** Campaign / affiliate parameters, captured SERVER-SIDE for attribution.
 *  Rendering never depends on them — no blank page, no cloak, no redirect. */
function captureTracking(sp: Record<string, string | string[] | undefined>) {
  const tracking: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    const val = Array.isArray(v) ? v[0] : v;
    if (typeof val === 'string' && val.trim()) tracking[k] = val.trim();
  }
  // xcid falls back to the page slug so attribution still works on a bare visit.
  if (!tracking.xcid) tracking.xcid = brand.lp.slug;
  return tracking;
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <Landing lang={DEFAULT_LOCALE} tracking={captureTracking(await searchParams)} />;
}

export { captureTracking };
