const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool — reuses connections instead of opening a new one
// for every query, which is far more efficient under load.
const pool = mysql.createPool({
  host:            process.env.DB_HOST     || 'localhost',
  user:            process.env.DB_USER     || 'root',
  password:        process.env.DB_PASSWORD || '',
  database:        process.env.DB_NAME     || 'hardware_store',
  waitForConnections: true,
  connectionLimit:    10,   // max simultaneous connections
  queueLimit:          0,   // unlimited queuing
  timezone:       '+00:00', // store timestamps in UTC
});

// Verify connectivity on startup
pool.getConnection()
  .then(conn => {
    console.log('✅  MySQL connected successfully');
    conn.release(); // always release back to the pool
  })
  .catch(err => {
    console.error('❌  MySQL connection failed:', err.message);
    process.exit(1); // can't run without a database
  });

module.exports = pool;
