const pool = require('../config/database');
const PromotionModel = require('../models/Promotion');
const WalletModel = require('../models/Wallet');
const TransactionModel = require('../models/Transaction');
const AdModel = require('../models/Ad');

const PromotionService = {
  async purchase(adId, plan, userId) {
    const ad = await AdModel.findById(adId);
    if (!ad) throw new Error('Anúncio não encontrado');
    if (ad.user_id !== userId) throw new Error('Não autorizado');

    const plans = PromotionModel.getPlans();
    const planConfig = plans[plan];
    if (!planConfig) throw new Error('Plano inválido');

    const wallet = await WalletModel.findByUserId(userId);
    if (!wallet) throw new Error('Bolsa não encontrada');
    if (wallet.available_balance < planConfig.price) throw new Error('Saldo insuficiente');

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        'UPDATE wallets SET available_balance = available_balance - ?, total_balance = total_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND available_balance >= ?',
        [planConfig.price, planConfig.price, userId, planConfig.price]
      );

      const promotion = await PromotionModel.create({ adId, userId, plan });

      await connection.execute(
        `INSERT INTO transactions (id, wallet_id, type, amount, description, reference)
         VALUES (?, ?, 'promotion', ?, ?, ?)`,
        [require('uuid').v4(), wallet.id, -planConfig.price, `Promoção ${planConfig.label} - ${ad.title}`, `PROMO-${promotion.id.slice(0, 8).toUpperCase()}`]
      );

      await connection.commit();
      return promotion;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async getUserPromotions(userId) {
    return PromotionModel.findByUserId(userId);
  },

  getPlans() {
    return PromotionModel.getPlans();
  },

  async expireOld() {
    return PromotionModel.expireOld();
  },
};

module.exports = PromotionService;
