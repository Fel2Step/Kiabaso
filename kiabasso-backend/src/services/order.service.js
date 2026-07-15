const OrderModel = require('../models/Order');

const OrderService = {
  async getBuyerOrders(userId, page, limit) {
    return OrderModel.findByBuyerId(userId, { page, limit });
  },

  async getSellerOrders(userId, page, limit) {
    return OrderModel.findBySellerId(userId, { page, limit });
  },

  async getOrder(orderId) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Pedido não encontrado');
    return order;
  },

  async acceptOrder(orderId, userId) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Pedido não encontrado');
    if (order.seller_id !== userId) throw new Error('Não autorizado');
    if (order.status !== 'pending') throw new Error('Pedido não está pendente');

    return OrderModel.updateStatus(orderId, 'accepted');
  },

  async markInTransit(orderId, userId) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Pedido não encontrado');
    if (order.seller_id !== userId) throw new Error('Não autorizado');
    if (order.status !== 'accepted') throw new Error('Pedido precisa ser aceite primeiro');

    return OrderModel.updateStatus(orderId, 'in_transit');
  },
};

module.exports = OrderService;
