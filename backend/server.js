import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(cors({
  origin: [
    'https://ihandyandy.com',
    'http://localhost:3001',
    'https://dashboard-q599mizle-andrew-c-projects.vercel.app',
    'http://localhost:3000'
  ]
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Receive tracking events
app.post('/api/events', async (req, res) => {
  try {
    const event = req.body;

    // Validate required fields
    if (!event.event_type || !event.session_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Store in appropriate table based on event type
    let table = 'events'; // Default table
    let data = {
      event_type: event.event_type,
      session_id: event.session_id,
      page_id: event.page_id,
      page_url: event.page_url,
      page_title: event.page_title,
      timestamp: event.timestamp,
      user_agent: event.user_agent,
      referrer: event.referrer,
      metadata: {} // Store extra data as JSON
    };

    // Handle event-specific data
    if (event.event_type === 'button_click') {
      data.metadata = {
        button_text: event.button_text,
        button_id: event.button_id,
        button_class: event.button_class,
        target_url: event.target_url
      };
    } else if (event.event_type === 'form_interaction') {
      data.metadata = {
        field_name: event.field_name,
        field_type: event.field_type,
        field_id: event.field_id,
        form_id: event.form_id,
        value_length: event.value_length
      };
    } else if (event.event_type === 'scroll_depth') {
      data.metadata = {
        depth_percent: event.depth_percent
      };
    } else if (event.event_type === 'time_on_page') {
      data.metadata = {
        seconds: event.seconds
      };
    }

    const { error } = await supabase
      .from('events')
      .insert([data]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to store event' });
    }

    res.json({ success: true, event_id: event.page_id });
  } catch (error) {
    console.error('Event handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Get page views
app.get('/api/analytics/page-views', async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = supabase
      .from('events')
      .select('*')
      .eq('event_type', 'page_view');

    if (from && to) {
      query = query
        .gte('timestamp', from)
        .lte('timestamp', to);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({
      total: data.length,
      events: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching page views:', error);
    res.status(500).json({ error: 'Failed to fetch page views' });
  }
});

// API: Get button clicks
app.get('/api/analytics/clicks', async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = supabase
      .from('events')
      .select('*')
      .eq('event_type', 'button_click');

    if (from && to) {
      query = query
        .gte('timestamp', from)
        .lte('timestamp', to);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Aggregate by button
    const byButton = {};
    data.forEach(click => {
      const buttonId = click.metadata?.button_id || 'unnamed';
      byButton[buttonId] = (byButton[buttonId] || 0) + 1;
    });

    res.json({
      total: data.length,
      by_button: byButton,
      events: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching clicks:', error);
    res.status(500).json({ error: 'Failed to fetch clicks' });
  }
});

// API: Get form interactions
app.get('/api/analytics/form-interactions', async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = supabase
      .from('events')
      .select('*')
      .eq('event_type', 'form_interaction');

    if (from && to) {
      query = query
        .gte('timestamp', from)
        .lte('timestamp', to);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Aggregate by field
    const byField = {};
    data.forEach(interaction => {
      const fieldName = interaction.metadata?.field_name || 'unnamed';
      if (!byField[fieldName]) {
        byField[fieldName] = { count: 0, types: {} };
      }
      byField[fieldName].count += 1;
      const type = interaction.metadata?.field_type || 'unknown';
      byField[fieldName].types[type] = (byField[fieldName].types[type] || 0) + 1;
    });

    res.json({
      total: data.length,
      by_field: byField,
      events: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching form interactions:', error);
    res.status(500).json({ error: 'Failed to fetch form interactions' });
  }
});

// API: Get sessions with event sequences
app.get('/api/analytics/sessions', async (req, res) => {
  try {
    const { from, to, limit = 50 } = req.query;
    let query = supabase
      .from('events')
      .select('*')
      .order('timestamp', { ascending: true });

    if (from && to) {
      query = query
        .gte('timestamp', from)
        .lte('timestamp', to);
    }

    const { data, error } = await query.limit(limit * 20); // Get more to group by session
    if (error) throw error;

    // Group by session
    const sessions = {};
    data.forEach(event => {
      if (!sessions[event.session_id]) {
        sessions[event.session_id] = {
          session_id: event.session_id,
          start_time: event.timestamp,
          end_time: event.timestamp,
          events: [],
          event_count: 0,
          referrer: event.referrer
        };
      }
      sessions[event.session_id].events.push({
        type: event.event_type,
        timestamp: event.timestamp,
        metadata: event.metadata
      });
      sessions[event.session_id].end_time = event.timestamp;
      sessions[event.session_id].event_count += 1;
    });

    const sessionsList = Object.values(sessions).slice(0, limit);

    res.json({
      total: sessionsList.length,
      sessions: sessionsList,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// API: Get funnel analysis (page view -> click -> form interaction)
app.get('/api/analytics/funnel', async (req, res) => {
  try {
    const { from, to } = req.query;
    let baseQuery = supabase.from('events').select('*');

    if (from && to) {
      baseQuery = baseQuery
        .gte('timestamp', from)
        .lte('timestamp', to);
    }

    const { data, error } = await baseQuery;
    if (error) throw error;

    // Count events by type
    const eventCounts = {};
    const sessionSteps = {};

    data.forEach(event => {
      eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;

      // Track funnel progression per session
      if (!sessionSteps[event.session_id]) {
        sessionSteps[event.session_id] = new Set();
      }
      sessionSteps[event.session_id].add(event.event_type);
    });

    // Calculate funnel
    const pageViews = eventCounts['page_view'] || 0;
    const clicks = eventCounts['button_click'] || 0;
    const formInteractions = eventCounts['form_interaction'] || 0;

    const sessionsWithPageView = Object.values(sessionSteps).filter(s => s.has('page_view')).length;
    const sessionsWithClick = Object.values(sessionSteps).filter(s => s.has('page_view') && s.has('button_click')).length;
    const sessionsWithForm = Object.values(sessionSteps).filter(s =>
      s.has('page_view') && s.has('button_click') && s.has('form_interaction')
    ).length;

    res.json({
      funnel: [
        { step: 'Page View', count: pageViews, sessions: sessionsWithPageView },
        { step: 'Button Click', count: clicks, sessions: sessionsWithClick },
        { step: 'Form Interaction', count: formInteractions, sessions: sessionsWithForm }
      ],
      total_sessions: Object.keys(sessionSteps).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching funnel:', error);
    res.status(500).json({ error: 'Failed to fetch funnel data' });
  }
});

// API: Get scroll depth stats
app.get('/api/analytics/scroll-depth', async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = supabase
      .from('events')
      .select('*')
      .eq('event_type', 'scroll_depth');

    if (from && to) {
      query = query
        .gte('timestamp', from)
        .lte('timestamp', to);
    }

    const { data, error } = await query;
    if (error) throw error;

    const depthStats = {};
    data.forEach(event => {
      const depth = event.metadata?.depth_percent || 0;
      depthStats[depth] = (depthStats[depth] || 0) + 1;
    });

    res.json({
      total: data.length,
      depth_distribution: depthStats,
      average_depth: data.length > 0
        ? Math.round(data.reduce((sum, e) => sum + (e.metadata?.depth_percent || 0), 0) / data.length)
        : 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching scroll depth:', error);
    res.status(500).json({ error: 'Failed to fetch scroll depth' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Analytics backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
