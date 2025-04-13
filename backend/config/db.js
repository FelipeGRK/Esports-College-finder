const mysql = require('mysql2'); // Use mysql2 instead of pg
require('dotenv').config(); // Load .env file

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'senha',
  database: process.env.DB_NAME || 'esports',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 60,
  queueLimit: 0
}).promise(); // Use promise-based pool for async/await support

module.exports = pool;
