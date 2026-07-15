const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const AdsController = require('../../controllers/ads.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

router.get('/feed', AdsController.getFeed);
router.get('/categories', AdsController.getCategories);
router.get('/search', AdsController.search);
router.get('/my', authenticate, AdsController.getMyAds);
router.get('/:id', optionalAuth, AdsController.getById);

router.post('/', authenticate, [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Título deve ter entre 3 e 200 caracteres'),
  body('description').optional().isLength({ max: 5000 }),
  body('price').isFloat({ min: 0 }).withMessage('Preço deve ser positivo'),
  body('category').notEmpty().withMessage('Categoria obrigatória'),
  body('location').notEmpty().withMessage('Localização obrigatória'),
], validate, AdsController.create);

router.put('/:id', authenticate, AdsController.update);
router.delete('/:id', authenticate, AdsController.delete);

module.exports = router;
