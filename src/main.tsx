// Ensure window.fetch is safely assignable in sandboxed iframe environments
try {
  const origFetch = typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : null;
  let currentFetch = origFetch;
  Object.defineProperty(window, 'fetch', {
    get() {
      return currentFetch || origFetch;
    },
    set(fn) {
      currentFetch = fn;
    },
    configurable: true,
    enumerable: true,
  });
} catch {
  // Ignore if already patched or not permissible
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
