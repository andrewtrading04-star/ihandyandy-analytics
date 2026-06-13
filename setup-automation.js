#!/usr/bin/env node

/**
 * SETUP AUTOMATION SCRIPT
 * Handles all the technical setup tasks
 *
 * Usage: node setup-automation.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

function log(msg, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    bold: '\x1b[1m'
  };
  console.log(colors[color] + msg + colors.reset);
}

async function main() {
  log('\n╔════════════════════════════════════════════════╗', 'blue');
  log('║   iHandyAndy Analytics - Automated Setup       ║', 'blue');
  log('╚════════════════════════════════════════════════╝\n', 'blue');

  // Step 1: Collect credentials
  log('Step 1: COLLECT YOUR CREDENTIALS', 'bold');
  log('(Get these from Supabase and Vercel)\n', 'yellow');

  const supabaseUrl = await question('Enter Supabase URL (https://xxxxx.supabase.co): ');
  const anonKey = await question('Enter Supabase Anon Key: ');
  const serviceRoleKey = await question('Enter Supabase Service Role Key: ');
  const backendUrl = await question('Enter Backend URL (https://your-backend.vercel.app): ');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    log('❌ Missing required credentials!', 'red');
    process.exit(1);
  }

  // Step 2: Create .env files
  log('\nStep 2: CREATING CONFIGURATION FILES', 'bold');

  const backendEnv = `# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}

# Server Configuration
PORT=3000
NODE_ENV=production
`;

  try {
    fs.writeFileSync(path.join(__dirname, 'backend', '.env.local'), backendEnv);
    log('✅ Created backend/.env.local', 'green');
  } catch (err) {
    log('❌ Error creating .env.local: ' + err.message, 'red');
    process.exit(1);
  }

  // Step 3: Update tracker.js
  log('\nStep 3: UPDATING TRACKING SCRIPT', 'bold');

  try {
    let trackerContent = fs.readFileSync(
      path.join(__dirname, 'tracking', 'tracker.js'),
      'utf8'
    );

    const backendUrlToUse = backendUrl || 'https://your-backend-url.vercel.app';
    trackerContent = trackerContent.replace(
      "const BACKEND_URL = 'https://your-backend-url.vercel.app';",
      `const BACKEND_URL = '${backendUrlToUse}';`
    );

    fs.writeFileSync(
      path.join(__dirname, 'tracking', 'tracker.js'),
      trackerContent
    );
    log(`✅ Updated tracker.js with backend URL: ${backendUrlToUse}`, 'green');
  } catch (err) {
    log('❌ Error updating tracker.js: ' + err.message, 'red');
    process.exit(1);
  }

  // Step 4: Create deployment files
  log('\nStep 4: CREATING DEPLOYMENT HELPERS', 'bold');

  const vercelConfig = {
    version: 2,
    builds: [
      {
        src: 'backend/server.js',
        use: '@vercel/node'
      }
    ],
    routes: [
      {
        src: '/(.*)',
        dest: 'backend/server.js'
      }
    ]
  };

  try {
    fs.writeFileSync(
      path.join(__dirname, 'backend', 'vercel.json'),
      JSON.stringify(vercelConfig, null, 2)
    );
    log('✅ Created backend/vercel.json', 'green');
  } catch (err) {
    log('⚠️  Warning: Could not create vercel.json', 'yellow');
  }

  // Step 5: Create .gitignore if needed
  log('\nStep 5: SECURING SENSITIVE FILES', 'bold');

  const gitignore = `# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
`;

  try {
    const gitignorePath = path.join(__dirname, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, gitignore);
      log('✅ Created .gitignore', 'green');
    } else {
      log('✅ .gitignore already exists', 'green');
    }
  } catch (err) {
    log('⚠️  Warning: Could not update .gitignore', 'yellow');
  }

  // Step 6: Summary
  log('\n╔════════════════════════════════════════════════╗', 'green');
  log('║         SETUP COMPLETE! ✅                     ║', 'green');
  log('╚════════════════════════════════════════════════╝\n', 'green');

  log('NEXT STEPS:\n', 'bold');
  log('1. SUPABASE: Run database/schema.sql in Supabase SQL editor', 'yellow');
  log('   → Copy entire schema.sql file');
  log('   → Go to Supabase → SQL Editor');
  log('   → Create new query → Paste → Run\n');

  log('2. BACKEND: Install dependencies', 'yellow');
  log('   → cd backend');
  log('   → npm install\n');

  log('3. GITHUB: Push to GitHub', 'yellow');
  log('   → git add .');
  log('   → git commit -m "Initial analytics setup"');
  log('   → git push -u origin main\n');

  log('4. VERCEL: Deploy backend', 'yellow');
  log('   → Go to vercel.com/new');
  log('   → Import your GitHub repository');
  log('   → Add environment variables (same as .env.local)');
  log('   → Deploy\n');

  log('5. VERCEL: Deploy dashboard', 'yellow');
  log('   → Same repo, set root to "dashboard"');
  log('   → Build command: npm run build');
  log('   → Deploy\n');

  log('6. WEBSITE: Inject tracking script', 'yellow');
  log('   → Open tracking/tracker.js');
  log('   → Copy entire file');
  log('   → Go to Landingsite.ai → Code Injection');
  log('   → Paste in header');
  log('   → Publish\n');

  log('7. TEST: Verify everything works', 'yellow');
  log('   → Open TESTING.md');
  log('   → Follow all 6 test procedures\n');

  log('Configuration Summary:', 'bold');
  log(`Supabase URL: ${supabaseUrl}`, 'blue');
  log(`Backend URL: ${backendUrlToUse}`, 'blue');
  log(`Files created: .env.local, updated tracker.js\n`, 'blue');

  log('Questions? Check SETUP.md or QUICK_REFERENCE.md\n', 'yellow');

  rl.close();
}

main().catch(err => {
  log('Error: ' + err.message, 'red');
  process.exit(1);
});
