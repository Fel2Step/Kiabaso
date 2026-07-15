const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

function setupNotificationSocket(io) {
  const notifNamespace = io.of('/notifications');

  notifNamespace.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Token não fornecido'));

      const decoded = jwt.verify(token, jwtConfig.secret);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  notifNamespace.on('connection', (socket) => {
    const userId = socket.userId;
    socket.join(`user:${userId}`);
    console.log(`[Socket] Utilizador ${userId} conectado a notificações`);

    socket.on('subscribe_order', ({ orderId }) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('unsubscribe_order', ({ orderId }) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Utilizador ${userId} desconectado de notificações`);
    });
  });

  return notifNamespace;
}

function emitNotification(io, userId, notification) {
  io.of('/notifications').to(`user:${userId}`).emit('notification', notification);
}

function emitOrderUpdate(io, orderId, data) {
  io.of('/notifications').to(`order:${orderId}`).emit('order_update', data);
}

module.exports = { setupNotificationSocket, emitNotification, emitOrderUpdate };
