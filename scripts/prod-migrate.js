require('dotenv').config({ path: require('path').join(__dirname, '..', 'kiabasso-backend', '.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const MIGRATIONS = [
  { file: '001_initial.sql', label: 'Tabelas principais' },
  { file: '002_password_resets.sql', label: 'Password resets' },
];

async function run() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${process.env.DB_NAME}\``);

    for (const m of MIGRATIONS) {
      const filePath = path.join(__dirname, '..', 'kiabasso-backend', 'migrations', m.file);
      if (fs.existsSync(filePath)) {
        const sql = fs.readFileSync(filePath, 'utf8');
        try {
          await connection.query(sql);
          console.log(`[OK] ${m.file} — ${m.label}`);
        } catch (error) {
          if (error.message.includes('Duplicate') || error.message.includes('already exists')) {
            console.log(`[SKIP] ${m.file} — já aplicado`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('\nMigrações aplicadas com sucesso!');
    console.log(`Base de dados: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
  } catch (error) {
    console.error('Erro:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

run();
