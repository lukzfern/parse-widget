import type { BossRanking, CharacterData } from '@/types/warcraftlogs';

export const mockBossRanking = (overrides: Partial<BossRanking> = {}): BossRanking => ({
  encounter: { id: 1, name: 'The Coaglamation' },
  rankPercent: 95.4,
  medianPercent: 80.0,
  totalKills: 12,
  fastestKill: 183000,
  spec: 'Devastation',
  bestSpec: 'Devastation',
  bestAmount: 650000,
  allStars: { points: 1234.5, rank: 3, rankPercent: 99.1 },
  lockedIn: false,
  ...overrides,
});

export const mockBossRankingNoKill = (overrides: Partial<BossRanking> = {}): BossRanking =>
  mockBossRanking({
    rankPercent: 0,
    medianPercent: 0,
    totalKills: 0,
    fastestKill: 0,
    spec: '',
    bestSpec: '',
    bestAmount: 0,
    allStars: null,
    ...overrides,
  });

export const mockCharacterData = (overrides: Partial<CharacterData> = {}): CharacterData => ({
  name: 'Azurethane',
  classID: 13, // Evoker
  zoneRankings: {
    difficulty: 5,
    zone: 42,
    rankings: [
      mockBossRanking({ encounter: { id: 1, name: 'The Coaglamation' }, rankPercent: 95 }),
      mockBossRanking({ encounter: { id: 2, name: 'Rasha\'nan' }, rankPercent: 99, allStars: { points: 2000, rank: 1, rankPercent: 100 } }),
      mockBossRankingNoKill({ encounter: { id: 3, name: 'Silken Court' } }),
    ],
    bestPerformanceAverage: 97.1,
    medianPerformanceAverage: 82.3,
  },
  ...overrides,
});
