// =============================================================================
// import-videos.mjs — build-time importer for the BeyondVR video catalogue.
//
//   CSV  →  content/videos.generated.ts
//        →  public/videos/<slug>.webp     (480w  card poster)
//        →  public/videos/<slug>@lg.webp  (1200w hero / detail poster)
//
// The feed ships no thumbnails at all, so posters are grabbed straight out of
// the footage with ffmpeg (a frame ~25% in, which avoids title cards and fades).
//
// ⚠️ ONLY the categories in ALLOW are imported. The 18 "Travel" videos are held
// back because the YouTube play-button logo is burned into the picture — see
// scripts/check-watermark.mjs. Selling YouTube-sourced footage through a paid
// carrier subscription is a copyright exposure, and the watermark is visible
// evidence of it on the face of the product. Once the provenance of that pack is
// confirmed, adding 'Travel' here is the only change needed.
//
//   node scripts/import-videos.mjs [path-to-csv]
// =============================================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';

const run = (cmd, args) => promisify(execFile)(cmd, args, { maxBuffer: 64 * 1024 * 1024 });
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSV =
  process.argv[2] ||
  '/Users/ahmadhamzeh/Downloads/New VR Videos & Movies upload_2026 - BeyondVR.csv';
const IMG_DIR = join(ROOT, 'public', 'videos');
const OUT = join(ROOT, 'content', 'videos.generated.ts');
const TMP = join(ROOT, '.video-frames');


// =============================================================================
// The supplier's CSV points at cdn.beyond-vr.com. That hostname is shared with
// other SAM properties, and a third-party-looking host in the network tab is
// one of the things this rebuild exists to remove — so the files are served
// from our own domain instead. Same CloudFront distribution, same S3 bucket,
// same bytes (verified 2026-09-11: identical md5 on the first 64KB from both
// hosts); only the hostname differs, via an alternate domain name on the
// distribution.
//
// The old host keeps working, so deleting a line here rolls it back.
// =============================================================================
const HOST_MAP = {
  'cdn.beyond-vr.com': 'video.mobiogames.com',
  // 'cdn.game-lords.com': 'games.mobiogames.com',  ← not resolving yet (2026-09-11)
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

const ALLOW = {
  Documentary: { slug: 'documentales', es: 'Documentales', en: 'Documentaries' },
  Music: { slug: 'musica', es: 'Música', en: 'Music' },
};

// Held back pending provenance. Kept here so the reason travels with the code.
const HELD = {
  Travel: 'youtube watermark burned into the picture',
  Meditation:
    'files are ~265 MB each and stream with the moov atom at the end, so they cannot be verified or played progressively — needs re-encoding before it ships',
};

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

async function probeDuration(url) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    url,
  ]);
  const d = parseFloat(stdout.trim());
  return Number.isFinite(d) ? d : 0;
}

// A frame from a quarter of the way in: past any intro card, before the outro.
async function poster(url, slug, duration) {
  const raw = join(TMP, `${slug}.jpg`);
  // Some files refuse a fast seek (no keyframe near the requested point, or a
  // damaged index), so fall back to progressively earlier positions.
  const points = [Math.max(2, Math.min(duration * 0.25, duration - 2)), 10, 3, 0];
  let ok = false;
  for (const at of points) {
    try {
      await run('ffmpeg', ['-v', 'error', '-ss', String(at), '-i', url, '-frames:v', '1', '-y', raw]);
      if (existsSync(raw) && statSync(raw).size > 1000) { ok = true; break; }
    } catch { /* try the next point */ }
  }
  if (!ok) throw new Error('no frame could be decoded');

  await sharp(raw).resize(480, 270, { fit: 'cover' }).webp({ quality: 80 })
    .toFile(join(IMG_DIR, `${slug}.webp`));
  await sharp(raw).resize(1200, 675, { fit: 'cover' }).webp({ quality: 82 })
    .toFile(join(IMG_DIR, `${slug}@lg.webp`));
}

async function main() {
  const rows = parseCsv(readFileSync(CSV, 'utf8'));
  const header = rows[0].map((h) => h.trim());
  const col = {
    category: header.indexOf('Category'),
    title: header.indexOf('Title'),
    video: header.indexOf('Videos'),
    desc: header.indexOf('Description'),
  };
  for (const [k, v] of Object.entries(col)) {
    if (v === -1) throw new Error(`CSV column missing: ${k}`);
  }

  mkdirSync(IMG_DIR, { recursive: true });
  mkdirSync(TMP, { recursive: true });

  // The Category cell is only filled on the first row of each group.
  let current = '';
  const items = [];
  const held = [];
  for (const r of rows.slice(1)) {
    const c = (r[col.category] || '').trim();
    if (c) current = c;
    const title = (r[col.title] || '').trim();
    const url = (r[col.video] || '').trim();
    if (!title || !url) continue;
    if (HELD[current]) { held.push(title); continue; }
    if (!ALLOW[current]) { console.warn(`! unknown category "${current}" on "${title}"`); continue; }
    items.push({ cat: current, title, url, desc: (r[col.desc] || '').trim() });
  }

  const seen = new Set();
  const videos = [];
  for (const it of items) {
    let slug = slugify(it.title);
    let n = 2;
    while (seen.has(slug)) slug = `${slugify(it.title)}-${n++}`;
    seen.add(slug);

    let duration = 0;
    let hasPoster = false;
    try {
      duration = await probeDuration(it.url);
      if (existsSync(join(IMG_DIR, `${slug}.webp`))) hasPoster = true;
      else { await poster(it.url, slug, duration); hasPoster = true; }
      process.stdout.write('.');
    } catch (e) {
      console.warn(`\n! poster failed for ${slug}: ${e.message}`);
    }

    videos.push({
      slug,
      title: it.title,
      category: ALLOW[it.cat].slug,
      descEn: it.desc.replace(/\s+/g, ' '),
      videoUrl: ownHost(it.url),
      duration: Math.round(duration),
      poster: hasPoster ? `/videos/${slug}.webp` : null,
      posterLg: hasPoster ? `/videos/${slug}@lg.webp` : null,
    });
  }

  const cats = Object.values(ALLOW).map((c) => ({
    slug: c.slug,
    label: { es: c.es, en: c.en },
    count: videos.filter((v) => v.category === c.slug).length,
  }));

  writeFileSync(
    OUT,
    `// GENERATED by scripts/import-videos.mjs — do not edit by hand.
// Regenerate with: npm run import:videos
//
// HELD BACK: ${held.length} videos.
${Object.entries(HELD).map(([k, v]) => `//   ${k}: ${v}`).join('\n')}

export type Video = {
  slug: string;
  title: string;
  category: string;
  descEn: string;
  videoUrl: string;
  duration: number;
  poster: string | null;
  posterLg: string | null;
};

export type VideoCategory = {
  slug: string;
  label: { es: string; en: string };
  count: number;
};

export const videoCategories: VideoCategory[] = ${JSON.stringify(cats, null, 2)};

export const videos: Video[] = ${JSON.stringify(videos, null, 2)};

export const videoBySlug = (slug: string): Video | undefined =>
  videos.find((v) => v.slug === slug);
`,
  );

  rmSync(TMP, { recursive: true, force: true });

  console.log(`\n✓ ${videos.length} videos → content/videos.generated.ts`);
  console.log(`  held back: ${held.length}`);
  for (const [k, v] of Object.entries(HELD)) console.log(`    ${k}: ${v}`);
  for (const c of cats) console.log(`  ${String(c.count).padStart(3)}  ${c.label.es}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
