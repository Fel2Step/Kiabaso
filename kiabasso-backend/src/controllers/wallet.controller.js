const WalletService = require('../services/wallet.service');
const { buildResponse, paginate } = require('../utils/helpers');

const WalletController = {
  async getBalance(req, res) {
    try {
      const wallet = await WalletService.getBalance(req.user.id);
      res.json(buildResponse(true, wallet));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao obter saldo'));
    }
  },

  async deposit(req, res) {
    try {
      const { amount } = req.body;
      if (!amount || amount < 500) {
        return res.status(400).json(buildResponse(false, null, 'Valor mínimo de depósito: 500 Kz'));
      }
      const wallet = await WalletService.deposit(req.user.id, amount);
      res.json(buildResponse(true, wallet, `Depósito de ${amount} Kz realizado com sucesso`));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async withdraw(req, res) {
    try {
      const { amount } = req.body;
      if (!amount || amount < 1000) {
        return res.status(400).json(buildResponse(false, null, 'Valor mínimo de levantamento: 1.000 Kz'));
      }
      const wallet = await WalletService.withdraw(req.user.id, amount);
      res.json(buildResponse(true, wallet, 'Levantamento solicitado com sucesso'));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async getHistory(req, res) {
    try {
      const { page, limit } = paginate(req.query.page, req.query.limit);
      const result = await WalletService.getHistory(req.user.id, page, limit);
      res.json(buildResponse(true, result));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao obter histórico'));
    }
  },
};

module.exports = WalletController;
