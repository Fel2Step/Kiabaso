const AuthService = require('../services/auth.service');
const UserModel = require('../models/User');
const WalletModel = require('../models/Wallet');
const { buildResponse } = require('../utils/helpers');

const AuthController = {
  async register(req, res) {
    try {
      const { name, email, password, phone } = req.body;
      const result = await AuthService.register({ name, email, password, phone });

      let wallet = await WalletModel.findByUserId(result.user.id);
      if (!wallet) {
        wallet = await WalletModel.create(result.user.id);
        await WalletModel.addBalance(result.user.id, 10000);
      }

      res.status(201).json(buildResponse(true, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        wallet,
      }, 'Conta criada com sucesso'));
    } catch (error) {
      if (error.message === 'Email já registado') {
        return res.status(409).json(buildResponse(false, null, error.message));
      }
      res.status(500).json(buildResponse(false, null, 'Erro ao registar'));
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      const wallet = await WalletModel.findByUserId(result.user.id);

      res.json(buildResponse(true, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        wallet,
      }, 'Login bem-sucedido'));
    } catch (error) {
      res.status(401).json(buildResponse(false, null, error.message));
    }
  },

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json(buildResponse(false, null, 'Refresh token não fornecido'));
      }

      const tokens = await AuthService.refreshTokens(refreshToken);
      res.json(buildResponse(true, tokens));
    } catch (error) {
      res.status(401).json(buildResponse(false, null, 'Refresh token inválido'));
    }
  },

  async me(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      const wallet = await WalletModel.findByUserId(req.user.id);
      res.json(buildResponse(true, { user, wallet }));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao obter perfil'));
    }
  },

  async updateProfile(req, res) {
    try {
      const allowedFields = ['name', 'phone', 'location', 'bio', 'avatar_url'];
      const updates = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      const user = await UserModel.update(req.user.id, updates);
      res.json(buildResponse(true, user, 'Perfil actualizado'));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao actualizar perfil'));
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      res.json(buildResponse(true, null, result.message));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao processar pedido'));
    }
  },

  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      const result = await AuthService.resetPassword(token, password);
      res.json(buildResponse(true, null, result.message));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async sendVerification(req, res) {
    try {
      const { phone } = req.body;
      await AuthService.sendVerificationCode(req.user.id, phone || req.user.phone);
      res.json(buildResponse(true, null, 'Código enviado'));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao enviar código'));
    }
  },

  async verifyPhone(req, res) {
    try {
      const { code } = req.body;
      const result = await AuthService.verifyCode(req.user.id, code);
      res.json(buildResponse(true, null, result.message));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },
};

module.exports = AuthController;
