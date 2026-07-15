const pool = require('../config/database');
const NotificationService = require('../services/notification.service');

const EmailJob = {
  async processPending() {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM email_queue WHERE status = 'pending' AND attempts < 3 ORDER BY created_at ASC LIMIT 10"
      );

      for (const email of rows) {
        try {
          await NotificationService.sendEmail(email.recipient, email.subject, email.body);
          await pool.execute(
            "UPDATE email_queue SET status = 'sent', sent_at = NOW() WHERE id = ?",
            [email.id]
          );
        } catch (error) {
          await pool.execute(
            'UPDATE email_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?',
            [error.message, email.id]
          );
        }
      }
    } catch (error) {
      console.error('[EmailJob] Erro:', error.message);
    }
  },
};

module.exports = EmailJob;
