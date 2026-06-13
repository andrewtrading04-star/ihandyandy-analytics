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
    scrollDepth: 0,
    pageExits: 0,
    activeUsers: 0,
    avgTimeOnPage: 0,
    bounceRate: 0
  });

  const [clicksByButton, setClicksByButton] = useState({});
  const [funnel, setFunnel] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState({});
  const [browserBreakdown, setBrowserBreakdown] = useState({});
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

      // Calculate device and browser breakdown
      const devices = {};
      const browsers = {};
      let totalPageExits = 0;
      let totalTimeOnPage = 0;
      let pageExitCount = 0;

      if (sessionsData.sessions) {
        sessionsData.sessions.forEach(session => {
          session.events?.forEach(event => {
            if (event.metadata?.device) devices[event.metadata.device] = (devices[event.metadata.device] || 0) + 1;
            if (event.metadata?.browser) browsers[event.metadata.browser] = (browsers[event.metadata.browser] || 0) + 1;
            if (event.type === 'page_exit') {
              totalPageExits += 1;
              totalTimeOnPage += event.metadata?.time_spent_seconds || 0;
              pageExitCount += 1;
            }
          });
        });
      }

      const avgTime = pageExitCount > 0 ? Math.round(totalTimeOnPage / pageExitCount) : 0;
      const bounceRate = sessionsData.sessions?.length > 0
        ? Math.round((sessionsData.sessions.filter(s => s.event_count <= 1).length / sessionsData.sessions.length) * 100)
        : 0;

      setMetrics({
        pageViews: pageViewsData.total,
        clicks: clicksData.total,
        formInteractions: formData.total,
        scrollDepth: scrollData.average_depth || 0,
        pageExits: totalPageExits,
        activeUsers: sessionsData.sessions?.length || 0,
        avgTimeOnPage: avgTime,
        bounceRate: bounceRate
      });

      setClicksByButton(clicksData.by_button || {});
      setFunnel(funnelData.funnel || []);
      setSessions(sessionsData.sessions || []);
      setDeviceBreakdown(devices);
      setBrowserBreakdown(browsers);
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
              title="Active Users"
              value={metrics.activeUsers}
              icon="👥"
              color="orange"
            />
            <MetricsCard
              title="Avg Time on Page"
              value={`${metrics.avgTimeOnPage}s`}
              icon="⏱️"
              color="orange"
            />
            <MetricsCard
              title="Bounce Rate"
              value={`${metrics.bounceRate}%`}
              icon="📉"
              color="orange"
            />
            <MetricsCard
              title="Page Exits"
              value={metrics.pageExits}
              icon="🚪"
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

          <div className="breakdown-section">
            <div className="device-breakdown">
              <h2>Devices</h2>
              <div className="breakdown-list">
                {Object.entries(deviceBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([device, count]) => (
                    <div key={device} className="breakdown-item">
                      <span className="breakdown-label">{device}</span>
                      <span className="breakdown-count">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="browser-breakdown">
              <h2>Browsers</h2>
              <div className="breakdown-list">
                {Object.entries(browserBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([browser, count]) => (
                    <div key={browser} className="breakdown-item">
                      <span className="breakdown-label">{browser}</span>
                      <span className="breakdown-count">{count}</span>
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
