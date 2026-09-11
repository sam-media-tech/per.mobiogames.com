import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/lib/brand.config';
import { videoHref } from '@/lib/i18n';
import { videoCategories, type Video } from '@/content/videos.generated';
import styles from './VideoCard.module.css';

// 16:9, unlike the 4:3 game tiles — the two catalogues should be tellable apart
// at a glance, and the footage is 16:9 anyway.

function mmss(seconds: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideoCard({
  video,
  lang,
  priority = false,
  size = 'rail',
}: {
  video: Video;
  lang: Locale;
  priority?: boolean;
  size?: 'rail' | 'grid';
}) {
  const cat = videoCategories.find((c) => c.slug === video.category);
  const length = mmss(video.duration);

  return (
    <Link href={videoHref(lang, video.slug)} className={styles.card} data-size={size}>
      <span className={styles.art}>
        {video.poster ? (
          <Image
            src={video.poster}
            alt=""
            width={480}
            height={270}
            className={styles.img}
            sizes="(max-width: 640px) 72vw, (max-width: 1000px) 40vw, 300px"
            priority={priority}
          />
        ) : (
          <span className={styles.fallback} aria-hidden="true" />
        )}

        <span className={styles.play} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>

        <span className={styles.badge}>360°</span>
        {length ? <span className={styles.time}>{length}</span> : null}
      </span>

      <span className={styles.meta}>
        <span className={styles.title}>{video.title}</span>
        <span className={styles.cat}>{cat ? cat.label[lang] : video.category}</span>
      </span>
    </Link>
  );
}
