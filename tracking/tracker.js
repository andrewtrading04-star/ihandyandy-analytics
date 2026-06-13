// iHandyAndy Analytics Tracker
// Lightweight vanilla JS - no dependencies
// Inject this into your website via Landingsite.ai code injection

(function() {
  const BACKEND_URL = 'https://backend-6azf0a434-andrew-c-projects.vercel.app'; // Analytics backend
  const SESSION_ID = generateSessionId();
  const PAGE_ID = generatePageId();
  let pageStartTime = Date.now();
  let maxScrollDepth = 0;

  // Generate unique session ID (persists for session)
  function generateSessionId() {
    const stored = localStorage.getItem('analytics_session_id');
    if (stored) return stored;
    const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('analytics_session_id', id);
    return id;
  }

  // Generate unique page ID (for this page load)
  function generatePageId() {
    return 'page_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Send event to backend
  function sendEvent(eventType, data = {}) {
    const payload = {
      event_type: eventType,
      page_url: window.location.href,
      page_title: document.title,
      session_id: SESSION_ID,
      page_id: PAGE_ID,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      ...data
    };

    // Use sendBeacon for reliability (even if tab closes)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${BACKEND_URL}/api/events`, JSON.stringify(payload));
    } else {
      // Fallback to fetch
      fetch(`${BACKEND_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  }

  // Track page view
  function trackPageView() {
    sendEvent('page_view', {
      referrer: document.referrer
    });
  }

  // Track button clicks
  function trackClick(e) {
    const target = e.target.closest('button, a[role="button"], .btn, [data-track-click]');
    if (!target) return;

    sendEvent('button_click', {
      button_text: (target.textContent || '').trim().slice(0, 100),
      button_id: target.id || target.getAttribute('data-button-id') || 'unnamed',
      button_class: target.className || '',
      target_url: target.href || ''
    });
  }

  // Track form interactions
  function trackFormInteraction(e) {
    const target = e.target;
    if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT' && target.tagName !== 'TEXTAREA') return;

    sendEvent('form_interaction', {
      field_name: target.name || target.id || 'unnamed',
      field_type: target.type || 'unknown',
      field_id: target.id || '',
      form_id: target.form?.id || '',
      value_length: (target.value || '').length
    });
  }

  // Track scroll depth
  function trackScrollDepth() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight === 0) return;

    const scrolled = window.scrollY;
    const depth = Math.round((scrolled / scrollHeight) * 100);

    if (depth > maxScrollDepth) {
      maxScrollDepth = depth;
      if (depth % 25 === 0) { // Send every 25% increment
        sendEvent('scroll_depth', { depth_percent: depth });
      }
    }
  }

  // Track time on page (send periodically)
  function trackTimeOnPage() {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    sendEvent('time_on_page', { seconds: timeSpent });
  }

  // Initialize tracking
  function init() {
    // Track initial page view
    trackPageView();

    // Listen for clicks
    document.addEventListener('click', trackClick, true);

    // Listen for form interactions
    document.addEventListener('change', trackFormInteraction, true);
    document.addEventListener('input', trackFormInteraction, true);

    // Track scroll depth
    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    // Send time on page every 30 seconds
    setInterval(trackTimeOnPage, 30000);

    // Send time on page when leaving
    window.addEventListener('beforeunload', trackTimeOnPage);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
