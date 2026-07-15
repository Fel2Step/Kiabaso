const pool = require('../config/database');
const { generateUUID } = require('../utils/helpers');

const OrderModel = {
  async create({ adId, buyerId, sellerId, amount, feeAmount }) {
    const id = generateUUID();
    const trackingCode = `KBS-${id.slice(0, 8).toUpperCase()}`;
    await pool.execute(
      `INSERT INTO orders (id, ad_id, buyer_id, seller_id, amount, fee_amount, status, tracking_code)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [id, adId, buyerId, sellerId, amount, feeAmount, trackingCode]
    );
    return this.findById(id);
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT o.*, a.title as ad_title, a.images as ad_images,
              buyer.name as buyer_name, buyer.avatar_url as buyer_avatar,
              seller.name as seller_name, seller.avatar_url as seller_avatar
       FROM orders o
       JOIN ads a ON o.ad_id = a.id
       JOIN users buyer ON o.buyer_id = buyer.id
       JOIN users seller ON o.seller_id = seller.id
       WHERE o.id = ?`,
      [id]
    );
    if (rows[0]) {
      rows[0].ad_images = typeof rows[0].ad_images === 'string' ? JSON.parse(rows[0].ad_images) : rows[0].ad_images;
    }
    return rows[0] || null;
  },

  async findByBuyerId(buyerId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT o.*, a.title as ad_title, a.images as ad_images,
              seller.name as seller_name, seller.avatar_url as seller_avatar
       FROM orders o
       JOIN ads a ON o.ad_id = a.id
       JOIN users seller ON o.seller_id = seller.id
       WHERE o.buyer_id = ?
       ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [buyerId, limit.toString(), offset.toString()]
    );
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM orders WHERE buyer_id = ?',
      [buyerId]
    );
    return { orders: rows, total: countResult[0].total, page, limit };
  },

  async findBySellerId(sellerId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT o.*, a.title as ad_title, a.images as ad_images,
              buyer.name as buyer_name, buyer.avatar_url as buyer_avatar
       FROM orders o
       JOIN ads a ON o.ad_id = a.id
       JOIN users buyer ON o.buyer_id = buyer.id
       WHERE o.seller_id = ?
       ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [sellerId, limit.toString(), offset.toString()]
    );
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM orders WHERE seller_id = ?',
      [sellerId]
    );
    return { orders: rows, total: countResult[0].total, page, limit };
  },

  async updateStatus(id, status) {
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },

  async confirmBuyer(id) {
    await pool.execute('UPDATE orders SET buyer_confirmed = true WHERE id = ?', [id]);
    return this.findById(id);
  },

  async confirmSeller(id) {
    await pool.execute('UPDATE orders SET seller_confirmed = true WHERE id = ?', [id]);
    return this.findById(id);
  },
};

module.exports = OrderModel;
