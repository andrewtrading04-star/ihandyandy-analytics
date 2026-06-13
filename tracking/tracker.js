// iHandyAndy Analytics Tracker - COMPREHENSIVE
// Captures all user behavior data

(function() {
  const BACKEND_URL = 'https://backend-6azf0a434-andrew-c-projects.vercel.app';
  const SESSION_ID = generateSessionId();
  const PAGE_ID = generatePageId();
  let pageStartTime = performance.now();
  let maxScrollDepth = 0;
  let lastScrollDepthSent = 0;
  let firstInteractionTime = null;

  function generateSessionId() {
    const stored = localStorage.getItem('analytics_session_id');
    if (stored) return stored;
    const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('analytics_session_id', id);
    return id;
  }

  function generatePageId() {
    return 'page_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function getDeviceInfo() {
    const ua = navigator.userAgent;
    let device = 'desktop';
    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase())) {
      device = /ipad/.test(ua.toLowerCase()) ? 'tablet' : 'mobile';
    }
    return {
      device,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };
  }

  function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'unknown';
    let os = 'unknown';

    if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';
    else if (ua.indexOf('Opera') > -1) browser = 'Opera';

    if (ua.indexOf('Windows') > -1) os = 'Windows';
    else if (ua.indexOf('Mac') > -1) os = 'MacOS';
    else if (ua.indexOf('Linux') > -1) os = 'Linux';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';

    return { browser, os, user_agent: ua };
  }

  function getPerformanceMetrics() {
    try {
      const perf = performance.getEntriesByType('navigation')[0];
      if (perf) {
        return {
          page_load_time: Math.round(perf.loadEventEnd - perf.fetchStart),
          dom_ready_time: Math.round(perf.domContentLoadedEventEnd - perf.fetchStart),
          time_to_interactive: Math.round(perf.domInteractive - perf.fetchStart)
        };
      }
    } catch (e) {}
    return {};
  }

  function sendEvent(eventType, data = {}) {
    const payload = {
      event_type: eventType,
      page_url: window.location.href,
      page_path: window.location.pathname,
      page_search: window.location.search,
      page_title: document.title,
      session_id: SESSION_ID,
      page_id: PAGE_ID,
      timestamp: new Date().toISOString(),
      time_on_page_ms: Math.round(performance.now() - pageStartTime),
      ...getBrowserInfo(),
      ...getDeviceInfo(),
      referrer: document.referrer,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...data
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${BACKEND_URL}/api/events`, JSON.stringify(payload));
    } else {
      fetch(`${BACKEND_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  }

  function trackPageView() {
    const metrics = getPerformanceMetrics();
    sendEvent('page_view', {
      referrer: document.referrer,
      ...metrics
    });
  }

  function trackPageExit() {
    const timeSpent = Math.round((performance.now() - pageStartTime) / 1000);
    sendEvent('page_exit', {
      time_spent_seconds: timeSpent,
      max_scroll_depth: maxScrollDepth,
      had_interaction: firstInteractionTime !== null
    });
  }

  function trackClick(e) {
    const target = e.target.closest('button, a, [role="button"], input[type="button"], input[type="submit"], .btn, [data-track-click]');
    if (!target) return;

    if (!firstInteractionTime) firstInteractionTime = performance.now();

    const isLink = target.tagName === 'A';
    const isButton = target.tagName === 'BUTTON' || target.type === 'button' || target.type === 'submit';

    sendEvent('click', {
      element_type: target.tagName.toLowerCase(),
      element_id: target.id || null,
      element_class: target.className || null,
      element_text: (target.textContent || '').trim().slice(0, 200),
      is_link: isLink,
      is_button: isButton,
      target_url: target.href || null,
      data_attributes: target.dataset ? JSON.stringify(target.dataset) : null
    });
  }

  function trackFormInteraction(e) {
    const target = e.target;
    if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT' && target.tagName !== 'TEXTAREA') return;

    if (!firstInteractionTime) firstInteractionTime = performance.now();

    sendEvent('form_interaction', {
      field_name: target.name || target.id || 'unnamed',
      field_type: target.type || 'unknown',
      field_id: target.id || null,
      field_class: target.className || null,
      form_id: target.form?.id || null,
      form_name: target.form?.name || null,
      is_required: target.required || false,
      value_length: (target.value || '').length,
      interaction_type: e.type
    });
  }

  function trackFormSubmit(e) {
    const form = e.target;
    if (!firstInteractionTime) firstInteractionTime = performance.now();

    sendEvent('form_submit', {
      form_id: form.id || null,
      form_name: form.name || null,
      form_class: form.className || null,
      form_action: form.action || null,
      form_method: form.method || null,
      fields_count: form.querySelectorAll('input, select, textarea').length
    });
  }

  function trackScrollDepth() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight === 0) return;

    const scrolled = window.scrollY;
    const depth = Math.round((scrolled / scrollHeight) * 100);

    if (depth > maxScrollDepth) {
      maxScrollDepth = depth;

      // Send every 10% increment
      if (depth - lastScrollDepthSent >= 10) {
        lastScrollDepthSent = depth;
        sendEvent('scroll', {
          depth_percent: depth,
          scroll_position: Math.round(scrolled),
          max_depth: maxScrollDepth
        });
      }
    }
  }

  function trackTimeOnPage() {
    const timeSpent = Math.round((performance.now() - pageStartTime) / 1000);
    sendEvent('time_on_page', {
      seconds: timeSpent,
      max_scroll_depth: maxScrollDepth,
      had_interaction: firstInteractionTime !== null,
      time_to_first_interaction_ms: firstInteractionTime ? Math.round(firstInteractionTime - pageStartTime) : null
    });
  }

  function trackMouseMovement() {
    let lastMouseTime = 0;
    document.addEventListener('mousemove', () => {
      const now = Date.now();
      if (now - lastMouseTime > 5000) { // Send every 5 seconds of activity
        lastMouseTime = now;
        if (!firstInteractionTime) firstInteractionTime = performance.now();
        sendEvent('user_active', {
          activity_type: 'mouse_movement'
        });
      }
    }, { passive: true });
  }

  function trackKeyboardActivity() {
    let lastKeyTime = 0;
    document.addEventListener('keydown', () => {
      const now = Date.now();
      if (now - lastKeyTime > 5000) {
        lastKeyTime = now;
        if (!firstInteractionTime) firstInteractionTime = performance.now();
        sendEvent('user_active', {
          activity_type: 'keyboard'
        });
      }
    }, { passive: true });
  }

  function trackVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        sendEvent('page_hidden', {
          time_spent_seconds: Math.round((performance.now() - pageStartTime) / 1000)
        });
      } else {
        sendEvent('page_visible', {
          time_spent_seconds: Math.round((performance.now() - pageStartTime) / 1000)
        });
      }
    });
  }

  function trackErrorEvents() {
    window.addEventListener('error', (e) => {
      sendEvent('js_error', {
        error_message: e.message,
        error_filename: e.filename,
        error_line: e.lineno,
        error_column: e.colno
      });
    });
  }

  function init() {
    trackPageView();

    // Click tracking
    document.addEventListener('click', trackClick, true);

    // Form tracking
    document.addEventListener('change', trackFormInteraction, true);
    document.addEventListener('input', trackFormInteraction, true);
    document.addEventListener('submit', trackFormSubmit, true);

    // Scroll tracking
    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    // Activity tracking
    trackMouseMovement();
    trackKeyboardActivity();

    // Visibility tracking
    trackVisibilityChange();

    // Error tracking
    trackErrorEvents();

    // Time on page (every 30 seconds)
    setInterval(trackTimeOnPage, 30000);

    // Track on page exit
    window.addEventListener('beforeunload', trackPageExit);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
