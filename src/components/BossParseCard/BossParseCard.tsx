import { useEffect, useState } from 'react';
import clsx from 'clsx';
import type { BossRanking } from '@/types/warcraftlogs';
import { getParseColor, getParseTier } from '@/utils/parseColors';
import { getSpecIconUrl } from '@/utils/specIcons';
import { useCountUp } from '@/hooks/useCountUp';
import { ParseBar } from '@/components/ParseBar';
import styles from './BossParseCard.module.css';

interface BossParseCardProps {
  ranking: BossRanking;
  classID: number;
  index: number;
}

export function BossParseCard({ ranking, classID, index }: BossParseCardProps) {
  const [visible, setVisible] = useState(false);

  const hasKill = ranking.totalKills > 0;
  const target  = hasKill ? ranking.rankPercent : 0;
  const color   = getParseColor(target);
  const tier    = getParseTier(target);
  const iconUrl = hasKill ? getSpecIconUrl(classID, ranking.bestSpec) : '';

  const animatedValue = useCountUp(target);

  // Staggered slide-in: each card enters 55 ms after the previous one
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), index * 55);
    return () => clearTimeout(id);
  }, [index]);

  const isGlowing = tier === 'gold' || tier === 'pink';
  const tierClass = `tier${tier.charAt(0).toUpperCase()}${tier.slice(1)}` as keyof typeof styles;

  const ariaLabel = hasKill
    ? `${ranking.encounter.name}: ${Math.floor(ranking.rankPercent)}%`
    : `${ranking.encounter.name}: no kills`;

  return (
    <div
      role="listitem"
      aria-label={ariaLabel}
      className={clsx(styles.card, styles[tierClass], { [styles.visible]: visible })}
    >
      {/* Left accent strip */}
      <div className={styles.accent} style={{ backgroundColor: color }} />

      {/* Boss name */}
      <span className={styles.name}>{ranking.encounter.name}</span>

      {/* Right cluster */}
      <div className={styles.right}>
        <ParseBar percent={target} />

        {hasKill && iconUrl && (
          <img
            className={styles.specIcon}
            src={iconUrl}
            alt={ranking.bestSpec}
            title={ranking.bestSpec}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        <span
          className={clsx(styles.percent, { [styles.glow]: isGlowing })}
          style={{ color }}
        >
          {hasKill ? String(Math.floor(animatedValue)) : '—'}
        </span>

        <span className={styles.rank}>
          {hasKill && ranking.allStars?.rank ? `#${ranking.allStars.rank}` : ''}
        </span>
      </div>
    </div>
  );
}

