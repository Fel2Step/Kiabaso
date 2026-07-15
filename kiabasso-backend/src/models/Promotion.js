const pool = require('../config/database');
const { generateUUID } = require('../utils/helpers');

const PROMOTION_PLANS = {
  basico: { price: 500, duration_days: 3, label: 'Básico' },
  premium: { price: 1500, duration_days: 7, label: 'Premium' },
  vip: { price: 3000, duration_days: 14, label: 'VIP' },
};

const PromotionModel = {
  async create({ adId, userId, plan }) {
    const planConfig = PROMOTION_PLANS[plan];
    if (!planConfig) throw new Error('Plano de promoção inválido');

    const id = generateUUID();
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + planConfig.duration_days * 24 * 60 * 60 * 1000);

    await pool.execute(
      `INSERT INTO promotions (id, ad_id, user_id, plan, price, duration_days, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [id, adId, userId, plan, planConfig.price, planConfig.duration_days, startDate, endDate]
    );

    await pool.execute(
      'UPDATE ads SET promotion_level = ?, is_featured = true WHERE id = ?',
      [plan, adId]
    );

    return this.findById(id);
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, a.title as ad_title
       FROM promotions p
       JOIN ads a ON p.ad_id = a.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT p.*, a.title as ad_title
       FROM promotions p
       JOIN ads a ON p.ad_id = a.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async expireOld() {
    const [rows] = await pool.execute(
      `SELECT p.* FROM promotions p WHERE p.status = 'active' AND p.end_date < NOW()`
    );
    for (const promo of rows) {
      await pool.execute('UPDATE promotions SET status = ? WHERE id = ?', ['expired', promo.id]);
      await pool.execute('UPDATE ads SET promotion_level = "free", is_featured = false WHERE id = ?', [promo.ad_id]);
    }
    return rows.length;
  },

  getPlans() {
    return PROMOTION_PLANS;
  },
};

module.exports = PromotionModel;
