import React, { useState, useEffect } from 'react';
import MetricsCard from './MetricsCard';
import FunnelAnalysis from './FunnelAnalysis';
import SessionTracker from './SessionTracker';
import './Dashboard.css';

function Dashboard({ backendUrl }) {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    to: new Date().toISOString()
  });

  const [metrics, setMetrics] = useState({
    pageViews: 0,
    clicks: 0,
    formInteractions: 0,
    scrollDepth: 0
  });

  const [clicksByButton, setClicksByButton] = useState({});
  const [funnel, setFunnel] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all analytics data
  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [dateRange, backendUrl]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        from: dateRange.from,
        to: dateRange.to
      });

      // Fetch all data in parallel
      const [pageViewsRes, clicksRes, formRes, funnelRes, scrollRes, sessionsRes] = await Promise.all([
        fetch(`${backendUrl}/api/analytics/page-views?${params}`),
        fetch(`${backendUrl}/api/analytics/clicks?${params}`),
        fetch(`${backendUrl}/api/analytics/form-interactions?${params}`),
        fetch(`${backendUrl}/api/analytics/funnel?${params}`),
        fetch(`${backendUrl}/api/analytics/scroll-depth?${params}`),
        fetch(`${backendUrl}/api/analytics/sessions?${params}`)
      ]);

      if (!pageViewsRes.ok || !clicksRes.ok || !formRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const pageViewsData = await pageViewsRes.json();
      const clicksData = await clicksRes.json();
      const formData = await formRes.json();
      const funnelData = await funnelRes.json();
      const scrollData = await scrollRes.json();
      const sessionsData = await sessionsRes.json();

      setMetrics({
        pageViews: pageViewsData.total,
        clicks: clicksData.total,
        formInteractions: formData.total,
        scrollDepth: scrollData.average_depth || 0
      });

      setClicksByButton(clicksData.by_button || {});
      setFunnel(funnelData.funnel || []);
      setSessions(sessionsData.sessions || []);
    } catch (err) {
      console.error('Analytics error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📊 Analytics Dashboard</h1>
        <p>iHandyAndy Website Performance</p>
      </header>

      <div className="controls">
        <div className="date-range">
          <label>
            From:
            <input
              type="datetime-local"
              name="from"
              value={dateRange.from.slice(0, 16)}
              onChange={handleDateChange}
            />
          </label>
          <label>
            To:
            <input
              type="datetime-local"
              name="to"
              value={dateRange.to.slice(0, 16)}
              onChange={handleDateChange}
            />
          </label>
        </div>
        <button className="refresh-btn" onClick={fetchAnalytics}>
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-box">
          ⚠️ Error: {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : (
        <>
          <div className="metrics-grid">
            <MetricsCard
              title="Page Views"
              value={metrics.pageViews}
              icon="👁️"
              color="orange"
            />
            <MetricsCard
              title="Button Clicks"
              value={metrics.clicks}
              icon="🖱️"
              color="orange"
            />
            <MetricsCard
              title="Form Interactions"
              value={metrics.formInteractions}
              icon="📝"
              color="orange"
            />
            <MetricsCard
              title="Avg Scroll Depth"
              value={`${metrics.scrollDepth}%`}
              icon="📜"
              color="orange"
            />
          </div>

          <div className="analysis-section">
            <FunnelAnalysis funnel={funnel} />
            <div className="clicks-breakdown">
              <h2>Top Clicks by Button</h2>
              <div className="button-list">
                {Object.entries(clicksByButton)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([buttonId, count]) => (
                    <div key={buttonId} className="button-item">
                      <span className="button-name">{buttonId}</span>
                      <span className="button-count">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <SessionTracker sessions={sessions} />
        </>
      )}
    </div>
  );
}

export default Dashboard;
