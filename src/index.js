import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Register PWA service worker for offline support & auto-updates
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Dispatch custom event to show update banner in App
    const event = new CustomEvent('swUpdate', { detail: registration });
    window.dispatchEvent(event);
  },
  onSuccess: () => {
    console.log('Nobilis Academy cached for offline use');
  },
});
