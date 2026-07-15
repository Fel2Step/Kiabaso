const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kiabasso',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  connectTimeout: 5000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
});

setTimeout(() => {
  pool.getConnection()
    .then(conn => {
      console.log('[DB] MySQL conectado com sucesso');
      conn.release();
    })
    .catch(err => {
      console.error('[DB] Erro ao conectar ao MySQL:', err.message);
    });
}, 100);

module.exports = pool;
