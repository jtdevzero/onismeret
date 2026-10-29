import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import './ui/styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Fejlesztői horog a böngészős próbához; éles buildben nem kerül bele.
if (import.meta.env.DEV) {
  void import('./store').then(({ useApp }) => {
    (window as unknown as { __etterem: unknown }).__etterem = { useApp };
  });
}
