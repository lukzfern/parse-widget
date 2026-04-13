import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BossParseCard } from './BossParseCard';
import { mockBossRanking, mockBossRankingNoKill } from '@/test/fixtures';

// Stub useCountUp to return the target synchronously (no animation in tests)
vi.mock('@/hooks/useCountUp', () => ({
  useCountUp: (target: number) => target,
}));

describe('BossParseCard', () => {
  it('renders the boss name', () => {
    render(
      <BossParseCard
        ranking={mockBossRanking({ encounter: { id: 1, name: 'Mythic Boss' } })}
        classID={13}
        index={0}
      />,
    );
    expect(screen.getByText('Mythic Boss')).toBeInTheDocument();
  });

  it('shows — when there are no kills', () => {
    render(
      <BossParseCard ranking={mockBossRankingNoKill()} classID={13} index={0} />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows the floored parse percent when there are kills', () => {
    render(
      <BossParseCard
        ranking={mockBossRanking({ rankPercent: 99.8 })}
        classID={13}
        index={0}
      />,
    );
    // Math.floor(99.8) = 99
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('shows the allStars rank', () => {
    render(
      <BossParseCard
        ranking={mockBossRanking({ allStars: { points: 500, rank: 7, rankPercent: 98 } })}
        classID={13}
        index={0}
      />,
    );
    expect(screen.getByText('#7')).toBeInTheDocument();
  });

  it('does not show a rank when there are no kills', () => {
    const { container } = render(
      <BossParseCard ranking={mockBossRankingNoKill()} classID={13} index={0} />,
    );
    expect(container.textContent).not.toMatch(/#\d/);
  });

  it('renders a spec icon img when there are kills', () => {
    render(
      <BossParseCard
        ranking={mockBossRanking({ bestSpec: 'Devastation' })}
        classID={13}
        index={0}
      />,
    );
    const img = screen.getByRole('img', { name: 'Devastation' });
    expect(img).toBeInTheDocument();
    expect((img as HTMLImageElement).src).toContain('evoker_devastation');
  });

  it('does not render a spec icon when there are no kills', () => {
    render(
      <BossParseCard ranking={mockBossRankingNoKill()} classID={13} index={0} />,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('has role="listitem" and a descriptive aria-label with a kill', () => {
    render(
      <BossParseCard
        ranking={mockBossRanking({ encounter: { id: 1, name: 'The Boss' }, rankPercent: 95.4 })}
        classID={13}
        index={0}
      />,
    );
    const item = screen.getByRole('listitem');
    // Math.floor(95.4) = 95
    expect(item).toHaveAccessibleName('The Boss: 95%');
  });

  it('has role="listitem" and no-kills aria-label', () => {
    render(
      <BossParseCard
        ranking={mockBossRankingNoKill({ encounter: { id: 2, name: 'Hard Boss' } })}
        classID={13}
        index={0}
      />,
    );
    const item = screen.getByRole('listitem');
    expect(item).toHaveAccessibleName('Hard Boss: no kills');
  });
});
