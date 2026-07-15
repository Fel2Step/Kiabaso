const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const WalletController = require('../../controllers/wallet.controller');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

router.use(authenticate);

router.get('/', WalletController.getBalance);
router.get('/history', WalletController.getHistory);

router.post('/deposit', [
  body('amount').isFloat({ min: 500 }).withMessage('Depósito mínimo: 500 Kz'),
], validate, WalletController.deposit);

router.post('/withdraw', [
  body('amount').isFloat({ min: 1000 }).withMessage('Levantamento mínimo: 1.000 Kz'),
], validate, WalletController.withdraw);

module.exports = router;
