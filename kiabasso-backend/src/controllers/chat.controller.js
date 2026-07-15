const MessageModel = require('../models/Message');
const AdModel = require('../models/Ad');
const { buildResponse, paginate } = require('../utils/helpers');

const ChatController = {
  async sendMessage(req, res) {
    try {
      const { ad_id, receiver_id, content, message_type } = req.body;

      const ad = await AdModel.findById(ad_id);
      if (!ad) return res.status(404).json(buildResponse(false, null, 'Anúncio não encontrado'));

      const message = await MessageModel.create({
        adId: ad_id,
        senderId: req.user.id,
        receiverId: receiver_id,
        content,
        messageType: message_type || 'text',
      });

      res.status(201).json(buildResponse(true, message, 'Mensagem enviada'));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao enviar mensagem'));
    }
  },

  async getConversation(req, res) {
    try {
      const { page, limit } = paginate(req.query.page, req.query.limit);
      const { ad_id, user_id } = req.params;

      const messages = await MessageModel.getConversation(ad_id, req.user.id, user_id, { page, limit });
      await MessageModel.markConversationAsRead(ad_id, user_id, req.user.id);

      res.json(buildResponse(true, messages));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao carregar conversa'));
    }
  },

  async getConversations(req, res) {
    try {
      const { page, limit } = paginate(req.query.page, req.query.limit);
      const conversations = await MessageModel.getConversations(req.user.id, { page, limit });
      res.json(buildResponse(true, conversations));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao carregar conversas'));
    }
  },

  async getUnreadCount(req, res) {
    try {
      const count = await MessageModel.getUnreadCount(req.user.id);
      res.json(buildResponse(true, { count }));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao carregar não lidas'));
    }
  },
};

module.exports = ChatController;
