import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FullPanel } from './FullPanel';
import type { UseParsesResult } from '@/hooks/useParses';
import { mockCharacterData } from '@/test/fixtures';

vi.mock('@/hooks/useParses');
vi.mock('@/hooks/useCountUp', () => ({
  useCountUp: (target: number) => target,
}));

import { useParses } from '@/hooks/useParses';
const mockUseParses = vi.mocked(useParses);

const baseResult: UseParsesResult = {
  character: null,
  zoneName: '',
  zoneId: null,
  loading: false,
  error: null,
  lastUpdated: null,
  refresh: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

describe('FullPanel — loading state', () => {
  it('shows a loading spinner when loading and no character data', () => {
    mockUseParses.mockReturnValue({ ...baseResult, loading: true });
    render(<FullPanel />);
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

describe('FullPanel — error state', () => {
  it('renders the error alert', () => {
    mockUseParses.mockReturnValue({ ...baseResult, error: 'API failed' });
    render(<FullPanel />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('API failed')).toBeInTheDocument();
  });

  it('calls refresh when Retry is clicked', async () => {
    const refresh = vi.fn();
    mockUseParses.mockReturnValue({ ...baseResult, error: 'Oops', refresh });
    render(<FullPanel />);
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(refresh).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// Data state
// ---------------------------------------------------------------------------

describe('FullPanel — data state', () => {
  beforeEach(() => {
    mockUseParses.mockReturnValue({
      ...baseResult,
      character: mockCharacterData(),
      zoneName: 'Manaforge Omega',
      zoneId: 42,
      lastUpdated: new Date(),
    });
  });

  it('renders the panel region', () => {
    render(<FullPanel />);
    expect(screen.getByRole('region', { name: /WarcraftLogs Parses/i })).toBeInTheDocument();
  });

  it('shows the character name', () => {
    render(<FullPanel />);
    expect(screen.getByText('Azurethane')).toBeInTheDocument();
  });

  it('shows the zone name', () => {
    render(<FullPanel />);
    expect(screen.getByText(/Manaforge Omega/)).toBeInTheDocument();
  });

  it('renders a list of boss cards', () => {
    render(<FullPanel />);
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
  });

  it('shows the best performance average', () => {
    render(<FullPanel />);
    // mockCharacterData has bestPerformanceAverage: 97.1
    expect(screen.getByText('97.1')).toBeInTheDocument();
  });

  it('shows world and realm ranks when allStars data is present', () => {
    render(<FullPanel />);
    // mockCharacterData has allStars: [{ rank: 42, serverRank: 3, regionRank: 18 }]
    expect(screen.getByText('#42')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
    expect(screen.getByText('Realm')).toBeInTheDocument();
    expect(screen.getByText('Region')).toBeInTheDocument();
  });

  it('hides the rank strip when allStars is null', () => {
    mockUseParses.mockReturnValue({
      ...baseResult,
      character: mockCharacterData({
        zoneRankings: {
          difficulty: 5,
          zone: 42,
          rankings: [],
          bestPerformanceAverage: null,
          medianPerformanceAverage: null,
          allStars: null,
        },
      }),
      zoneName: 'Empty Raid',
      zoneId: 42,
    });
    render(<FullPanel />);
    expect(screen.queryByText('World')).not.toBeInTheDocument();
    expect(screen.queryByText('Realm')).not.toBeInTheDocument();
  });

  it('shows "No kills recorded" when rankings are empty', () => {
    mockUseParses.mockReturnValue({
      ...baseResult,
      character: mockCharacterData({
        zoneRankings: {
          difficulty: 5,
          zone: 42,
          rankings: [],
          bestPerformanceAverage: null,
          medianPerformanceAverage: null,
          allStars: null,
        },
      }),
      zoneName: 'Empty Raid',
      zoneId: 42,
    });
    render(<FullPanel />);
    expect(screen.getByText(/No kills recorded yet/i)).toBeInTheDocument();
  });
});
