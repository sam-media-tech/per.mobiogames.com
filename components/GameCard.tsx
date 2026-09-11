import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/lib/brand.config';
import { gameHref } from '@/lib/i18n';
import { categories, type Game } from '@/content/games.generated';
import styles from './GameCard.module.css';

// Every card is a real link to a real page. Nothing decorative — Google's
// reviewers click through interactive elements, and a card that goes nowhere
// is a documented suspension trigger.

export default function GameCard({
  game,
  lang,
  priority = false,
  size = 'rail',
  showBadge = true,
}: {
  game: Game;
  lang: Locale;
  priority?: boolean;
  size?: 'rail' | 'grid';
  showBadge?: boolean;
}) {
  const cat = categories.find((c) => c.slug === game.category);

  return (
    <Link href={gameHref(lang, game.slug)} className={styles.card} data-size={size}>
      <span className={styles.art}>
        {game.image ? (
          <Image
            src={game.image}
            alt=""
            width={480}
            height={360}
            className={styles.img}
            sizes="(max-width: 640px) 46vw, (max-width: 1000px) 30vw, 232px"
            priority={priority}
          />
        ) : (
          <span className={styles.fallback} aria-hidden="true" />
        )}
        {/* Editorial pick, not a popularity claim — an unverifiable "most played"
            badge would be an unsubstantiated claim. */}
        {game.hot && showBadge ? (
          <span className={styles.hot}>{lang === 'es' ? 'Destacado' : 'Featured'}</span>
        ) : null}
      </span>

      <span className={styles.meta}>
        <span className={styles.title}>{game.title}</span>
        <span className={styles.cat}>{cat ? cat.label[lang] : game.category}</span>
      </span>
    </Link>
  );
}
