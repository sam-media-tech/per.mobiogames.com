// =============================================================================
// import-games.mjs — one-shot build-time importer.
//
//   CSV  →  content/games.generated.ts   (typed, committed, so pages prerender)
//        →  public/games/<slug>.webp     (480w  card)
//        →  public/games/<slug>@lg.webp  (1200w hero / detail)
//
// WHY the local copies: the feed's "Thumbnail Link" values are not thumbnails, they
// are raw in-game art — the first one is 376 KB. Hotlinking 80 of those would fail
// Google's mobile page-experience requirement, so we fetch once and re-encode.
//
//   node scripts/import-games.mjs [path-to-csv]
// =============================================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';


// =============================================================================
// The provider's feed points at cdn.game-lords.com. That is a third-party
// hostname in the network tab of a page under Google review, which is one of
// the things this rebuild exists to remove — so the files are served from our
// own domain instead. Same content, verified 2026-09-11 by identical md5 on the
// game HTML, a second game and a nested CSS asset from both hosts.
//
// The old host keeps working, so deleting a line here rolls it back.
// =============================================================================
const HOST_MAP = {
  'cdn.game-lords.com': 'games.mobiogames.com',
};

function ownHost(url) {
  try {
    const u = new URL(url);
    const mapped = HOST_MAP[u.hostname];
    if (mapped) u.hostname = mapped;
    return u.toString();
  } catch {
    return url;
  }
}


const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSV =
  process.argv[2] || '/Users/ahmadhamzeh/Downloads/80 Forestry Games - Sheet1.csv';
const IMG_DIR = join(ROOT, 'public', 'games');
const OUT = join(ROOT, 'content', 'games.generated.ts');

// The feed's categories, mapped to our URL slugs and display labels.
const CATEGORIES = {
  'New Arrivals': { slug: 'novedades', es: 'Novedades', en: 'New Arrivals' },
  'Adventure': { slug: 'aventura', es: 'Aventura', en: 'Adventure' },
  'Casual': { slug: 'casual', es: 'Casual', en: 'Casual' },
  'Adrenaline Rush': { slug: 'adrenalina', es: 'Adrenalina', en: 'Adrenaline Rush' },
  'Arcade': { slug: 'arcade', es: 'Arcade', en: 'Arcade' },
};

// ---- minimal RFC4180 CSV parser (no deps; handles quotes, commas, CRLF) ----
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
      continue;
    }
    if (c === '"') { inQuotes = true; continue; }
    if (c === ',') { row.push(field); field = ''; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    if (c === '\r') continue;
    field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

function slugify(s) {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// The source art is wildly heterogeneous — sprite sheets, full backgrounds, loose
// character renders, several aspect ratios. Cropping to fill (even with sharp's
// attention strategy) chops heads off and turns backgrounds into brown rectangles.
//
// So: fill the tile with a blurred, darkened copy of the same image, then lay the
// WHOLE artwork on top, contained. Nothing is ever cut off, every tile is the same
// shape, and the rails read as one consistent set instead of 80 mismatched crops.
async function composite(buf, w, h, out, quality) {
  const backdrop = await sharp(buf)
    .resize(w, h, { fit: 'cover', position: 'centre' })
    .blur(Math.round(w / 22))
    .modulate({ brightness: 0.62, saturation: 1.15 })
    .toBuffer();

  // A generous, CONSTANT inset is what makes the grid look symmetric. With a
  // small inset, art that happens to be 4:3 fills the tile edge to edge while
  // everything else floats — so the rail reads as a mix of two treatments. At
  // ~18% every tile shows the same frame of blurred backdrop, and the set reads
  // as one deliberate style instead of eighty accidents.
  const front = await sharp(buf)
    .resize(Math.round(w * 0.82), Math.round(h * 0.82), {
      fit: 'inside',
      withoutEnlargement: false,
    })
    .toBuffer();

  await sharp(backdrop)
    .composite([{ input: front, gravity: 'centre' }])
    .webp({ quality })
    .toFile(out);
}

// Not every game is safe to embed. Each one is a third-party HTML5 build, and a
// few of them pull scripts from other domains — including Flurry and Ensighten,
// i.e. analytics we would be injecting into our own page through the iframe, and
// two that load over plain http and would be blocked as mixed content anyway.
// Removing third-party trackers is the entire point of this rebuild, so a game
// that carries its own is not offered as a demo. 70 of 80 are clean.
async function isEmbedSafe(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return false;
    const html = (await res.text()).slice(0, 200000);
    const hosts = [...html.matchAll(/src=["']https?:\/\/([a-z0-9.\-]+)/gi)].map((m) => m[1]);
    // Checked against the FEED's own host: this runs on the html fetched from
    // the provider, before any rewrite, so it must still match game-lords.
    return !hosts.some((h) => !h.includes('game-lords'));
  } catch {
    return false;
  }
}

async function fetchBuffer(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const rows = parseCsv(readFileSync(CSV, 'utf8'));
  const header = rows[0].map((h) => h.trim());
  const idx = (name) => header.indexOf(name);

  // NB: the source header really does spell it "Game LInk".
  const col = {
    title: idx('Game Title'),
    category: idx('Category'),
    year: idx('Release year'),
    hot: idx('Hot'),
    premium: idx('Premium'),
    desc: idx('Description'),
    play: idx('Game LInk') !== -1 ? idx('Game LInk') : idx('Game Link'),
    thumb: idx('Thumbnail Link'),
  };
  for (const [k, v] of Object.entries(col)) {
    if (v === -1) throw new Error(`CSV column missing: ${k}`);
  }

  mkdirSync(IMG_DIR, { recursive: true });

  const seen = new Set();
  const games = [];
  let imgOk = 0;
  let imgFail = 0;
  let demoBlocked = 0;

  for (const r of rows.slice(1)) {
    const title = (r[col.title] || '').trim();
    if (!title) continue; // drops the trailing "Total:" summary row

    const rawCat = (r[col.category] || '').trim();
    const cat = CATEGORIES[rawCat];
    if (!cat) { console.warn(`! unknown category "${rawCat}" on "${title}" — skipped`); continue; }

    let slug = slugify(title);
    let n = 2;
    while (seen.has(slug)) slug = `${slugify(title)}-${n++}`;
    seen.add(slug);

    const thumb = (r[col.thumb] || '').trim();
    let img = null;
    if (thumb) {
      const card = join(IMG_DIR, `${slug}.webp`);
      const large = join(IMG_DIR, `${slug}@lg.webp`);
      if (existsSync(card) && existsSync(large)) {
        img = true;
        imgOk++;
      } else {
        try {
          const buf = await fetchBuffer(thumb);
          await composite(buf, 480, 360, card, 78);
          await composite(buf, 1200, 675, large, 80);
          img = true;
          imgOk++;
          process.stdout.write('.');
        } catch (e) {
          imgFail++;
          console.warn(`\n! image failed for ${slug}: ${e.message}`);
        }
      }
    } else {
      imgFail++;
    }

    const demoSafe = (r[col.play] || '').trim() ? await isEmbedSafe((r[col.play] || '').trim()) : false;
    if (!demoSafe) demoBlocked++;

    games.push({
      slug,
      title,
      category: cat.slug,
      year: (r[col.year] || '').trim() || null,
      hot: (r[col.hot] || '').trim().toUpperCase() === 'TRUE',
      premium: (r[col.premium] || '').trim().toUpperCase() === 'TRUE',
      descEn: (r[col.desc] || '').trim().replace(/\s+/g, ' '),
      playUrl: ownHost((r[col.play] || '').trim()),
      demoSafe,
      image: img ? `/games/${slug}.webp` : null,
      imageLg: img ? `/games/${slug}@lg.webp` : null,
    });
  }

  const cats = Object.values(CATEGORIES).map((c) => ({
    slug: c.slug,
    label: { es: c.es, en: c.en },
    count: games.filter((g) => g.category === c.slug).length,
  }));

  const banner = `// GENERATED by scripts/import-games.mjs — do not edit by hand.
// Source: ${CSV.split('/').pop()}
// Regenerate with: npm run import:games
`;

  const body = `${banner}
export type Game = {
  slug: string;
  title: string;
  category: string;
  year: string | null;
  hot: boolean;
  premium: boolean;
  descEn: string;
  playUrl: string;
  /** false when the game pulls third-party scripts — it is then not offered as a demo. */
  demoSafe: boolean;
  image: string | null;
  imageLg: string | null;
};

export type Category = {
  slug: string;
  label: { es: string; en: string };
  count: number;
};

export const categories: Category[] = ${JSON.stringify(cats, null, 2)};

export const games: Game[] = ${JSON.stringify(games, null, 2)};

export const gameBySlug = (slug: string): Game | undefined =>
  games.find((g) => g.slug === slug);

export const gamesInCategory = (cat: string): Game[] =>
  games.filter((g) => g.category === cat);
`;

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, body);

  console.log(`\n✓ ${games.length} games → content/games.generated.ts`);
  console.log(`  images: ${imgOk} ok, ${imgFail} missing/failed`);
  console.log(`  demos:  ${games.length - demoBlocked} embeddable, ${demoBlocked} blocked (third-party scripts)`);
  for (const c of cats) console.log(`  ${String(c.count).padStart(3)}  ${c.label.es}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
