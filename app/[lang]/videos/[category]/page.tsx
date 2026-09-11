import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale, getDictionary, videoCategoryHref, href } from '@/lib/i18n';
import { videos, videoCategories } from '@/content/videos.generated';
import VideoCard from '@/components/VideoCard';
import SubscribeCta from '@/components/SubscribeCta';
import styles from '../videos.module.css';

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => videoCategories.map((c) => ({ lang, category: c.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}): Promise<Metadata> {
  const { lang, category } = await params;
  const locale = isLocale(lang) ? (lang as Locale) : 'es';
  const cat = videoCategories.find((c) => c.slug === category);
  if (!cat) return {};
  const t = getDictionary(locale);
  return {
    title: cat.label[locale],
    description: t.seo.videoCategory(cat.label[locale], cat.count),
    alternates: {
      canonical: `/${locale}/videos/${cat.slug}/`,
      languages: {
        es: `/es/videos/${cat.slug}/`,
        en: `/en/videos/${cat.slug}/`,
        'x-default': `/es/videos/${cat.slug}/`,
      },
    },
  };
}

export default async function VideoCategoryPage({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}) {
  const { lang, category } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const cat = videoCategories.find((c) => c.slug === category);
  if (!cat) notFound();

  const t = getDictionary(locale);
  const list = videos.filter((v) => v.category === cat.slug);

  return (
    <>
      <div className={styles.shell}>
        <h1 className={styles.title}>{cat.label[locale]}</h1>
        <p className={styles.sub}>{t.video.subtitle}</p>
        <p className={styles.count}>{t.video.count(list.length)}</p>

        <ul className={styles.filters}>
          <li>
            <Link href={href(locale, 'videos')} className={styles.chip}>
              {t.catalog.all} <span className={styles.chipCount}>{videos.length}</span>
            </Link>
          </li>
          {videoCategories.map((c) => (
            <li key={c.slug}>
              <Link
                href={videoCategoryHref(locale, c.slug)}
                className={styles.chip}
                data-active={c.slug === cat.slug ? 'true' : undefined}
              >
                {c.label[locale]} <span className={styles.chipCount}>{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className={styles.dataNote}>{t.video.dataNote}</p>

        {list.length ? (
          <ul className={styles.grid}>
            {list.map((v, i) => (
              <li key={v.slug}>
                <VideoCard video={v} lang={locale} size="grid" priority={i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>{t.video.empty}</p>
        )}
      </div>

      <div className={styles.ctaBlock}>
        <SubscribeCta lang={locale} />
      </div>
    </>
  );
}
