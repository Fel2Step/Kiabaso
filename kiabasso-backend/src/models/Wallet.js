const pool = require('../config/database');
const { generateUUID } = require('../utils/helpers');

const WalletModel = {
  async create(userId) {
    const id = generateUUID();
    await pool.execute(
      'INSERT INTO wallets (id, user_id, available_balance, blocked_balance, total_balance, currency) VALUES (?, ?, 0, 0, 0, "AOA")',
      [id, userId]
    );
    return this.findByUserId(userId);
  },

  async findByUserId(userId) {
    const [rows] = await pool.execute('SELECT * FROM wallets WHERE user_id = ?', [userId]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM wallets WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async addBalance(userId, amount) {
    await pool.execute(
      'UPDATE wallets SET available_balance = available_balance + ?, total_balance = total_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [amount, amount, userId]
    );
    return this.findByUserId(userId);
  },

  async deductBalance(userId, amount) {
    await pool.execute(
      'UPDATE wallets SET available_balance = available_balance - ?, total_balance = total_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND available_balance >= ?',
      [amount, amount, userId, amount]
    );
    return this.findByUserId(userId);
  },

  async blockBalance(userId, amount) {
    await pool.execute(
      'UPDATE wallets SET available_balance = available_balance - ?, blocked_balance = blocked_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND available_balance >= ?',
      [amount, amount, userId, amount]
    );
    return this.findByUserId(userId);
  },

  async unblockBalance(userId, amount) {
    await pool.execute(
      'UPDATE wallets SET available_balance = available_balance + ?, blocked_balance = blocked_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND blocked_balance >= ?',
      [amount, amount, userId, amount]
    );
    return this.findByUserId(userId);
  },

  async releaseToSeller(sellerId, amount, fee) {
    const netAmount = amount - fee;
    await pool.execute(
      'UPDATE wallets SET available_balance = available_balance + ?, total_balance = total_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [netAmount, netAmount, sellerId]
    );
    return this.findByUserId(sellerId);
  },

  async deductBlockedBalance(userId, amount) {
    await pool.execute(
      'UPDATE wallets SET blocked_balance = blocked_balance - ?, total_balance = total_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND blocked_balance >= ?',
      [amount, amount, userId, amount]
    );
    return this.findByUserId(userId);
  },

  async getBalance(userId) {
    const [rows] = await pool.execute(
      'SELECT available_balance, blocked_balance, total_balance, currency FROM wallets WHERE user_id = ?',
      [userId]
    );
    return rows[0] || { available_balance: 0, blocked_balance: 0, total_balance: 0, currency: 'AOA' };
  },
};

module.exports = WalletModel;
