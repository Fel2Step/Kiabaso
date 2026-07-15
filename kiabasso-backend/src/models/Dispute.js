const pool = require('../config/database');
const { generateUUID } = require('../utils/helpers');

const DisputeModel = {
  async create({ orderId, openedBy, reason, description, evidence = null }) {
    const id = generateUUID();
    await pool.execute(
      `INSERT INTO disputes (id, order_id, opened_by, reason, description, evidence, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')`,
      [id, orderId, openedBy, reason, description, evidence ? JSON.stringify(evidence) : null]
    );
    return this.findById(id);
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT d.*, u.name as opened_by_name, u.avatar_url as opened_by_avatar
       FROM disputes d
       LEFT JOIN users u ON d.opened_by = u.id
       WHERE d.id = ?`,
      [id]
    );
    if (rows[0]) {
      rows[0].evidence = typeof rows[0].evidence === 'string' ? JSON.parse(rows[0].evidence) : rows[0].evidence;
    }
    return rows[0] || null;
  },

  async findByOrderId(orderId) {
    const [rows] = await pool.execute('SELECT * FROM disputes WHERE order_id = ?', [orderId]);
    return rows;
  },

  async resolve(id, { resolution, resolvedBy, status }) {
    await pool.execute(
      'UPDATE disputes SET status = ?, resolution = ?, resolved_by = ? WHERE id = ?',
      [status, resolution, resolvedBy, id]
    );
    return this.findById(id);
  },

  async getAll({ page = 1, limit = 20, status = null } = {}) {
    const offset = (page - 1) * limit;
    let sql = `SELECT d.*, u.name as opened_by_name FROM disputes d LEFT JOIN users u ON d.opened_by = u.id`;
    const params = [];

    if (status) {
      sql += ' WHERE d.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit.toString(), offset.toString());

    const [rows] = await pool.execute(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM disputes';
    if (status) countSql += ' WHERE status = ?';
    const [countResult] = await pool.execute(countSql, status ? [status] : []);

    return { disputes: rows, total: countResult[0].total, page, limit };
  },
};

module.exports = DisputeModel;
