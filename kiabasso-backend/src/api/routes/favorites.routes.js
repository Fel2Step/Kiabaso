const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const FavoritesController = require('../../controllers/favorites.controller');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

router.get('/', authenticate, FavoritesController.list);
router.post('/', authenticate, [
  body('ad_id').notEmpty().withMessage('ID do anúncio obrigatório'),
], validate, FavoritesController.toggle);
router.get('/check', authenticate, [
  query('ad_id').notEmpty().withMessage('ID do anúncio obrigatório'),
], validate, FavoritesController.check);

module.exports = router;
