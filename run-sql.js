const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
  host: 'dqlefeafzvjbcrhqhdps.db.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'K8_95k_dK*bGQjj',
  ssl: { rejectUnauthorized: false }
});

async function runSQL() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase');
    
    const sql = fs.readFileSync('./database/schema.sql', 'utf8');
    await client.query(sql);
    console.log('✅ Schema created successfully!');
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('✅ Tables created:', result.rows.map(r => r.table_name).join(', '));
    
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

runSQL();
