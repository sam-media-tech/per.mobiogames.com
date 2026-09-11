import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale, getDictionary, videoCategoryHref, href } from '@/lib/i18n';
import { videos, videoCategories, videoBySlug } from '@/content/videos.generated';
import { videoDesc } from '@/lib/describe';
import VideoCard from '@/components/VideoCard';
import SubscribeCta from '@/components/SubscribeCta';
import styles from './video.module.css';

// The player is a plain <video> element:
//   preload="none"  — nothing downloads until the visitor presses play. These
//                     files are ~48 MB, and on a prepaid Peruvian line that is
//                     the subscriber's money.
//   poster          — a local WebP, so the page still looks complete at 0 bytes.
//   playsInline     — iOS otherwise hijacks playback into fullscreen.

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => videos.map((v) => ({ lang, slug: v.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? (lang as Locale) : 'es';
  const video = videoBySlug(slug);
  if (!video) return {};
  return {
    title: video.title,
    description: videoDesc(locale, video.slug, video.descEn).slice(0, 155),
    alternates: {
      canonical: `/${locale}/video/${video.slug}/`,
      languages: {
        es: `/es/video/${video.slug}/`,
        en: `/en/video/${video.slug}/`,
        'x-default': `/es/video/${video.slug}/`,
      },
    },
  };
}

function mmss(seconds: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const video = videoBySlug(slug);
  if (!video) notFound();

  const t = getDictionary(locale);
  const es = locale === 'es';
  const cat = videoCategories.find((c) => c.slug === video.category);
  const related = videos.filter((v) => v.category === video.category && v.slug !== video.slug);

  return (
    <>
      <article className={styles.shell}>
        <p className={styles.crumbs}>
          <Link href={href(locale, 'videos')}>{t.video.title}</Link>
          <span aria-hidden="true"> / </span>
          {cat ? <Link href={videoCategoryHref(locale, cat.slug)}>{cat.label[locale]}</Link> : null}
        </p>

        <div className={styles.player}>
          <video
            className={styles.video}
            controls
            preload="none"
            playsInline
            poster={video.posterLg ?? undefined}
          >
            <source src={video.videoUrl} type="video/mp4" />
          </video>
        </div>

        <div className={styles.info}>
          <h1 className={styles.title}>{video.title}</h1>

          <p className={styles.tags}>
            {cat ? (
              <Link href={videoCategoryHref(locale, cat.slug)} className={styles.tag}>
                {cat.label[locale]}
              </Link>
            ) : null}
            <span className={styles.badge}>{es ? 'Grabado en 360°' : 'Filmed in 360°'}</span>
            {video.duration ? (
              <span className={styles.meta}>
                {t.video.duration} {mmss(video.duration)}
              </span>
            ) : null}
          </p>

          <p className={styles.desc}>{videoDesc(locale, video.slug, video.descEn)}</p>

          <p className={styles.note}>{t.video.note}</p>
          <p className={styles.dataNote}>{t.video.dataNote}</p>

          <SubscribeCta lang={locale} />
        </div>
      </article>

      {related.length ? (
        <section className={styles.related}>
          <div className={styles.relatedHead}>
            <h2 className={styles.relatedTitle}>{t.video.more}</h2>
            {cat ? (
              <Link href={videoCategoryHref(locale, cat.slug)} className={styles.relatedAll}>
                {t.home.railAll} <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>
          <ul className={styles.relatedGrid}>
            {related.map((v) => (
              <li key={v.slug}>
                <VideoCard video={v} lang={locale} size="grid" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
