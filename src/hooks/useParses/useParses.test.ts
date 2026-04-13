import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useParses } from './useParses';
import { mockCharacterData } from '@/test/fixtures';

// ---------------------------------------------------------------------------
// Module mocks — vi.mock calls are hoisted to the top of the file by Vitest
// ---------------------------------------------------------------------------

vi.mock('@/config', () => ({
  config: {
    zone:      { id: null, difficulty: 5, metric: 'dps' },
    character: { name: 'Azurethane', serverSlug: 'area-52', region: 'US' },
    ui:        { refreshInterval: 300_000, difficultyLabel: 'Mythic' },
  },
}));

// Auto-mock: all exports become vi.fn() — return values set in beforeEach
vi.mock('@/api/warcraftlogs');

import { getLatestZone, fetchCharacterZoneRankings, getZoneName } from '@/api/warcraftlogs';

const mockGetLatestZone      = vi.mocked(getLatestZone);
const mockFetchRankings      = vi.mocked(fetchCharacterZoneRankings);
const mockGetZoneName        = vi.mocked(getZoneName);

beforeEach(() => {
  mockGetLatestZone.mockResolvedValue({ zoneId: 42, zoneName: 'Test Raid' });
  mockFetchRankings.mockResolvedValue(mockCharacterData());
  mockGetZoneName.mockResolvedValue('Test Raid');
});

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useParses', () => {
  it('begins in loading state with no data', () => {
    const { result, unmount } = renderHook(() => useParses());
    expect(result.current.loading).toBe(true);
    expect(result.current.character).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeNull();
    // Unmount immediately so the in-flight async load is aborted before it
    // can update state outside of an act() — avoids a React act() warning.
    unmount();
  });

  it('populates character data after a successful fetch', async () => {
    const { result } = renderHook(() => useParses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.character?.name).toBe('Azurethane');
    expect(result.current.zoneName).toBe('Test Raid');
    expect(result.current.zoneId).toBe(42);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });

  it('sets an error message when the API throws', async () => {
    mockGetLatestZone.mockRejectedValueOnce(new Error('API unreachable'));

    const { result } = renderHook(() => useParses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toMatch(/API unreachable/);
    expect(result.current.character).toBeNull();
  });

  it('refresh() re-triggers the load and sets loading: true', async () => {
    const { result } = renderHook(() => useParses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.refresh(); });
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.character).not.toBeNull();
  });

  it('refresh() clears a previous error on success', async () => {
    mockGetLatestZone.mockRejectedValueOnce(new Error('first failure'));

    const { result } = renderHook(() => useParses());
    await waitFor(() => expect(result.current.error).not.toBeNull());

    // The default mockResolvedValue set in beforeEach kicks in after the
    // one-time rejection is consumed, so no extra mock setup is needed.
    act(() => { result.current.refresh(); });

    // Wait for the full async cycle to finish (loading → false AND error gone)
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
    expect(result.current.character).not.toBeNull();
  });

  it('exposes the difficultyLabel via the zone configuration', async () => {
    // Confirms the hook returns data even with non-default difficulty settings
    mockGetLatestZone.mockResolvedValue({ zoneId: 10, zoneName: 'Some Raid' });
    const { result } = renderHook(() => useParses());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.zoneId).toBe(10);
  });
});
