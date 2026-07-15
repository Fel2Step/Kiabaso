const DisputeModel = require('../models/Dispute');
const OrderModel = require('../models/Order');
const WalletModel = require('../models/Wallet');

const DisputeService = {
  async open({ orderId, userId, reason, description, evidence = null }) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Pedido não encontrado');

    if (order.buyer_id !== userId && order.seller_id !== userId) {
      throw new Error('Não autorizado');
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new Error('Pedido já finalizado');
    }

    const existingDisputes = await DisputeModel.findByOrderId(orderId);
    const openDispute = existingDisputes.find(d => d.status === 'open');
    if (openDispute) throw new Error('Já existe uma disputa aberta para este pedido');

    const dispute = await DisputeModel.create({ orderId, openedBy: userId, reason, description, evidence });

    await OrderModel.updateStatus(orderId, 'disputed');

    return dispute;
  },

  async resolve(disputeId, { resolution, resolvedBy, status }) {
    const dispute = await DisputeModel.findById(disputeId);
    if (!dispute) throw new Error('Disputa não encontrada');

    const result = await DisputeModel.resolve(disputeId, { resolution, resolvedBy, status });

    const order = await OrderModel.findById(dispute.order_id);
    if (order) {
      if (status === 'resolved_buyer') {
        await WalletModel.unblockBalance(order.buyer_id, order.amount);
        await OrderModel.updateStatus(order.id, 'cancelled');
      } else if (status === 'resolved_seller') {
        const sellerWallet = await WalletModel.findByUserId(order.seller_id);
        await WalletModel.deductBlockedBalance(order.buyer_id, order.amount);
        await WalletModel.releaseToSeller(order.seller_id, order.amount, 0);
        await OrderModel.updateStatus(order.id, 'completed');
      }
    }

    return result;
  },

  async getAll(page, limit, status) {
    return DisputeModel.getAll({ page, limit, status });
  },
};

module.exports = DisputeService;
