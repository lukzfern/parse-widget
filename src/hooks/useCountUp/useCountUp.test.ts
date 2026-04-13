import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCountUp } from './useCountUp';

/**
 * jsdom's rAF polyfill passes timestamps from a different clock than
 * performance.now(), causing `now - startTime` to be a large negative number.
 * We stub rAF to use performance.now() so both clocks are aligned.
 */
beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => {
    const id = setTimeout(() => fn(performance.now()), 16);
    return id as unknown as number;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useCountUp', () => {
  it('starts at 0 for any target', () => {
    const { result } = renderHook(() => useCountUp(80));
    expect(result.current).toBe(0);
  });

  it('stays at 0 when target is 0', async () => {
    const { result } = renderHook(() => useCountUp(0));
    await new Promise<void>((r) => setTimeout(r, 50));
    expect(result.current).toBe(0);
  });

  it('eventually reaches the target', async () => {
    const { result } = renderHook(() => useCountUp(100));
    await waitFor(() => {
      expect(result.current).toBeCloseTo(100, 0);
    }, { timeout: 2000 });
  });

  it('resets and re-animates when target changes', async () => {
    const { result, rerender } = renderHook(
      ({ target }: { target: number }) => useCountUp(target),
      { initialProps: { target: 50 } },
    );
    await waitFor(() => expect(result.current).toBeCloseTo(50, 0));

    rerender({ target: 80 });
    await waitFor(() => expect(result.current).toBeCloseTo(80, 0), { timeout: 2000 });
  });

  it('resets to 0 when target becomes 0', async () => {
    const { result, rerender } = renderHook(
      ({ target }: { target: number }) => useCountUp(target),
      { initialProps: { target: 60 } },
    );
    await waitFor(() => expect(result.current).toBeCloseTo(60, 0));

    rerender({ target: 0 });
    await waitFor(() => expect(result.current).toBe(0));
  });
});

