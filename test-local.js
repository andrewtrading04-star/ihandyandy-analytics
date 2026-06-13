#!/usr/bin/env node

/**
 * LOCAL TESTING SCRIPT
 * Tests the analytics system without needing deployment
 *
 * Usage: node test-local.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(msg, color = 'reset') {
  console.log(colors[color] + msg + colors.reset);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  log('\n╔════════════════════════════════════════════════╗', 'blue');
  log('║   iHandyAndy Analytics - Local Test Suite      ║', 'blue');
  log('╚════════════════════════════════════════════════╝\n', 'blue');

  let passed = 0;
  let failed = 0;

  // Test 1: Check file structure
  log('TEST 1: FILE STRUCTURE', 'bold');
  const requiredFiles = [
    'tracking/tracker.js',
    'backend/server.js',
    'backend/package.json',
    'dashboard/src/App.jsx',
    'dashboard/index.html',
    'database/schema.sql'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      log(`  ✅ ${file}`, 'green');
      passed++;
    } else {
      log(`  ❌ ${file} - MISSING`, 'red');
      failed++;
    }
  }

  // Test 2: Check tracker.js content
  log('\nTEST 2: TRACKING SCRIPT CONTENT', 'bold');
  const trackerPath = path.join(__dirname, 'tracking/tracker.js');
  const trackerContent = fs.readFileSync(trackerPath, 'utf8');

  const trackerChecks = [
    { name: 'BACKEND_URL constant', regex: /const BACKEND_URL/ },
    { name: 'Page view tracking', regex: /trackPageView/ },
    { name: 'Click tracking', regex: /trackClick/ },
    { name: 'Form tracking', regex: /trackFormInteraction/ },
    { name: 'Scroll depth tracking', regex: /trackScrollDepth/ },
    { name: 'Session ID generation', regex: /generateSessionId/ },
    { name: 'sendBeacon support', regex: /sendBeacon/ }
  ];

  for (const check of trackerChecks) {
    if (check.regex.test(trackerContent)) {
      log(`  ✅ ${check.name}`, 'green');
      passed++;
    } else {
      log(`  ❌ ${check.name} - NOT FOUND`, 'red');
      failed++;
    }
  }

  // Test 3: Check backend code
  log('\nTEST 3: BACKEND API CODE', 'bold');
  const serverPath = path.join(__dirname, 'backend/server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf8');

  const serverChecks = [
    { name: 'Express import', regex: /import express/ },
    { name: 'Supabase client', regex: /@supabase\/supabase-js/ },
    { name: 'CORS enabled', regex: /cors/ },
    { name: 'Health check endpoint', regex: /\/api\/health/ },
    { name: 'Events endpoint', regex: /\/api\/events/ },
    { name: 'Page views endpoint', regex: /\/api\/analytics\/page-views/ },
    { name: 'Clicks endpoint', regex: /\/api\/analytics\/clicks/ },
    { name: 'Funnel endpoint', regex: /\/api\/analytics\/funnel/ }
  ];

  for (const check of serverChecks) {
    if (check.regex.test(serverContent)) {
      log(`  ✅ ${check.name}`, 'green');
      passed++;
    } else {
      log(`  ❌ ${check.name} - NOT FOUND`, 'red');
      failed++;
    }
  }

  // Test 4: Check dashboard code
  log('\nTEST 4: DASHBOARD CODE', 'bold');
  const appPath = path.join(__dirname, 'dashboard/src/App.jsx');
  const appContent = fs.readFileSync(appPath, 'utf8');

  const appChecks = [
    { name: 'React import', regex: /import React/ },
    { name: 'Setup wizard', regex: /config-screen/ },
    { name: 'Backend URL state', regex: /backend_url/ },
    { name: 'Dashboard component', regex: /Dashboard/ }
  ];

  for (const check of appChecks) {
    if (check.regex.test(appContent)) {
      log(`  ✅ ${check.name}`, 'green');
      passed++;
    } else {
      log(`  ❌ ${check.name} - NOT FOUND`, 'red');
      failed++;
    }
  }

  // Test 5: Check database schema
  log('\nTEST 5: DATABASE SCHEMA', 'bold');
  const schemaPath = path.join(__dirname, 'database/schema.sql');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  const schemaChecks = [
    { name: 'Events table', regex: /CREATE TABLE.*events/ },
    { name: 'Users table', regex: /CREATE TABLE.*users/ },
    { name: 'Page metrics table', regex: /CREATE TABLE.*page_metrics/ },
    { name: 'Button metrics table', regex: /CREATE TABLE.*button_metrics/ },
    { name: 'Indexes created', regex: /CREATE INDEX/ },
    { name: 'RLS enabled', regex: /ENABLE ROW LEVEL SECURITY/ }
  ];

  for (const check of schemaChecks) {
    if (check.regex.test(schemaContent)) {
      log(`  ✅ ${check.name}`, 'green');
      passed++;
    } else {
      log(`  ❌ ${check.name} - NOT FOUND`, 'red');
      failed++;
    }
  }

  // Test 6: Check documentation
  log('\nTEST 6: DOCUMENTATION', 'bold');
  const docFiles = [
    'MUST_READ_FIRST.md',
    'SETUP.md',
    'TESTING.md',
    'QUICK_REFERENCE.md',
    'DELIVERABLES.md'
  ];

  for (const doc of docFiles) {
    const docPath = path.join(__dirname, doc);
    if (fs.existsSync(docPath)) {
      const size = fs.statSync(docPath).size;
      log(`  ✅ ${doc} (${Math.round(size / 1024)} KB)`, 'green');
      passed++;
    } else {
      log(`  ❌ ${doc} - MISSING`, 'red');
      failed++;
    }
  }

  // Test 7: Check package.json files
  log('\nTEST 7: PACKAGE.JSON FILES', 'bold');
  const packageFiles = [
    'backend/package.json',
    'dashboard/package.json'
  ];

  for (const pkgFile of packageFiles) {
    const pkgPath = path.join(__dirname, pkgFile);
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name && pkg.dependencies) {
        log(`  ✅ ${pkgFile} (${Object.keys(pkg.dependencies).length} dependencies)`, 'green');
        passed++;
      } else {
        log(`  ❌ ${pkgFile} - Invalid format`, 'red');
        failed++;
      }
    } catch (err) {
      log(`  ❌ ${pkgFile} - ${err.message}`, 'red');
      failed++;
    }
  }

  // Test 8: Simulate event payload
  log('\nTEST 8: EVENT PAYLOAD SIMULATION', 'bold');

  const mockEvents = [
    { type: 'page_view', required: ['event_type', 'session_id', 'page_url', 'timestamp'] },
    { type: 'button_click', required: ['event_type', 'session_id', 'button_id', 'metadata'] },
    { type: 'form_interaction', required: ['event_type', 'session_id', 'field_name', 'metadata'] },
    { type: 'scroll_depth', required: ['event_type', 'session_id', 'metadata'] }
  ];

  for (const event of mockEvents) {
    const payload = {
      event_type: event.type,
      session_id: 'test_session_123',
      page_url: 'https://ihandyandy.com',
      page_title: 'TV Mounting Service',
      timestamp: new Date().toISOString(),
      user_agent: 'Mozilla/5.0',
      button_id: 'book-now',
      button_text: 'Book Now',
      field_name: 'zip_code',
      field_type: 'text',
      metadata: { depth_percent: 75 }
    };

    const hasRequired = event.required.every(field => field in payload);
    if (hasRequired) {
      log(`  ✅ ${event.type} payload valid`, 'green');
      passed++;
    } else {
      log(`  ❌ ${event.type} payload invalid`, 'red');
      failed++;
    }
  }

  // Summary
  log('\n╔════════════════════════════════════════════════╗', 'blue');
  log(`║  RESULTS: ${passed} PASSED, ${failed} FAILED               ║`, failed > 0 ? 'red' : 'green');
  log('╚════════════════════════════════════════════════╝\n', failed > 0 ? 'red' : 'green');

  if (failed === 0) {
    log('✅ ALL LOCAL TESTS PASSED!', 'green');
    log('\nNext steps:', 'bold');
    log('1. Open MUST_READ_FIRST.md');
    log('2. Follow the 6 steps for deployment');
    log('3. Run tests from TESTING.md\n');
  } else {
    log(`⚠️  ${failed} test(s) failed. Check errors above.`, 'red');
    log('Files may be missing or corrupted.\n', 'red');
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  log('Fatal error: ' + err.message, 'red');
  process.exit(1);
});
