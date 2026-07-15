const pool = require('../config/database');
const { generateUUID } = require('../utils/helpers');

const TransactionModel = {
  async create({ walletId, type, amount, feeAmount = 0, description = '', reference = null, metadata = null }) {
    const id = generateUUID();
    const ref = reference || `TXN-${id.slice(0, 8).toUpperCase()}`;
    await pool.execute(
      `INSERT INTO transactions (id, wallet_id, type, amount, fee_amount, description, reference, status, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?)`,
      [id, walletId, type, amount, feeAmount, description, ref, metadata ? JSON.stringify(metadata) : null]
    );
    return { id, reference: ref, type, amount, feeAmount, status: 'completed' };
  },

  async findByWalletId(walletId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      'SELECT * FROM transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [walletId, limit.toString(), offset.toString()]
    );
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM transactions WHERE wallet_id = ?',
      [walletId]
    );
    return { transactions: rows, total: countResult[0].total, page, limit };
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM transactions WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async getHistory(userId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT t.* FROM transactions t
       JOIN wallets w ON t.wallet_id = w.id
       WHERE w.user_id = ?
       ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [userId, limit.toString(), offset.toString()]
    );
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM transactions t
       JOIN wallets w ON t.wallet_id = w.id
       WHERE w.user_id = ?`,
      [userId]
    );
    return { transactions: rows, total: countResult[0].total, page, limit };
  },
};

module.exports = TransactionModel;
