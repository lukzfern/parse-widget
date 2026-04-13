import { config } from '@/config';
import { useParses } from '@/hooks/useParses';
import { BossParseCard } from '@/components/BossParseCard';
import { formatParse, getParseColor } from '@/utils/parseColors';
import styles from './Widget.module.css';

export function Widget() {
  const { character, zoneName, loading, error, lastUpdated, refresh } = useParses();

  const rankings  = character?.zoneRankings?.rankings ?? [];
  const avg       = character?.zoneRankings?.bestPerformanceAverage ?? null;
  const classID   = character?.classID ?? 11;

  if (error) {
    return (
      <div role="alert" className={styles.error}>
        <p className={styles.errorTitle}>Connection error</p>
        <p className={styles.errorMsg}>{error}</p>
        <button className={styles.retry} onClick={refresh}>Retry</button>
      </div>
    );
  }

  if (loading && character === null) {
    return (
      <div role="status" aria-label="Loading parses" className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="WarcraftLogs Parses"
      aria-busy={loading}
      className={styles.widget}
    >
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
            <span className={styles.avgLabel}>Best avg</span>
            <span className={styles.avg} style={{ color: getParseColor(avg) }}>
              {formatParse(avg)}
            </span>
          </div>
        )}
      </div>

      {/* Boss list */}
      <div role="list" aria-live="polite" className={styles.bossList}>
        {rankings.length === 0 && !loading && (
          <p className={styles.empty}>No kills recorded yet.</p>
        )}
        {rankings.map((r, i) => (
          <BossParseCard key={r.encounter.id} ranking={r} classID={classID} index={i} />
        ))}
      </div>

      {/* Footer */}
      {lastUpdated !== null && (
        <div className={styles.footer}>
          Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {loading && <span className={styles.refreshing}> · refreshing…</span>}
        </div>
      )}
    </div>
  );
}

