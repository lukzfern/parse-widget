import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Widget } from './Widget';
import type { UseParsesResult } from '@/hooks/useParses';
import { mockCharacterData } from '@/test/fixtures';

vi.mock('@/hooks/useParses');
vi.mock('@/hooks/useCountUp', () => ({
  useCountUp: (target: number) => target,
}));

// Import the mock so we can configure return values
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

describe('Widget — loading state', () => {
  it('shows a loading spinner when loading and no character data', () => {
    mockUseParses.mockReturnValue({ ...baseResult, loading: true });
    render(<Widget />);
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });
});

describe('Widget — error state', () => {
  it('renders the error message', () => {
    mockUseParses.mockReturnValue({
      ...baseResult,
      error: 'Something went wrong',
    });
    render(<Widget />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls refresh when the Retry button is clicked', async () => {
    const refresh = vi.fn();
    mockUseParses.mockReturnValue({
      ...baseResult,
      error: 'Oops',
      refresh,
    });
    render(<Widget />);
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(refresh).toHaveBeenCalledOnce();
  });
});

describe('Widget — data state', () => {
  beforeEach(() => {
    mockUseParses.mockReturnValue({
      ...baseResult,
      character: mockCharacterData(),
      zoneName: 'Manaforge Omega',
      zoneId: 42,
      lastUpdated: new Date(),
    });
  });

  it('renders a region with the widget label', () => {
    render(<Widget />);
    expect(
      screen.getByRole('region', { name: /WarcraftLogs Parses/i }),
    ).toBeInTheDocument();
  });

  it('shows the character name', () => {
    render(<Widget />);
    expect(screen.getByText('Azurethane')).toBeInTheDocument();
  });

  it('shows the zone name', () => {
    render(<Widget />);
    expect(screen.getByText(/Manaforge Omega/)).toBeInTheDocument();
  });

  it('renders a list of boss cards', () => {
    render(<Widget />);
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
  });

  it('shows the best performance average', () => {
    render(<Widget />);
    // mockCharacterData has bestPerformanceAverage: 97.1
    expect(screen.getByText('97.1')).toBeInTheDocument();
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
        },
      }),
      zoneName: 'Empty Raid',
      zoneId: 42,
    });
    render(<Widget />);
    expect(screen.getByText(/No kills recorded yet/i)).toBeInTheDocument();
  });
});
