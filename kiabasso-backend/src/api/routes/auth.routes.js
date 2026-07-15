const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const AuthController = require('../../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const { authLimiter } = require('../middlewares/rateLimiter');

router.post('/register', authLimiter, [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[A-Z])(?=.*\d)/).withMessage('Senha deve ter 8+ caracteres, 1 maiúscula e 1 número'),
  body('phone').optional().matches(/^\+?244\d{9}$/).withMessage('Formato angolano: +244 9XX XXX XXX'),
], validate, AuthController.register);

router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha obrigatória'),
], validate, AuthController.login);

router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token obrigatório'),
], validate, AuthController.refresh);

router.get('/me', authenticate, AuthController.me);
router.put('/profile', authenticate, AuthController.updateProfile);

router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
], validate, AuthController.forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token obrigatório'),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[A-Z])(?=.*\d)/).withMessage('Senha deve ter 8+ caracteres, 1 maiúscula e 1 número'),
], validate, AuthController.resetPassword);

router.post('/send-verification', authenticate, [
  body('phone').optional().matches(/^\+?244\d{9}$/).withMessage('Formato angolano: +244 9XX XXX XXX'),
], validate, AuthController.sendVerification);

router.post('/verify-phone', authenticate, [
  body('code').isLength({ min: 6, max: 6 }).withMessage('Código deve ter 6 dígitos'),
], validate, AuthController.verifyPhone);

module.exports = router;
