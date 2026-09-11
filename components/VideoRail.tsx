import Link from 'next/link';
import type { Locale } from '@/lib/brand.config';
import { getDictionary } from '@/lib/i18n';
import type { Video } from '@/content/videos.generated';
import VideoCard from './VideoCard';
import styles from './Rail.module.css';

// Same scroll-snap rail as the games, with the wider 16:9 video cards. Shares
// Rail.module.css deliberately: one rail behaviour, two card shapes.

export default function VideoRail({
  title,
  videos,
  lang,
  seeAllHref,
}: {
  title: string;
  videos: Video[];
  lang: Locale;
  seeAllHref?: string;
}) {
  if (!videos.length) return null;
  const t = getDictionary(lang);

  return (
    <section className={styles.rail}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {seeAllHref ? (
          <Link href={seeAllHref} className={styles.all}>
            {t.home.railAll} <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>

      <ul className={styles.track}>
        {videos.map((v) => (
          <li key={v.slug} className={styles.item}>
            <VideoCard video={v} lang={lang} />
          </li>
        ))}
      </ul>
    </section>
  );
}
