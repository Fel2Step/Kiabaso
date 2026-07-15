const pool = require('../config/database');
const WalletModel = require('../models/Wallet');
const TransactionModel = require('../models/Transaction');
const OrderModel = require('../models/Order');
const UserModel = require('../models/User');

const PAYMENT_FEE_PERCENT = 0.02;

const PaymentService = {
  async processPurchase({ buyerId, sellerId, adId, amount }) {
    const buyerWallet = await WalletModel.findByUserId(buyerId);
    if (!buyerWallet) throw new Error('Bolsa do comprador não encontrada');
    if (buyerWallet.available_balance < amount) throw new Error('Saldo insuficiente');

    const feeAmount = Math.round(amount * PAYMENT_FEE_PERCENT * 100) / 100;
    const totalBlock = amount;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        'UPDATE wallets SET available_balance = available_balance - ?, blocked_balance = blocked_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND available_balance >= ?',
        [totalBlock, totalBlock, buyerId, totalBlock]
      );

      const order = await OrderModel.create({
        adId,
        buyerId,
        sellerId,
        amount,
        feeAmount,
      });

      await connection.execute(
        `INSERT INTO transactions (id, wallet_id, type, amount, description, reference)
         VALUES (?, ?, 'payment', ?, ?, ?)`,
        [require('uuid').v4(), buyerWallet.id, -amount, `Bloqueio para compra #${order.tracking_code}`, `PAY-${order.id.slice(0, 8).toUpperCase()}`]
      );

      await connection.commit();
      return order;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async confirmDelivery(orderId, userId) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Pedido não encontrado');
    if (order.buyer_id !== userId) throw new Error('Apenas o comprador pode confirmar a entrega');
    if (order.status !== 'accepted' && order.status !== 'in_transit') {
      throw new Error('Pedido não pode ser confirmado');
    }

    await OrderModel.confirmBuyer(orderId);
    const updatedOrder = await OrderModel.findById(orderId);

    if (updatedOrder.buyer_confirmed && updatedOrder.seller_confirmed) {
      await this.releasePayment(orderId);
    }

    return updatedOrder;
  },

  async confirmSellerDelivery(orderId, userId) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Pedido não encontrado');
    if (order.seller_id !== userId) throw new Error('Apenas o vendedor pode confirmar a entrega');

    await OrderModel.confirmSeller(orderId);
    const updatedOrder = await OrderModel.findById(orderId);

    if (updatedOrder.buyer_confirmed && updatedOrder.seller_confirmed) {
      await this.releasePayment(orderId);
    }

    return updatedOrder;
  },

  async releasePayment(orderId) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Pedido não encontrado');

    const sellerWallet = await WalletModel.findByUserId(order.seller_id);
    if (!sellerWallet) throw new Error('Bolsa do vendedor não encontrada');

    const buyerWallet = await WalletModel.findByUserId(order.buyer_id);
    const netAmount = order.amount - order.fee_amount;

    await WalletModel.deductBlockedBalance(order.buyer_id, order.amount);

    await WalletModel.releaseToSeller(order.seller_id, order.amount, order.fee_amount);

    await OrderModel.updateStatus(orderId, 'completed');

    await TransactionModel.create({
      walletId: sellerWallet.id,
      type: 'release',
      amount: netAmount,
      feeAmount: order.fee_amount,
      description: `Venda #${order.tracking_code} concluída (taxa: ${order.fee_amount} Kz)`,
      reference: `REL-${order.id.slice(0, 8).toUpperCase()}`,
    });

    await TransactionModel.create({
      walletId: buyerWallet.id,
      type: 'fee',
      amount: -(order.amount + order.fee_amount),
      description: `Compra #${order.tracking_code} concluída`,
      reference: `CMP-${order.id.slice(0, 8).toUpperCase()}`,
    });

    await UserModel.incrementSales(order.seller_id);

    return order;
  },

  async cancelOrder(orderId, userId) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Pedido não encontrado');

    if (order.status === 'completed') throw new Error('Pedido já concluído');
    if (order.status === 'cancelled') throw new Error('Pedido já cancelado');

    if (order.status === 'in_transit') throw new Error('Pedido em transporte requer abertura de disputa');

    if (order.buyer_id !== userId && order.seller_id !== userId) {
      throw new Error('Não autorizado');
    }

    if (order.status === 'accepted' && order.buyer_id !== userId) {
      throw new Error('Apenas o comprador pode cancelar após aceitação');
    }

    await OrderModel.updateStatus(orderId, 'cancelled');

    await WalletModel.unblockBalance(order.buyer_id, order.amount);

    const buyerWallet = await WalletModel.findByUserId(order.buyer_id);
    await TransactionModel.create({
      walletId: buyerWallet.id,
      type: 'refund',
      amount: order.amount,
      description: `Reembolso por cancelamento #${order.tracking_code}`,
      reference: `REF-${order.id.slice(0, 8).toUpperCase()}`,
    });

    return order;
  },

  getFeePercent() {
    return PAYMENT_FEE_PERCENT;
  },
};

module.exports = PaymentService;
