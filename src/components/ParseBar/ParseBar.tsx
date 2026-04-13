import { useEffect, useState } from 'react';
import { getParseColor } from '@/utils/parseColors';
import styles from './ParseBar.module.css';

interface ParseBarProps {
  percent: number;
}

export function ParseBar({ percent }: ParseBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Defer by one frame so the CSS transition plays visibly after mount
    const id = setTimeout(() => setWidth(percent), 80);
    return () => clearTimeout(id);
  }, [percent]);

  const color = getParseColor(percent);

  return (
    <div className={styles.track}>
      <div
        className={styles.fill}
        style={{
          width: `${width}%`,
          backgroundColor: color,
          boxShadow: percent >= 95 ? `0 0 6px 1px ${color}88` : 'none',
        }}
      />
    </div>
  );
}

