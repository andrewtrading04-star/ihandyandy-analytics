import React from 'react';
import Dashboard from './components/Dashboard';
import './App.css';

// Stable production backend URL. No setup screen — it just works.
const BACKEND_URL = 'https://backend-beryl-seven-95.vercel.app';

function App() {
  return <Dashboard backendUrl={BACKEND_URL} />;
}

export default App;
