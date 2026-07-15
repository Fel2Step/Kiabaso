const pool = require('../config/database');
const { generateUUID } = require('../utils/helpers');

const MessageModel = {
  async create({ adId, senderId, receiverId, content, messageType = 'text' }) {
    const id = generateUUID();
    await pool.execute(
      `INSERT INTO messages (id, ad_id, sender_id, receiver_id, content, message_type, status)
       VALUES (?, ?, ?, ?, ?, ?, 'sent')`,
      [id, adId, senderId, receiverId, content, messageType]
    );
    return this.findById(id);
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT m.*, sender.name as sender_name, sender.avatar_url as sender_avatar,
              receiver.name as receiver_name, receiver.avatar_url as receiver_avatar
       FROM messages m
       LEFT JOIN users sender ON m.sender_id = sender.id
       LEFT JOIN users receiver ON m.receiver_id = receiver.id
       WHERE m.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async getConversation(adId, userId1, userId2, { page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT m.*, sender.name as sender_name, sender.avatar_url as sender_avatar
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       WHERE m.ad_id = ? AND ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
       ORDER BY m.created_at ASC LIMIT ? OFFSET ?`,
      [adId, userId1, userId2, userId2, userId1, limit.toString(), offset.toString()]
    );
    return rows;
  },

  async getConversations(userId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT m.*, a.title as ad_title, a.images as ad_images,
              CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_user_id,
              CASE WHEN m.sender_id = ? THEN receiver.name ELSE sender.name END as other_user_name,
              CASE WHEN m.sender_id = ? THEN receiver.avatar_url ELSE sender.avatar_url END as other_user_avatar
       FROM messages m
       JOIN ads a ON m.ad_id = a.id
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE m.id = (
         SELECT m2.id FROM messages m2
         WHERE (m2.sender_id = ? OR m2.receiver_id = ?)
           AND m2.ad_id = m.ad_id
           AND LEAST(m2.sender_id, m2.receiver_id) = LEAST(m.sender_id, m.receiver_id)
           AND GREATEST(m2.sender_id, m2.receiver_id) = GREATEST(m.sender_id, m.receiver_id)
         ORDER BY m2.created_at DESC
         LIMIT 1
       )
       ORDER BY m.created_at DESC LIMIT ? OFFSET ?`,
      [userId, userId, userId, userId, userId, limit.toString(), offset.toString()]
    );
    return rows;
  },

  async markAsRead(messageId) {
    await pool.execute(
      "UPDATE messages SET status = 'read', read_at = CURRENT_TIMESTAMP WHERE id = ?",
      [messageId]
    );
  },

  async markConversationAsRead(adId, senderId, receiverId) {
    await pool.execute(
      "UPDATE messages SET status = 'read', read_at = CURRENT_TIMESTAMP WHERE ad_id = ? AND sender_id = ? AND receiver_id = ? AND status = 'sent'",
      [adId, senderId, receiverId]
    );
  },

  async getUnreadCount(userId) {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND status = 'sent'",
      [userId]
    );
    return rows[0].count;
  },
};

module.exports = MessageModel;
