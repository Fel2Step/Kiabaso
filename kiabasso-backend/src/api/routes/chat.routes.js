const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ChatController = require('../../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

router.use(authenticate);

router.get('/conversations', ChatController.getConversations);
router.get('/unread', ChatController.getUnreadCount);
router.get('/:ad_id/:user_id', ChatController.getConversation);

router.post('/', [
  body('ad_id').notEmpty().withMessage('ID do anúncio obrigatório'),
  body('receiver_id').notEmpty().withMessage('ID do destinatário obrigatório'),
  body('content').notEmpty().withMessage('Conteúdo obrigatório'),
], validate, ChatController.sendMessage);

module.exports = router;
