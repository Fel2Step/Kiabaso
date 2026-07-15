require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const path = require('path');

const authRoutes = require('./src/api/routes/auth.routes');
const userRoutes = require('./src/api/routes/users.routes');
const adRoutes = require('./src/api/routes/ads.routes');
const walletRoutes = require('./src/api/routes/wallet.routes');
const orderRoutes = require('./src/api/routes/orders.routes');
const disputeRoutes = require('./src/api/routes/disputes.routes');
const promotionRoutes = require('./src/api/routes/promotions.routes');
const chatRoutes = require('./src/api/routes/chat.routes');
const reviewRoutes = require('./src/api/routes/reviews.routes');
const favoriteRoutes = require('./src/api/routes/favorites.routes');
const uploadRoutes = require('./src/api/routes/upload.routes');
const { apiLimiter } = require('./src/api/middlewares/rateLimiter');
const { setupChatSocket } = require('./src/sockets/chat.socket');
const { setupNotificationSocket } = require('./src/sockets/notification.socket');
const PromotionService = require('./src/services/promotion.service');
const CleanupJob = require('./src/jobs/cleanup.job');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Kiabasso API funcionando', version: '1.0.0', timestamp: new Date() });
});

app.get('/api/fee', (req, res) => {
  const PaymentService = require('./src/services/payment.service');
  res.json({ success: true, data: { fee_percent: PaymentService.getFeePercent() * 100 } });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/upload', uploadRoutes);

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ success: false, message: 'Erro interno do servidor' });
});

setupChatSocket(io);
setupNotificationSocket(io);

setInterval(async () => {
  try {
    const expired = await PromotionService.expireOld();
    if (expired > 0) {
      console.log(`[Cron] ${expired} promoções expiradas`);
    }
  } catch (error) {
    console.error('[Cron] Erro ao expirar promoções:', error);
  }
}, 60 * 60 * 1000);

setInterval(async () => {
  await CleanupJob.run();
}, 6 * 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║        Kiabasso API - ${PORT}           ║`);
  console.log(`║  Marketplace Digital - ISPTEC 2025      ║`);
  console.log(`╚══════════════════════════════════════════╝\n`);
  console.log(`[Server] API: http://localhost:${PORT}/api`);
  console.log(`[Server] Chat: ws://localhost:${PORT}/chat`);
  console.log(`[Server] Notificações: ws://localhost:${PORT}/notifications`);
  console.log(`[Server] Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
