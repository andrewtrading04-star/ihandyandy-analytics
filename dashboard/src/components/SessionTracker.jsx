import React, { useState } from 'react';
import './SessionTracker.css';

function SessionTracker({ sessions }) {
  const [expandedSession, setExpandedSession] = useState(null);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSessionDuration = (start, end) => {
    const durationMs = new Date(end) - new Date(start);
    const seconds = Math.round(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="sessions-card">
        <h2>User Sessions</h2>
        <p className="no-data">No session data available</p>
      </div>
    );
  }

  return (
    <div className="sessions-card">
      <h2>User Sessions</h2>
      <p className="sessions-count">
        {sessions.length} session{sessions.length !== 1 ? 's' : ''} tracked
      </p>

      <div className="sessions-list">
        {sessions.slice(0, 20).map((session, index) => (
          <div
            key={index}
            className={`session-item ${expandedSession === index ? 'expanded' : ''}`}
          >
            <button
              className="session-header"
              onClick={() =>
                setExpandedSession(expandedSession === index ? null : index)
              }
            >
              <div className="session-info">
                <span className="session-id">ID: {session.session_id.slice(0, 20)}...</span>
                <span className="session-time">
                  {formatDate(session.start_time)} {formatTime(session.start_time)}
                </span>
              </div>
              <div className="session-meta">
                <span className="session-count">
                  {session.event_count} event{session.event_count !== 1 ? 's' : ''}
                </span>
                <span className="session-duration">
                  {getSessionDuration(session.start_time, session.end_time)}
                </span>
                <span className="expand-icon">
                  {expandedSession === index ? '▼' : '▶'}
                </span>
              </div>
            </button>

            {expandedSession === index && (
              <div className="session-details">
                <div className="session-timeline">
                  {session.events.map((event, eventIndex) => (
                    <div key={eventIndex} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <span className="event-type">{event.type}</span>
                        <span className="event-time">{formatTime(event.timestamp)}</span>
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <div className="event-metadata">
                            {Object.entries(event.metadata).map(([key, value]) => (
                              <span key={key} className="metadata-item">
                                {key}: {JSON.stringify(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SessionTracker;
