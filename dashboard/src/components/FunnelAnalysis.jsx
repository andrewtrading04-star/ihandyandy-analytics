import React from 'react';
import './FunnelAnalysis.css';

function FunnelAnalysis({ funnel }) {
  if (!funnel || funnel.length === 0) {
    return (
      <div className="funnel-card">
        <h2>Booking Funnel</h2>
        <p className="no-data">No funnel data available</p>
      </div>
    );
  }

  // Calculate drop-off percentages
  const maxCount = Math.max(...funnel.map(s => s.count));
  const maxSessions = Math.max(...funnel.map(s => s.sessions));

  const funnelWithDropoff = funnel.map((step, index) => {
    let dropoffPercent = 0;
    if (index > 0) {
      const prevCount = funnel[index - 1].count;
      dropoffPercent = prevCount > 0
        ? Math.round(((prevCount - step.count) / prevCount) * 100)
        : 0;
    }
    return { ...step, dropoff: dropoffPercent };
  });

  return (
    <div className="funnel-card">
      <h2>Booking Funnel Analysis</h2>
      <div className="funnel-container">
        {funnelWithDropoff.map((step, index) => (
          <div key={index} className="funnel-step">
            <div
              className="funnel-bar"
              style={{
                width: `${(step.count / maxCount) * 100}%`
              }}
            >
              <span className="funnel-label">{step.step}</span>
              <span className="funnel-count">{step.count}</span>
            </div>
            {index < funnelWithDropoff.length - 1 && (
              <div className="funnel-dropoff">
                ↓ {step.dropoff}% drop-off
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="funnel-stats">
        <h3>Session Conversion</h3>
        <div className="conversion-list">
          {funnelWithDropoff.map((step, index) => (
            <div key={index} className="conversion-item">
              <span>{step.step}</span>
              <span className="conversion-percent">
                {step.sessions} sessions
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FunnelAnalysis;
