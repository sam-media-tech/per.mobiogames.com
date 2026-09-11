import { NextResponse, type NextRequest } from 'next/server';
import { LOCALES, DEFAULT_LOCALE, brand } from './lib/brand.config';

// =============================================================================
// middleware.ts — Next 16 renamed this convention to `proxy.ts`, and both names
// work in the framework. We deliberately use the OLD name: deployment adapters
// detect this file BY NAME, and elitegosu.com is running the same Next version
// in production with `middleware.ts`. If a host looked for middleware.ts and
// found proxy.ts, the whole URL policy below would silently not run — and that
// policy is what keeps the ad destination resolving without a redirect.
//
// URL policy. The Google Ads account is suspended, so every live URL must keep
// resolving exactly as it does today (all measured against the live origin):
//
//   /            200, content          → we serve the locale home, no redirect
//   /es/… /en/…  200, trailing slash   → canonical, we add the slash if missing
//   /xkh55       200, NO redirect      → the ad destination. Also 200 on /xkh55/.
//
// The LP is a LITERAL route (app/xkh55/page.tsx), not a dynamic one, so it wins
// over app/[lang]/ without any rewrite — which keeps it statically prerenderable
// and avoids the usePathname() server/client mismatch a rewrite would introduce.
// next.config.mjs sets skipTrailingSlashRedirect, because Next injects its own
// 308 "add a slash" redirect at a stage that runs BEFORE this file — it would
// bounce /xkh55 to /xkh55/ and we could not stop it.
// =============================================================================

const isLocalePath = (p: string) =>
  LOCALES.some((l) => p === `/${l}` || p.startsWith(`/${l}/`));

// Build the destination as a PLAIN URL, never req.nextUrl.clone(): NextURL
// re-applies the trailingSlash normalisation and strips the slash straight back
// off, which turns "add the missing slash" into an infinite redirect loop.
function slashRedirect(req: NextRequest, pathname: string, status: 307 | 308) {
  const dest = new URL(req.url);
  dest.pathname = pathname;
  return NextResponse.redirect(dest, status);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const bare = pathname.replace(/\/+$/, '') || '/';

  // 1) The landing page — served as-is, in either form, exactly like the live
  //    origin. Never redirected: /xkh55 is the final URL baked into ads we
  //    cannot edit while the account is suspended.
  if (bare === `/${brand.lp.slug}`) return NextResponse.next();

  // 1b) Its language variants (/xkh55/en/). These are ordinary pages, so they
  //     take the ordinary trailing slash — only the ad destination itself is
  //     exempt. Without this branch rule 4 would prefix them with a locale and
  //     send /xkh55/en to /es/xkh55/en/, which is not a route.
  if (bare.startsWith(`/${brand.lp.slug}/`)) {
    if (!pathname.endsWith('/')) return slashRedirect(req, `${pathname}/`, 308);
    return NextResponse.next();
  }

  // 2) Root. Rewrite, not redirect — the live root answers 200 with content and
  //    the account manager's guidance is to avoid automatic redirects. Peru is a
  //    Spanish market, so it serves es (live serves en here, with no canonical:
  //    a duplicate-content bug we fix with canonical + hreflang instead).
  if (bare === '/') {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}/`;
    return NextResponse.rewrite(url);
  }

  // 3) Locale-prefixed: enforce the trailing slash ourselves.
  if (isLocalePath(pathname)) {
    if (!pathname.endsWith('/')) return slashRedirect(req, `${pathname}/`, 308);
    return NextResponse.next();
  }

  // 4) Everything else gets a locale prefix and a trailing slash.
  return slashRedirect(req, `/${DEFAULT_LOCALE}${bare}/`, 307);
}

export const config = {
  // Never run on API routes, Next internals, or anything with a file extension.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
