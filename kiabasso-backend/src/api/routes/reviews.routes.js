const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ReviewsController = require('../../controllers/reviews.controller');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

router.post('/', authenticate, [
  body('orderId').notEmpty().withMessage('ID do pedido obrigatório'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Avaliação deve ser entre 1 e 5'),
  body('comment').optional().trim().isLength({ max: 1000 }),
], validate, ReviewsController.create);

router.get('/user/:id', ReviewsController.getByUser);

module.exports = router;
