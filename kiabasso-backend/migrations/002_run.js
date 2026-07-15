require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kiabasso',
      multipleStatements: true,
    });

    const sql = fs.readFileSync(path.join(__dirname, '002_password_resets.sql'), 'utf8');
    await connection.query(sql);
    console.log('[Migration 002] Tabela password_resets criada com sucesso!');
  } catch (error) {
    console.error('[Migration 002] Erro:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

run();
