import React from 'react';
import './MetricsCard.css';

function MetricsCard({ title, value, icon, color = 'orange' }) {
  return (
    <div className={`metric-card metric-${color}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <p className="metric-title">{title}</p>
        <p className="metric-value">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </div>
    </div>
  );
}

export default MetricsCard;
