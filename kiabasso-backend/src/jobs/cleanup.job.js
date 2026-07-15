const pool = require('../config/database');
const PaymentService = require('../services/payment.service');

const CleanupJob = {
  async run() {
    try {
      const [expiredTokens] = await pool.execute(
        'DELETE FROM password_resets WHERE expires_at < NOW() OR used = true'
      );
      if (expiredTokens.affectedRows > 0) {
        console.log(`[Cleanup] ${expiredTokens.affectedRows} tokens expirados removidos`);
      }

      const [expiredAds] = await pool.execute(
        "UPDATE ads SET status = 'expired' WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at < NOW()"
      );
      if (expiredAds.affectedRows > 0) {
        console.log(`[Cleanup] ${expiredAds.affectedRows} anúncios expirados`);
      }

      const [ordersToRelease] = await pool.execute(
        "SELECT id FROM orders WHERE status = 'in_transit' AND created_at < DATE_SUB(NOW(), INTERVAL 15 DAY)"
      );
      for (const order of ordersToRelease) {
        try {
          const [orderData] = await pool.execute('SELECT buyer_id, seller_id FROM orders WHERE id = ?', [order.id]);
          await PaymentService.confirmDelivery(order.id);
          await PaymentService.confirmSellerDelivery(order.id);
          console.log(`[Cleanup] Pedido ${order.id} liberado automaticamente`);
        } catch (err) {
          console.error(`[Cleanup] Erro ao liberar pedido ${order.id}:`, err.message);
        }
      }
    } catch (error) {
      console.error('[Cleanup] Erro:', error.message);
    }
  },
};

module.exports = CleanupJob;
