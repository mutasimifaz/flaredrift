import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

const isMindtrace = /^\/mindtrace(?:\/|$)/.test(window.location.pathname);
const App = lazy(() => isMindtrace ? import('./mindtrace/MindtraceApp.jsx') : import('./App.jsx'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<main aria-live="polite" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#999', background: '#0b0b0f', fontFamily: 'system-ui' }}>Loading workspace…</main>}>
      <App />
    </Suspense>
  </React.StrictMode>
);
