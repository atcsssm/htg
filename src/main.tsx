import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize Redis only in server environments
const initializeApp = async () => {
  // Only try Redis initialization in server-side environments
  if (typeof window === 'undefined') {
    try {
      const { initializeRedis } = await import('./lib/redis');
      const connected = await initializeRedis();
      if (connected) {
        console.log('🚀 Redis initialized successfully for MLM tree optimization');
      } else {
        console.log('📊 Running in database-only mode (Redis not available)');
      }
    } catch (error) {
      console.log('📊 Browser environment detected - Redis not available');
    }
  } else {
    console.log('📊 Browser environment - Running in database-only mode');
  }
};

// Initialize app
initializeApp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
