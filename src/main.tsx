import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import './index.css';
import App from './App.tsx';
import { validateConfig } from '@/config';
import { AppError, ConfigError } from '@/components/ErrorScreens';

const rootEl = document.getElementById('root');
if (rootEl === null) throw new Error('Root element #root not found in the document.');

const configErrors = validateConfig();

if (configErrors.length > 0) {
  createRoot(rootEl).render(<ConfigError errors={configErrors} />);
} else {
  createRoot(rootEl).render(
    <ErrorBoundary FallbackComponent={({ error }) => <AppError error={error} />}>
      <App />
    </ErrorBoundary>,
  );
}

