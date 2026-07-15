const pool = require('../config/database');
const { generateUUID } = require('../utils/helpers');

const UserModel = {
  async create({ name, email, passwordHash, phone = null }) {
    const id = generateUUID();
    const sql = `INSERT INTO users (id, name, email, password_hash, phone, verified, status)
                 VALUES (?, ?, ?, ?, ?, ?, 'active')`;
    await pool.execute(sql, [id, name, email, passwordHash, phone, false]);
    return this.findById(id);
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, avatar_url, verified, verification_method,
              rating, total_sales, total_ads, location, bio, status, created_at, last_login
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.findById(id);
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async updateRating(userId) {
    await pool.execute(
      `UPDATE users SET rating = (
        SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviewed_id = ?
      ) WHERE id = ?`,
      [userId, userId]
    );
  },

  async incrementSales(userId) {
    await pool.execute(
      'UPDATE users SET total_sales = total_sales + 1 WHERE id = ?',
      [userId]
    );
  },

  async incrementAds(userId) {
    await pool.execute(
      'UPDATE users SET total_ads = total_ads + 1 WHERE id = ?',
      [userId]
    );
  },
};

module.exports = UserModel;
