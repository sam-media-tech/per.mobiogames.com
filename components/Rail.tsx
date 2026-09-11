import Link from 'next/link';
import type { Locale } from '@/lib/brand.config';
import { getDictionary } from '@/lib/i18n';
import type { Game } from '@/content/games.generated';
import GameCard from './GameCard';
import styles from './Rail.module.css';

// A store rail: horizontal, scroll-snapped, native overflow scrolling.
// No carousel JS, no arrows that might not work — the user swipes or drags the
// scrollbar, which behaves identically with JS disabled.

export default function Rail({
  title,
  games,
  lang,
  seeAllHref,
  priority = false,
  showBadges = true,
}: {
  title: string;
  games: Game[];
  lang: Locale;
  seeAllHref?: string;
  priority?: boolean;
  showBadges?: boolean;
}) {
  if (!games.length) return null;
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
        {games.map((g, i) => (
          <li key={g.slug} className={styles.item}>
            <GameCard game={g} lang={lang} priority={priority && i < 4} showBadge={showBadges} />
          </li>
        ))}
      </ul>
    </section>
  );
}
