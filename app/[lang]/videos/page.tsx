import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale, getDictionary, videoCategoryHref, href } from '@/lib/i18n';
import { videos, videoCategories } from '@/content/videos.generated';
import VideoCard from '@/components/VideoCard';
import SubscribeCta from '@/components/SubscribeCta';
import styles from './videos.module.css';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? (lang as Locale) : 'es';
  const t = getDictionary(locale);
  return {
    title: t.video.title,
    description: t.video.subtitle,
    alternates: {
      canonical: `/${locale}/videos/`,
      languages: { es: '/es/videos/', en: '/en/videos/', 'x-default': '/es/videos/' },
    },
  };
}

export default async function VideosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = getDictionary(locale);

  return (
    <>
      <div className={styles.shell}>
        <h1 className={styles.title}>{t.video.title}</h1>
        <p className={styles.sub}>{t.video.subtitle}</p>
        <p className={styles.count}>{t.video.count(videos.length)}</p>

        <ul className={styles.filters}>
          <li>
            <Link href={href(locale, 'videos')} className={styles.chip} data-active="true">
              {t.catalog.all} <span className={styles.chipCount}>{videos.length}</span>
            </Link>
          </li>
          {videoCategories.map((c) => (
            <li key={c.slug}>
              <Link href={videoCategoryHref(locale, c.slug)} className={styles.chip}>
                {c.label[locale]} <span className={styles.chipCount}>{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Peru is a prepaid-heavy market and these files are large. Saying so is
            simple honesty about a cost the visitor bears. */}
        <p className={styles.dataNote}>{t.video.dataNote}</p>

        <ul className={styles.grid}>
          {videos.map((v, i) => (
            <li key={v.slug}>
              <VideoCard video={v} lang={locale} size="grid" priority={i < 3} />
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.ctaBlock}>
        <SubscribeCta lang={locale} />
      </div>
    </>
  );
}
