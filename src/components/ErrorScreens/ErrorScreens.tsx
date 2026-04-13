export function ConfigError({ errors }: { errors: string[] }) {
  return (
    <div style={{
      fontFamily: 'monospace',
      padding: '2rem',
      color: '#ff6b6b',
      background: '#111',
      minHeight: '100vh',
    }}>
      <h2 style={{ marginBottom: '1rem' }}>⚠ Configuration error</h2>
      <p style={{ marginBottom: '0.5rem', color: '#ccc' }}>
        Fix your <code>.env</code> file and restart the dev server:
      </p>
      <ul style={{ lineHeight: 2 }}>
        {errors.map((e) => <li key={e}>{e}</li>)}
      </ul>
    </div>
  );
}

export function AppError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div style={{
      fontFamily: 'monospace',
      padding: '2rem',
      color: '#ff6b6b',
      background: '#111',
    }}>
      <h2>Something went wrong</h2>
      <pre style={{ marginTop: '0.5rem', color: '#ccc', whiteSpace: 'pre-wrap' }}>
        {message}
      </pre>
    </div>
  );
}
