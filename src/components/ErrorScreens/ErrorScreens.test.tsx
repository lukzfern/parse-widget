import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfigError, AppError } from './ErrorScreens';

describe('ConfigError', () => {
  it('renders the configuration error heading', () => {
    render(<ConfigError errors={[]} />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('renders each error message as a list item', () => {
    render(<ConfigError errors={['Error A', 'Error B', 'Error C']} />);
    expect(screen.getByText('Error A')).toBeInTheDocument();
    expect(screen.getByText('Error B')).toBeInTheDocument();
    expect(screen.getByText('Error C')).toBeInTheDocument();
  });

  it('renders an empty list when no errors are passed', () => {
    const { container } = render(<ConfigError errors={[]} />);
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });

  it('mentions .env in the instructional text', () => {
    render(<ConfigError errors={['some error']} />);
    expect(screen.getByText(/.env/)).toBeInTheDocument();
  });
});

describe('AppError', () => {
  it('renders the "something went wrong" heading', () => {
    render(<AppError error={new Error('crash')} />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('displays the message from an Error object', () => {
    render(<AppError error={new Error('Unexpected failure')} />);
    expect(screen.getByText('Unexpected failure')).toBeInTheDocument();
  });

  it('displays a plain string error', () => {
    render(<AppError error="plain string error" />);
    expect(screen.getByText('plain string error')).toBeInTheDocument();
  });

  it('converts non-Error, non-string values via String()', () => {
    render(<AppError error={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
