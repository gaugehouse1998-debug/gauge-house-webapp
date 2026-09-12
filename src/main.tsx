import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
  } catch (err) {
    console.error('Gauge House critical mount error:', err);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #0a0a0a; color: #ffffff; font-family: sans-serif; text-align: center; padding: 24px;">
        <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 12px;">Gauge House could not load this page.</h1>
        <p style="font-size: 14px; color: #a3a3a3; margin-bottom: 24px;">A temporary startup error occurred. Please click below to refresh.</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; border-radius: 12px; background-color: #ea580c; color: #ffffff; font-weight: bold; border: none; cursor: pointer;">
          Refresh
        </button>
      </div>
    `;
  }
}
