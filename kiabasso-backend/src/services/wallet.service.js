const WalletModel = require('../models/Wallet');
const TransactionModel = require('../models/Transaction');

const WalletService = {
  async deposit(userId, amount) {
    if (amount < 500) throw new Error('Depósito mínimo é de 500 Kz');

    let wallet = await WalletModel.findByUserId(userId);
    if (!wallet) {
      wallet = await WalletModel.create(userId);
    }

    await WalletModel.addBalance(userId, amount);
    await TransactionModel.create({
      walletId: wallet.id,
      type: 'deposit',
      amount,
      description: `Depósito de ${amount} Kz`,
    });

    return WalletModel.findByUserId(userId);
  },

  async withdraw(userId, amount) {
    if (amount < 1000) throw new Error('Levantamento mínimo é de 1.000 Kz');

    const wallet = await WalletModel.findByUserId(userId);
    if (!wallet) throw new Error('Bolsa não encontrada');
    if (wallet.available_balance < amount) throw new Error('Saldo insuficiente');

    const fee = Math.min(Math.max(amount * 0.02, 50), 500);
    const totalDeduction = amount + fee;

    if (wallet.available_balance < totalDeduction) throw new Error('Saldo insuficiente para taxa');

    await WalletModel.deductBalance(userId, totalDeduction);
    await TransactionModel.create({
      walletId: wallet.id,
      type: 'withdrawal',
      amount: -amount,
      feeAmount: fee,
      description: `Levantamento de ${amount} Kz (taxa: ${fee} Kz)`,
    });

    return WalletModel.findByUserId(userId);
  },

  async getBalance(userId) {
    let wallet = await WalletModel.findByUserId(userId);
    if (!wallet) {
      wallet = await WalletModel.create(userId);
    }
    return wallet;
  },

  async getHistory(userId, page, limit) {
    return TransactionModel.getHistory(userId, { page, limit });
  },
};

module.exports = WalletService;
