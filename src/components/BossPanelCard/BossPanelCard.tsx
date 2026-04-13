import { useEffect, useState } from 'react';
import clsx from 'clsx';
import type { BossRanking } from '@/types/warcraftlogs';
import { getParseColor, getParseTier } from '@/utils/parseColors';
import { getSpecIconUrl } from '@/utils/specIcons';
import { useCountUp } from '@/hooks/useCountUp';
import styles from './BossPanelCard.module.css';

interface BossPanelCardProps {
  ranking: BossRanking;
  classID: number;
  index: number;
}

export function BossPanelCard({ ranking, classID, index }: BossPanelCardProps) {
  const [visible, setVisible] = useState(false);

  const hasKill      = ranking.totalKills > 0;
  const target        = hasKill ? ranking.rankPercent : 0;
  const color         = getParseColor(target);
  const tier          = getParseTier(target);
  const iconUrl       = hasKill ? getSpecIconUrl(classID, ranking.bestSpec) : '';
  const animatedValue = useCountUp(target);

  // Staggered slide-up entrance — each card 65 ms after the previous
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), index * 65);
    return () => clearTimeout(id);
  }, [index]);

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

      {/* Spec icon */}
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

      {/* Parse % — hero element, vh-sized so it reads at any OBS scale */}
      <span
        className={styles.percent}
        style={{ color }}
      >
        {hasKill ? String(Math.floor(animatedValue)) : '—'}
      </span>
    </div>
  );
}
