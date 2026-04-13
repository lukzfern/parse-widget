/**
 * Maps WarcraftLogs classID values to their classicon slug used in WoW game files.
 * Spec icons are served by Wowhead's public CDN (no hotlink protection).
 * Format: https://wow.zamimg.com/images/wow/icons/medium/classicon_{class}_{spec}.jpg
 */
const CLASS_ICON_SLUGS: Record<number, string> = {
  1:  'deathknight',
  2:  'druid',
  3:  'hunter',
  4:  'mage',
  5:  'monk',
  6:  'paladin',
  7:  'priest',
  8:  'rogue',
  9:  'shaman',
  10: 'warlock',
  11: 'warrior',
  12: 'demonhunter',
  13: 'evoker',
};

/**
 * Returns a Wowhead CDN URL for the given class + spec combination.
 * e.g. classID=13, spec="Devastation" → .../classicon_evoker_devastation.jpg
 */
export function getSpecIconUrl(classID: number, spec: string | undefined): string {
  if (!spec) return '';
  const classSlug = CLASS_ICON_SLUGS[classID];
  if (!classSlug) return '';
  const specSlug = spec.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
  return `https://wow.zamimg.com/images/wow/icons/medium/classicon_${classSlug}_${specSlug}.jpg`;
}

