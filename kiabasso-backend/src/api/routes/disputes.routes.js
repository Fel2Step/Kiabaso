const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const DisputesController = require('../../controllers/disputes.controller');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

router.use(authenticate);

router.get('/', DisputesController.getAll);

router.post('/', [
  body('order_id').notEmpty().withMessage('ID do pedido obrigatório'),
  body('reason').notEmpty().withMessage('Motivo obrigatório'),
  body('description').notEmpty().withMessage('Descrição obrigatória'),
], validate, DisputesController.open);

router.put('/:id/resolve', [
  body('resolution').notEmpty().withMessage('Resolução obrigatória'),
  body('status').isIn(['resolved_buyer', 'resolved_seller', 'dismissed']).withMessage('Status inválido'),
], validate, DisputesController.resolve);

module.exports = router;
