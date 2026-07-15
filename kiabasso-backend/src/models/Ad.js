const pool = require('../config/database');
const { generateUUID } = require('../utils/helpers');

const AdModel = {
  async create(data) {
    const id = generateUUID();
    const expiresAt = data.promotion_level && data.promotion_level !== 'free'
      ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const sql = `INSERT INTO ads (id, title, description, price, category, subcategory,
                 location, \`condition\`, user_id, status, promotion_level, images, expires_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`;
    await pool.execute(sql, [
      id, data.title, data.description, data.price,
      data.category, data.subcategory || null, data.location,
      data.condition || 'new', data.userId, data.promotion_level || 'free',
      JSON.stringify(data.images || []), expiresAt,
    ]);
    return this.findById(id);
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.name as user_name, u.avatar_url as user_avatar, u.rating as user_rating,
              u.phone as user_phone, u.location as user_location
       FROM ads a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [id]
    );
    if (rows[0]) {
      rows[0].images = typeof rows[0].images === 'string' ? JSON.parse(rows[0].images) : rows[0].images;
    }
    return rows[0] || null;
  },

  async findByUserId(userId, { page = 1, limit = 20, status = null } = {}) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM ads WHERE user_id = ?';
    const params = [userId];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit.toString(), offset.toString());

    const [rows] = await pool.execute(sql, params);
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM ads WHERE user_id = ?' + (status ? ' AND status = ?' : ''),
      status ? [userId, status] : [userId]
    );

    return { ads: rows, total: countResult[0].total, page, limit };
  },

  async search({ query, category, location, minPrice, maxPrice, condition, sort = 'recent', page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT a.*, u.name as user_name, u.avatar_url as user_avatar, u.rating as user_rating FROM ads a LEFT JOIN users u ON a.user_id = u.id WHERE a.status = "active"';
    const params = [];
    const countParams = [];

    if (query) {
      sql += ' AND (a.title LIKE ? OR a.description LIKE ?)';
      params.push(`%${query}%`, `%${query}%`);
      countParams.push(`%${query}%`, `%${query}%`);
    }
    if (category) {
      sql += ' AND a.category = ?';
      params.push(category);
      countParams.push(category);
    }
    if (location) {
      sql += ' AND a.location LIKE ?';
      params.push(`%${location}%`);
      countParams.push(`%${location}%`);
    }
    if (minPrice) {
      sql += ' AND a.price >= ?';
      params.push(minPrice);
      countParams.push(minPrice);
    }
    if (maxPrice) {
      sql += ' AND a.price <= ?';
      params.push(maxPrice);
      countParams.push(maxPrice);
    }
    if (condition) {
      sql += ' AND a.`condition` = ?';
      params.push(condition);
      countParams.push(condition);
    }

    const sortMap = {
      recent: 'a.created_at DESC',
      price_asc: 'a.price ASC',
      price_desc: 'a.price DESC',
    };
    sql += ' ORDER BY a.is_featured DESC, ' + (sortMap[sort] || 'a.created_at DESC');
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit.toString(), offset.toString());

    const [rows] = await pool.execute(sql, params);
    const countSql = 'SELECT COUNT(*) as total FROM ads a WHERE a.status = "active"' +
      (query ? ' AND (a.title LIKE ? OR a.description LIKE ?)' : '') +
      (category ? ' AND a.category = ?' : '') +
      (location ? ' AND a.location LIKE ?' : '') +
      (minPrice ? ' AND a.price >= ?' : '') +
      (maxPrice ? ' AND a.price <= ?' : '') +
      (condition ? ' AND a.`condition` = ?' : '');

    const [countResult] = await pool.execute(countSql, countParams.length > 0 ? countParams : []);

    return { ads: rows, total: countResult[0].total, page, limit };
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key !== 'userId') {
        const dbKey = key === 'condition' ? '`condition`' : key;
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await pool.execute(`UPDATE ads SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async softDelete(id) {
    await pool.execute('UPDATE ads SET status = "inactive" WHERE id = ?', [id]);
  },

  async incrementViews(id) {
    await pool.execute('UPDATE ads SET views = views + 1 WHERE id = ?', [id]);
  },

  async incrementFavorites(id) {
    await pool.execute('UPDATE ads SET favorites = favorites + 1 WHERE id = ?', [id]);
  },

  async decrementFavorites(id) {
    await pool.execute('UPDATE ads SET favorites = GREATEST(0, favorites - 1) WHERE id = ?', [id]);
  },

  async getCategories() {
    const [rows] = await pool.execute(
      'SELECT DISTINCT category FROM ads WHERE status = "active" ORDER BY category'
    );
    return rows.map(r => r.category);
  },

  async getFeed({ page = 1, limit = 20, category, location, minPrice, maxPrice, condition, query }) {
    const offset = (page - 1) * limit;
    let sql = `SELECT a.*, u.name as user_name, u.avatar_url as user_avatar, u.rating as user_rating
               FROM ads a LEFT JOIN users u ON a.user_id = u.id WHERE a.status = "active"`;
    const params = [];

    if (query) {
      sql += ' AND (a.title LIKE ? OR a.description LIKE ?)';
      params.push(`%${query}%`, `%${query}%`);
    }
    if (category) {
      sql += ' AND a.category = ?';
      params.push(category);
    }
    if (location) {
      sql += ' AND a.location LIKE ?';
      params.push(`%${location}%`);
    }
    if (minPrice) {
      sql += ' AND a.price >= ?';
      params.push(minPrice);
    }
    if (maxPrice) {
      sql += ' AND a.price <= ?';
      params.push(maxPrice);
    }
    if (condition) {
      sql += ' AND a.`condition` = ?';
      params.push(condition);
    }

    sql += ' ORDER BY a.is_featured DESC, a.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit.toString(), offset.toString());

    const [rows] = await pool.execute(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM ads WHERE status = "active"';
    const countParams = [];
    if (query) { countSql += ' AND (title LIKE ? OR description LIKE ?)'; countParams.push(`%${query}%`, `%${query}%`); }
    if (category) { countSql += ' AND category = ?'; countParams.push(category); }
    if (location) { countSql += ' AND location LIKE ?'; countParams.push(`%${location}%`); }
    if (minPrice) { countSql += ' AND price >= ?'; countParams.push(minPrice); }
    if (maxPrice) { countSql += ' AND price <= ?'; countParams.push(maxPrice); }
    if (condition) { countSql += ' AND `condition` = ?'; countParams.push(condition); }

    const [countResult] = await pool.execute(countSql, countParams);
    return { ads: rows, total: countResult[0].total, page, limit };
  },
};

module.exports = AdModel;
