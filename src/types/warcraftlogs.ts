export interface BossRanking {
  encounter: { id: number; name: string };
  rankPercent: number;
  medianPercent: number;
  totalKills: number;
  fastestKill: number;
  spec: string;
  bestSpec: string;
  bestAmount: number;
  allStars: { points: number; rank: number; rankPercent: number } | null;
  lockedIn: boolean;
}

export interface ZoneAllStars {
  spec: string;
  points: number;
  rank: number;
  regionRank: number;
  serverRank: number;
  rankPercent: number;
}

export interface ZoneRankingsPayload {
  difficulty: number;
  zone: number;
  rankings: BossRanking[];
  bestPerformanceAverage: number | null;
  medianPerformanceAverage: number | null;
  allStars: ZoneAllStars[] | null;
}

export interface CharacterData {
  name: string;
  classID: number;
  zoneRankings: ZoneRankingsPayload;
}

export interface Zone {
  id: number;
  name: string;
  frozen: boolean;
}

export interface Expansion {
  id: number;
  name: string;
  zones: Zone[];
}
