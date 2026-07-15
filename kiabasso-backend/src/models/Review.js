const pool = require('../config/database');
const { generateUUID } = require('../utils/helpers');

const ReviewModel = {
  async create({ orderId, reviewerId, reviewedId, rating, comment }) {
    const id = generateUUID();
    await pool.execute(
      `INSERT INTO reviews (id, order_id, reviewer_id, reviewed_id, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, orderId, reviewerId, reviewedId, rating, comment]
    );
    return this.findById(id);
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByReviewedId(reviewedId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.reviewed_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [reviewedId, limit, offset]
    );
    return rows;
  },

  async findByOrderId(orderId) {
    const [rows] = await pool.execute(
      'SELECT * FROM reviews WHERE order_id = ?',
      [orderId]
    );
    return rows;
  },

  async getAverageRating(userId) {
    const [rows] = await pool.execute(
      'SELECT COALESCE(AVG(rating), 0) as average, COUNT(*) as total FROM reviews WHERE reviewed_id = ?',
      [userId]
    );
    return rows[0];
  },
};

module.exports = ReviewModel;
