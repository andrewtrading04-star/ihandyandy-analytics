import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [backendUrl] = useState(() => {
    // Try to get from localStorage or use default
    return localStorage.getItem('backend_url') || 'https://your-backend-url.vercel.app';
  });

  const [configured, setConfigured] = useState(backendUrl !== 'https://your-backend-url.vercel.app');

  const handleConfigure = (url) => {
    localStorage.setItem('backend_url', url);
    window.location.reload();
  };

  if (!configured) {
    return (
      <div className="config-screen">
        <div className="config-card">
          <h1>Analytics Dashboard Setup</h1>
          <p>Please configure your backend URL</p>
          <input
            type="text"
            placeholder="https://your-backend-url.vercel.app"
            defaultValue={backendUrl}
            id="urlInput"
          />
          <button
            onClick={() => {
              const url = document.getElementById('urlInput').value;
              if (url) handleConfigure(url);
            }}
          >
            Configure
          </button>
          <p className="hint">
            This should be your Vercel backend URL (e.g., https://analytics-backend-xyz.vercel.app)
          </p>
        </div>
      </div>
    );
  }

  return <Dashboard backendUrl={backendUrl} />;
}

export default App;
