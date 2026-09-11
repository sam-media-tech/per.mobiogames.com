// =============================================================================
// export-static.mjs — crawl the production server into a plain static folder.
//
// WHY NOT `output: 'export'`: this app relies on two things a Next static export
// cannot do. proxy.ts owns the whole URL policy (the trailing-slash rules and the
// /xkh55 exception), and the landing page reads searchParams to capture campaign
// attribution. Switching the app to export mode would mean deleting both — real
// damage to the real build, for a preview.
//
// So instead we run the actual production server and save what it returns. The
// HTML is byte-for-byte what ships, the URL shapes are preserved, and nothing in
// the app changes. Trailing-slash routes become dir/index.html, which is exactly
// what S3 and Hostinger expect.
//
//   npm run build && npm run export:static
// =============================================================================

import { mkdirSync, writeFileSync, cpSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'out-static');
const BASE = process.env.BASE_URL || 'http://localhost:3200';

const { games } = await import(`${ROOT}/content/games.generated.ts`).catch(() => ({ games: null }));

// Routes come from the app's own sitemap so this can never drift from reality.
async function routes() {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(/^https?:\/\/[^/]+/, ''),
  );
  return [...new Set(['/', ...urls])];
}

// The landing page lives at /xkh55 with NO trailing slash in production, which on
// a static host means an extensionless file — and an extensionless file is served
// as application/octet-stream unless the host is told otherwise, so the browser
// downloads it instead of rendering it. S3 needs Content-Type set by hand on that
// one object; Apache needs a ForceType.
//
// A preview should not need either, so it ships the directory form: /xkh55/ works
// on every static host with no configuration. The two forms cannot coexist (same
// name, file vs directory), which is what killed the first export run with EISDIR.
const LP_AS_DIRECTORY = true;
const LP_SLUG = 'xkh55';

// The LP ships as a DIRECTORY here (see above), so every in-page link to the
// slash-less /xkh55 has to gain the slash — otherwise a static host answers
// that URL with its error document, the visitor lands on something that is not
// the landing page, and the client router is left pointing at a route that was
// never served (which is what made every game tile stop responding). Exact
// match only: /xkh55/en/ must not be touched.
function rewriteForStatic(html) {
  if (!LP_AS_DIRECTORY) return html;
  return html.replaceAll(`href="/${LP_SLUG}"`, `href="/${LP_SLUG}/"`);
}

function fileFor(route) {
  if (route === '/') return join(OUT, 'index.html');
  const clean = route.replace(/^\/|\/$/g, '');
  if (clean === LP_SLUG && !LP_AS_DIRECTORY) return join(OUT, LP_SLUG);
  return join(OUT, clean, 'index.html');
}

async function main() {
  if (existsSync(OUT)) rmSync(OUT, { recursive: true });
  mkdirSync(OUT, { recursive: true });

  const list = await routes();
  let ok = 0;
  const failed = [];

  for (const route of list) {
    const res = await fetch(`${BASE}${route}`, { redirect: 'follow' });
    if (!res.ok) { failed.push(`${route} → ${res.status}`); continue; }
    const html = rewriteForStatic(await res.text());
    const file = fileFor(route);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
    ok++;
    if (ok % 40 === 0) process.stdout.write('.');
  }

  // Assets: the build output and everything in public/.
  cpSync(join(ROOT, '.next/static'), join(OUT, '_next/static'), { recursive: true });
  cpSync(join(ROOT, 'public'), OUT, { recursive: true });

  for (const f of ['robots.txt', 'sitemap.xml']) {
    const r = await fetch(`${BASE}/${f}`);
    if (r.ok) writeFileSync(join(OUT, f), await r.text());
  }

  // A 404 document for the host to point at.
  const nf = await fetch(`${BASE}/definitely-not-a-real-page/`);
  writeFileSync(join(OUT, '404.html'), await nf.text());

  console.log(`\n✓ ${ok} pages → out-static/`);
  if (games) console.log(`  ${games.length} games, artwork included`);
  if (failed.length) {
    console.log(`  ⚠ ${failed.length} failed:`);
    for (const f of failed.slice(0, 10)) console.log(`     ${f}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
