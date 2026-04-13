export type ParseTier = 'gray' | 'green' | 'blue' | 'purple' | 'orange' | 'pink' | 'gold';

/** Exact colors WarcraftLogs uses for each parse tier. */
export const PARSE_COLORS: Record<ParseTier, string> = {
  gray:   '#9d9d9d',
  green:  '#1eff00',
  blue:   '#0070ff',
  purple: '#a335ee',
  orange: '#ff8000',
  pink:   '#e268a8',
  gold:   '#e5cc80',
};

export function getParseColor(percent: number): string {
  if (percent === 100) return PARSE_COLORS.gold;
  if (percent >= 99)   return PARSE_COLORS.pink;
  if (percent >= 95)   return PARSE_COLORS.orange;
  if (percent >= 75)   return PARSE_COLORS.purple;
  if (percent >= 50)   return PARSE_COLORS.blue;
  if (percent >= 25)   return PARSE_COLORS.green;
  return PARSE_COLORS.gray;
}

export function getParseTier(percent: number): ParseTier {
  if (percent === 100) return 'gold';
  if (percent >= 99)   return 'pink';
  if (percent >= 95)   return 'orange';
  if (percent >= 75)   return 'purple';
  if (percent >= 50)   return 'blue';
  if (percent >= 25)   return 'green';
  return 'gray';
}

/** Format parse % for display — no decimals for clean integers, one decimal otherwise. */
export function formatParse(percent: number): string {
  if (percent === 0) return '--';
  return Number.isInteger(percent) ? String(percent) : percent.toFixed(1);
}
