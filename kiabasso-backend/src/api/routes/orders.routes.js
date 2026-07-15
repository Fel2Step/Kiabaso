const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const OrdersController = require('../../controllers/orders.controller');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

router.use(authenticate);

router.get('/buyer', OrdersController.getBuyerOrders);
router.get('/seller', OrdersController.getSellerOrders);
router.get('/:id', OrdersController.getById);

router.post('/', [
  body('ad_id').notEmpty().withMessage('ID do anúncio obrigatório'),
], validate, OrdersController.purchase);

router.post('/:id/accept', OrdersController.accept);
router.post('/:id/confirm-delivery', OrdersController.confirmDelivery);
router.post('/:id/confirm-seller', OrdersController.confirmSellerDelivery);
router.post('/:id/cancel', OrdersController.cancel);
router.post('/:id/in-transit', OrdersController.markInTransit);

module.exports = router;
