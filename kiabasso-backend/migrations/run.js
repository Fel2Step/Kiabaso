require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const MIGRATIONS = [
  { file: '001_initial.sql', label: 'Tabelas principais' },
  { file: '002_password_resets.sql', label: 'Password resets' },
];

async function runMigrations() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
    });

    for (const migration of MIGRATIONS) {
      const filePath = path.join(__dirname, migration.file);
      if (fs.existsSync(filePath)) {
        const sql = fs.readFileSync(filePath, 'utf8');
        try {
          await connection.query(sql);
          console.log(`[Migration] ${migration.file} — ${migration.label} aplicado com sucesso!`);
        } catch (error) {
          if (error.message.includes('Duplicate') || error.message.includes('already exists')) {
            console.log(`[Migration] ${migration.file} — ${migration.label} já aplicado (ignorado)`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('[Migration] Todas as migrações aplicadas!');
  } catch (error) {
    console.error('[Migration] Erro:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

runMigrations();
