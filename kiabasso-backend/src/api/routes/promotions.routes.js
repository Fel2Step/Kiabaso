const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const PromotionsController = require('../../controllers/promotions.controller');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

router.get('/plans', PromotionsController.getPlans);

router.use(authenticate);
router.get('/my', PromotionsController.getMyPromotions);

router.post('/', [
  body('ad_id').notEmpty().withMessage('ID do anúncio obrigatório'),
  body('plan').isIn(['basico', 'premium', 'vip']).withMessage('Plano inválido: básico, premium ou vip'),
], validate, PromotionsController.purchase);

module.exports = router;
