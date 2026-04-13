import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ParseBar } from './ParseBar';

describe('ParseBar', () => {
  it('renders a track and fill element', () => {
    const { container } = render(<ParseBar percent={75} />);
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBe(2);
  });

  it('initially renders the fill at 0 width (before timeout)', () => {
    const { container } = render(<ParseBar percent={75} />);
    // Only the fill div has an inline style; the track has only a className
    const fill = container.querySelector('[style]') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('applies a background color for a purple-tier parse', () => {
    const { container } = render(<ParseBar percent={80} />);
    const fill = container.querySelector('[style]') as HTMLElement;
    // jsdom may normalize hex to rgb; just assert a color is set
    expect(fill.style.backgroundColor).not.toBe('');
  });

  it('applies a background color for an orange-tier parse', () => {
    const { container } = render(<ParseBar percent={97} />);
    const fill = container.querySelector('[style]') as HTMLElement;
    expect(fill.style.backgroundColor).not.toBe('');
  });

  it('adds a glow box-shadow for parses >= 95', () => {
    const { container } = render(<ParseBar percent={96} />);
    const fill = container.querySelector('[style]') as HTMLElement;
    expect(fill.style.boxShadow).not.toBe('none');
  });

  it('has no box-shadow for parses below 95', () => {
    const { container } = render(<ParseBar percent={80} />);
    const fill = container.querySelector('[style]') as HTMLElement;
    expect(fill.style.boxShadow).toBe('none');
  });
});

