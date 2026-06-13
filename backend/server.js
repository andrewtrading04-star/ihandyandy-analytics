import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase with the SERVICE ROLE key (server-side only).
// This lets us keep Row Level Security ON while the backend can still write.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Allow requests from anywhere (the website and the dashboard are both browsers
// hitting this API; no cookies/credentials are used, so * is safe here).
app.use(cors());

// Parse EVERY request body as JSON regardless of Content-Type.
// navigator.sendBeacon() sends "text/plain", so the default express.json()
// (which only parses application/json) was silently dropping all events.
app.use(express.json({ type: () => true, limit: '200kb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Receive tracking events. Stores known fields as columns and EVERYTHING
// else into the metadata JSON, so no data is ever lost.
app.post('/api/events', async (req, res) => {
  try {
    const event = req.body || {};

    if (!event.event_type || !event.session_id) {
      return res.status(400).json({ error: 'Missing required fields (event_type, session_id)' });
    }

    const {
      event_type,
      session_id,
      page_id,
      page_url,
      page_title,
      timestamp,
      user_agent,
      referrer,
      ...rest
    } = event;

    const row = {
      event_type,
      session_id,
      page_id: page_id || `na_${Date.now()}`,
      page_url: page_url || null,
      page_title: page_title || null,
      timestamp: timestamp || new Date().toISOString(),
      user_agent: user_agent || null,
      referrer: referrer || null,
      metadata: rest // all the rich data: device, browser, depth_percent, element_id, etc.
    };

    const { error } = await supabase.from('events').insert([row]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to store event', detail: error.message });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Event handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper: apply optional date range
function applyRange(query, from, to) {
  if (from && to) return query.gte('timestamp', from).lte('timestamp', to);
  return query;
}

// API: Page views
app.get('/api/analytics/page-views', async (req, res) => {
  try {
    const { from, to } = req.query;
    const { data, error } = await applyRange(
      supabase.from('events').select('*').eq('event_type', 'page_view'),
      from, to
    );
    if (error) throw error;
    res.json({ total: data.length, events: data, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('page-views error:', error);
    res.status(500).json({ error: 'Failed to fetch page views' });
  }
});

// API: Clicks (covers both new "click" and legacy "button_click")
app.get('/api/analytics/clicks', async (req, res) => {
  try {
    const { from, to } = req.query;
    const { data, error } = await applyRange(
      supabase.from('events').select('*').in('event_type', ['click', 'button_click']),
      from, to
    );
    if (error) throw error;

    const byButton = {};
    data.forEach(c => {
      const label =
        c.metadata?.element_text ||
        c.metadata?.element_id ||
        c.metadata?.button_id ||
        c.metadata?.button_text ||
        'unnamed';
      byButton[label] = (byButton[label] || 0) + 1;
    });

    res.json({ total: data.length, by_button: byButton, events: data });
  } catch (error) {
    console.error('clicks error:', error);
    res.status(500).json({ error: 'Failed to fetch clicks' });
  }
});

// API: Form interactions
app.get('/api/analytics/form-interactions', async (req, res) => {
  try {
    const { from, to } = req.query;
    const { data, error } = await applyRange(
      supabase.from('events').select('*').eq('event_type', 'form_interaction'),
      from, to
    );
    if (error) throw error;

    const byField = {};
    data.forEach(i => {
      const name = i.metadata?.field_name || 'unnamed';
      if (!byField[name]) byField[name] = { count: 0, types: {} };
      byField[name].count += 1;
      const t = i.metadata?.field_type || 'unknown';
      byField[name].types[t] = (byField[name].types[t] || 0) + 1;
    });

    res.json({ total: data.length, by_field: byField, events: data });
  } catch (error) {
    console.error('form-interactions error:', error);
    res.status(500).json({ error: 'Failed to fetch form interactions' });
  }
});

// API: Sessions (all events grouped by session)
app.get('/api/analytics/sessions', async (req, res) => {
  try {
    const { from, to, limit = 50 } = req.query;
    const { data, error } = await applyRange(
      supabase.from('events').select('*').order('timestamp', { ascending: true }),
      from, to
    );
    if (error) throw error;

    const sessions = {};
    data.forEach(e => {
      if (!sessions[e.session_id]) {
        sessions[e.session_id] = {
          session_id: e.session_id,
          start_time: e.timestamp,
          end_time: e.timestamp,
          events: [],
          event_count: 0,
          referrer: e.referrer
        };
      }
      const s = sessions[e.session_id];
      s.events.push({ type: e.event_type, timestamp: e.timestamp, metadata: e.metadata });
      s.end_time = e.timestamp;
      s.event_count += 1;
    });

    const list = Object.values(sessions)
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
      .slice(0, Number(limit));

    res.json({ total: list.length, sessions: list });
  } catch (error) {
    console.error('sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// API: Funnel (page view -> click -> form submit)
app.get('/api/analytics/funnel', async (req, res) => {
  try {
    const { from, to } = req.query;
    const { data, error } = await applyRange(
      supabase.from('events').select('event_type, session_id'),
      from, to
    );
    if (error) throw error;

    const counts = {};
    const sessionSteps = {};
    data.forEach(e => {
      counts[e.event_type] = (counts[e.event_type] || 0) + 1;
      if (!sessionSteps[e.session_id]) sessionSteps[e.session_id] = new Set();
      sessionSteps[e.session_id].add(e.event_type);
    });

    const has = (s, ...types) => types.some(t => s.has(t));
    const all = Object.values(sessionSteps);
    const sPV = all.filter(s => has(s, 'page_view')).length;
    const sClick = all.filter(s => has(s, 'page_view') && has(s, 'click', 'button_click')).length;
    const sForm = all.filter(s => has(s, 'page_view') && has(s, 'click', 'button_click') && has(s, 'form_submit', 'form_interaction')).length;

    res.json({
      funnel: [
        { step: 'Page View', count: counts['page_view'] || 0, sessions: sPV },
        { step: 'Click', count: (counts['click'] || 0) + (counts['button_click'] || 0), sessions: sClick },
        { step: 'Form / Booking', count: (counts['form_submit'] || 0) + (counts['form_interaction'] || 0), sessions: sForm }
      ],
      total_sessions: all.length
    });
  } catch (error) {
    console.error('funnel error:', error);
    res.status(500).json({ error: 'Failed to fetch funnel' });
  }
});

// API: Scroll depth (covers new "scroll" and legacy "scroll_depth")
app.get('/api/analytics/scroll-depth', async (req, res) => {
  try {
    const { from, to } = req.query;
    const { data, error } = await applyRange(
      supabase.from('events').select('metadata').in('event_type', ['scroll', 'scroll_depth']),
      from, to
    );
    if (error) throw error;

    const dist = {};
    let sum = 0;
    data.forEach(e => {
      const d = e.metadata?.depth_percent || 0;
      dist[d] = (dist[d] || 0) + 1;
      sum += d;
    });

    res.json({
      total: data.length,
      depth_distribution: dist,
      average_depth: data.length ? Math.round(sum / data.length) : 0
    });
  } catch (error) {
    console.error('scroll-depth error:', error);
    res.status(500).json({ error: 'Failed to fetch scroll depth' });
  }
});

// Only listen locally. On Vercel the app is exported and invoked as a function.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Analytics backend running on port ${PORT}`);
  });
}

export default app;
