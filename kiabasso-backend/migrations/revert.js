require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function revertMigrations() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    await connection.query(`
      USE kiabasso;
      DROP TABLE IF EXISTS reviews;
      DROP TABLE IF EXISTS favorites;
      DROP TABLE IF EXISTS messages;
      DROP TABLE IF EXISTS promotions;
      DROP TABLE IF EXISTS disputes;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS transactions;
      DROP TABLE IF EXISTS wallets;
      DROP TABLE IF EXISTS ads;
      DROP TABLE IF EXISTS users;
    `);
    console.log('[Migration] Todas as tabelas foram removidas.');
  } catch (error) {
    console.error('[Migration] Erro:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

revertMigrations();
