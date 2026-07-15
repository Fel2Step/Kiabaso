require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');

const CATEGORIES = [
  'eletronicos', 'moda', 'automoveis', 'imoveis', 'servicos',
  'desporto', 'casa_jardim', 'livros', 'musica_filmes', 'outros'
];

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('[Seed] Este script não pode ser executado em produção!');
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    await connection.query('DROP DATABASE IF EXISTS kiabasso');
    await connection.query('CREATE DATABASE kiabasso CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('USE kiabasso');

    const fs = require('fs');
    const path = require('path');
    const initSql = fs.readFileSync(path.join(__dirname, '..', 'migrations', '001_initial.sql'), 'utf8');
    await connection.query(initSql);
    await connection.query('USE kiabasso');

    const passwordHash = await bcrypt.hash('Teste@123', 12);

    const users = [
      { id: uuidv4(), name: 'João Silva', email: 'joao@email.com', phone: '+244923100001', location: 'Miramar, Luanda', bio: 'Estudante ISPTEC' },
      { id: uuidv4(), name: 'Maria Santos', email: 'maria@email.com', phone: '+244923100002', location: 'Talatona, Luanda', bio: 'Empreendedora digital' },
      { id: uuidv4(), name: 'Pedro Ngola', email: 'pedro@email.com', phone: '+244923100003', location: 'Kilamba, Luanda', bio: 'Vendedor online' },
      { id: uuidv4(), name: 'Ana Bela', email: 'ana@email.com', phone: '+244923100004', location: 'Viana, Luanda', bio: 'Designer' },
      { id: uuidv4(), name: 'Carlos Makonde', email: 'carlos@email.com', phone: '+244923100005', location: 'Benfica, Luanda', bio: 'Tech enthusiast' },
    ];

    for (const u of users) {
      await connection.execute(
        `INSERT INTO users (id, name, email, password_hash, phone, verified, status, location, bio, rating, total_sales, total_ads)
         VALUES (?, ?, ?, ?, ?, true, 'active', ?, ?, ?, ?, ?)`,
        [u.id, u.name, u.email, passwordHash, u.phone, u.location, u.bio, Math.floor(Math.random() * 20 + 30) / 10, Math.floor(Math.random() * 10), Math.floor(Math.random() * 5 + 2)]
      );
    }

    for (const u of users) {
      const walletId = uuidv4();
      await connection.execute(
        `INSERT INTO wallets (id, user_id, available_balance, blocked_balance, total_balance, currency)
         VALUES (?, ?, 25000, 0, 25000, 'AOA')`,
        [walletId, u.id]
      );

      await connection.execute(
        `INSERT INTO transactions (id, wallet_id, type, amount, description, reference, status)
         VALUES (?, ?, 'deposit', 25000, 'Crédito inicial de boas-vindas', ?, 'completed')`,
        [uuidv4(), walletId, `WELCOME-${u.id.slice(0, 8).toUpperCase()}`]
      );
    }

    const ads = [
      { title: 'iPhone 14 Pro Max 256GB', desc: 'Novo, selado, com garantia de 1 ano. Cor roxo profundo.', price: 450000, cat: 'eletronicos', loc: 'Miramar, Luanda', cond: 'new' },
      { title: 'MacBook Air M2 2024', desc: '8GB RAM, 256GB SSD, cor meia-noite. Apenas 3 meses de uso.', price: 620000, cat: 'eletronicos', loc: 'Talatona, Luanda', cond: 'used' },
      { title: 'Vestido Premium Feminino', desc: 'Vestido longo azul marinho, tamanho M, usado apenas 1 vez.', price: 8500, cat: 'moda', loc: 'Viana, Luanda', cond: 'used' },
      { title: 'Toyota Corolla 2020', desc: 'Completo, ar condicionado, direção assistida, único dono.', price: 4500000, cat: 'automoveis', loc: 'Kilamba, Luanda', cond: 'used' },
      { title: 'Apartamento T2 Talatona', desc: '2 quartos, sala, cozinha, 2 casas de banho, condomínio fechado.', price: 15000000, cat: 'imoveis', loc: 'Talatona, Luanda', cond: 'used' },
      { title: 'Samsung Galaxy S24 Ultra', desc: 'Novo, 512GB, com carregador e capa original.', price: 520000, cat: 'eletronicos', loc: 'Benfica, Luanda', cond: 'new' },
      { title: 'Bicicleta de Montanha', desc: 'Aro 29, 21 velocidades, suspensão dianteira, excelente estado.', price: 45000, cat: 'desporto', loc: 'Viana, Luanda', cond: 'used' },
      { title: 'Sofá 3 Lugares', desc: 'Sofá em couro sintético, cor bege, muito confortável.', price: 85000, cat: 'casa_jardim', loc: 'Kilamba, Luanda', cond: 'used' },
      { title: 'Curso de Programação Web', desc: 'Curso online completo: HTML, CSS, JavaScript, React. Certificado incluído.', price: 15000, cat: 'servicos', loc: 'Luanda', cond: 'new' },
      { title: 'PlayStation 5 + 2 Jogos', desc: 'Console PS5 digital edition com FIFA 24 e Call of Duty.', price: 280000, cat: 'eletronicos', loc: 'Miramar, Luanda', cond: 'used' },
    ];

    for (let i = 0; i < ads.length; i++) {
      const a = ads[i];
      const adId = uuidv4();
      const userId = users[i % users.length].id;
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const isFeatured = i < 2;

      await connection.execute(
        `INSERT INTO ads (id, title, description, price, category, location, \`condition\`, user_id, status, is_featured, views, favorites, images, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)`,
        [adId, a.title, a.desc, a.price, a.cat, a.loc, a.cond, userId,
         isFeatured, Math.floor(Math.random() * 500), Math.floor(Math.random() * 50),
         JSON.stringify([`https://picsum.photos/seed/${adId}/400/300`]),
         createdAt, expiresAt]
      );

      if (isFeatured) {
        const promoId = uuidv4();
        const promoStart = new Date(createdAt.getTime() - 1 * 24 * 60 * 60 * 1000);
        const promoEnd = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
        await connection.execute(
          `INSERT INTO promotions (id, ad_id, user_id, plan, price, duration_days, start_date, end_date, status)
           VALUES (?, ?, ?, 'premium', 1500, 7, ?, ?, 'active')`,
          [promoId, adId, userId, promoStart, promoEnd]
        );
      }
    }

    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║           Kiabasso - Base de Dados Criada          ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    console.log('  📧 Contas de Teste:');
    console.log('  ───────────────────────────────────────────');
    for (const u of users) {
      console.log(`  ${u.name.padEnd(20)} ${u.email.padEnd(25)} senha: Teste@123`);
    }
    console.log('');
    console.log('  💰 Todos os utilizadores têm 25.000 Kz na Bolsa');
    console.log('  📦 10 anúncios de exemplo criados');
    console.log('  🚀 2 anúncios com promoção Premium');
    console.log('');

  } catch (error) {
    console.error('[Seed] Erro:', error.message);
    console.error(error);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
