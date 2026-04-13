import { config } from '@/config';
import { useParses } from '@/hooks/useParses';
import { BossPanelCard } from '@/components/BossPanelCard';
import { formatParse, getParseColor } from '@/utils/parseColors';
import styles from './FullPanel.module.css';

export function FullPanel() {
  const { character, zoneName, loading, error, lastUpdated, refresh } = useParses();

  const rankings  = character?.zoneRankings?.rankings ?? [];
  const avg        = character?.zoneRankings?.bestPerformanceAverage ?? null;
  const classID    = character?.classID ?? 11;
  const avgColor   = avg !== null ? getParseColor(avg) : 'rgba(255,255,255,0.2)';

  // Pick the best allStars entry (lowest world rank number = best)
  const allStarsEntries = character?.zoneRankings?.allStars ?? null;
  const bestAllStars = allStarsEntries && allStarsEntries.length > 0
    ? allStarsEntries.reduce((best, e) => e.rank < best.rank ? e : best)
    : null;

  if (error) {
    return (
      <div role="alert" className={styles.errorPanel}>
        <p className={styles.errorTitle}>Connection error</p>
        <p className={styles.errorMsg}>{error}</p>
        <button className={styles.retry} onClick={refresh}>Retry</button>
      </div>
    );
  }

  if (loading && character === null) {
    return (
      <div role="status" aria-label="Loading parses" className={styles.loadingPanel}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="WarcraftLogs Parses"
      aria-busy={loading}
      className={styles.panel}
    >
      {/* Top accent line — color driven by best avg parse */}
      <div
        className={styles.topAccent}
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${avgColor} 25%, ${avgColor} 75%, transparent 100%)`,
        }}
      />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.charName}>{character?.name}</span>
          <span className={styles.zoneInfo}>
            {zoneName} &middot; {config.ui.difficultyLabel}
          </span>
        </div>

        {avg !== null && (
          <div className={styles.avgBlock}>
            <span className={styles.avg} style={{ color: avgColor }}>
              {formatParse(avg)}
            </span>
          </div>
        )}
      </div>

      {/* Rank strip — world & realm ranks from allStars */}
      {bestAllStars && (
        <div className={styles.rankStrip}>
          <span className={styles.rankPill}>
            <span className={styles.rankLabel}>World</span>
            <span className={styles.rankValue}>#{bestAllStars.rank.toLocaleString()}</span>
          </span>
          <div aria-hidden className={styles.rankDivider} />
          <span className={styles.rankPill}>
            <span className={styles.rankLabel}>Realm</span>
            <span className={styles.rankValue}>#{bestAllStars.serverRank.toLocaleString()}</span>
          </span>
          {bestAllStars.regionRank != null && bestAllStars.regionRank > 0 && (
            <>
              <div aria-hidden className={styles.rankDivider} />
              <span className={styles.rankPill}>
                <span className={styles.rankLabel}>Region</span>
                <span className={styles.rankValue}>#{bestAllStars.regionRank.toLocaleString()}</span>
              </span>
            </>
          )}
        </div>
      )}

      {/* Boss grid — 2 columns, rows fill remaining height */}
      <div role="list" aria-live="polite" className={styles.bossGrid}>
        {rankings.length === 0 && !loading && (
          <p className={styles.empty}>No kills recorded yet.</p>
        )}
        {rankings.map((r, i) => (
          <BossPanelCard key={r.encounter.id} ranking={r} classID={classID} index={i} />
        ))}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        {loading
          ? <span className={styles.refreshing}>Refreshing…</span>
          : lastUpdated !== null && (
              <span>
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )
        }
      </div>
    </div>
  );
}
