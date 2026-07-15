const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const MessageModel = require('../models/Message');
const AdModel = require('../models/Ad');

const connectedUsers = new Map();

function setupChatSocket(io) {
  const chatNamespace = io.of('/chat');

  chatNamespace.use((socket, next) => {
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

  chatNamespace.on('connection', (socket) => {
    const userId = socket.userId;
    connectedUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    console.log(`[Socket] Utilizador ${userId} conectado ao chat`);

    socket.on('join_ad_chat', ({ adId }) => {
      socket.join(`ad:${adId}`);
      console.log(`[Socket] Utilizador ${userId} entrou na sala ad:${adId}`);
    });

    socket.on('leave_ad_chat', ({ adId }) => {
      socket.leave(`ad:${adId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { adId, receiverId, content, messageType } = data;

        const ad = await AdModel.findById(adId);
        if (!ad) return socket.emit('message_error', { success: false, message: 'Anúncio não encontrado' });

        const isParticipant = ad.user_id === userId || ad.user_id === receiverId;
        if (!isParticipant) {
          return socket.emit('message_error', { success: false, message: 'Não autorizado' });
        }

        const message = await MessageModel.create({
          adId,
          senderId: userId,
          receiverId,
          content,
          messageType: messageType || 'text',
        });

        const fullMessage = await MessageModel.findById(message.id);

        chatNamespace.to(`ad:${adId}`).emit('new_message', fullMessage);

        chatNamespace.to(`user:${receiverId}`).emit('new_message', fullMessage);

        socket.emit('message_sent', { success: true, message: fullMessage });
      } catch (error) {
        socket.emit('message_error', { success: false, message: error.message });
      }
    });

    socket.on('mark_read', async ({ messageId }) => {
      try {
        const message = await MessageModel.findById(messageId);
        if (!message) return;

        if (message.receiver_id !== userId) {
          return socket.emit('message_error', { success: false, message: 'Não autorizado' });
        }

        await MessageModel.markAsRead(messageId);
        chatNamespace.to(`user:${message.sender_id}`).emit('message_read', { messageId, readAt: new Date() });
      } catch (error) {
        console.error('[Socket] Erro ao marcar como lida:', error);
      }
    });

    socket.on('typing', ({ adId, receiverId, isTyping }) => {
      chatNamespace.to(`user:${receiverId}`).emit('typing', {
        adId,
        userId,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      console.log(`[Socket] Utilizador ${userId} desconectado do chat`);
    });
  });

  return chatNamespace;
}

function isUserOnline(userId) {
  return connectedUsers.has(userId);
}

module.exports = { setupChatSocket, isUserOnline };
