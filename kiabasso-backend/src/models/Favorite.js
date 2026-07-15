const pool = require('../config/database');
const { generateUUID } = require('../utils/helpers');

const FavoriteModel = {
  async add(userId, adId) {
    const id = generateUUID();
    await pool.execute(
      'INSERT INTO favorites (id, user_id, ad_id) VALUES (?, ?, ?)',
      [id, userId, adId]
    );
    return { id, userId, adId };
  },

  async remove(userId, adId) {
    await pool.execute(
      'DELETE FROM favorites WHERE user_id = ? AND ad_id = ?',
      [userId, adId]
    );
  },

  async findByUser(userId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT f.*, a.title, a.price, a.images, a.status, a.created_at as ad_created,
              u.name as seller_name
       FROM favorites f
       JOIN ads a ON f.ad_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows.map(r => ({ ...r, images: r.images ? JSON.parse(r.images) : [] }));
  },

  async isFavorited(userId, adId) {
    const [rows] = await pool.execute(
      'SELECT 1 FROM favorites WHERE user_id = ? AND ad_id = ?',
      [userId, adId]
    );
    return rows.length > 0;
  },

  async countByAd(adId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as total FROM favorites WHERE ad_id = ?',
      [adId]
    );
    return rows[0].total;
  },
};

module.exports = FavoriteModel;
