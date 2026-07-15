const ReviewModel = require('../models/Review');
const OrderModel = require('../models/Order');

const ReviewService = {
  async create({ orderId, reviewerId, rating, comment }) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Pedido não encontrado');
    if (order.status !== 'completed') throw new Error('Só pode avaliar pedidos concluídos');
    if (order.buyer_id !== reviewerId && order.seller_id !== reviewerId) {
      throw new Error('Não autorizado a avaliar este pedido');
    }

    const existing = await ReviewModel.findByOrderId(orderId);
    if (existing.some(r => r.reviewer_id === reviewerId)) {
      throw new Error('Já avaliou este pedido');
    }

    const reviewedId = order.buyer_id === reviewerId ? order.seller_id : order.buyer_id;

    const review = await ReviewModel.create({ orderId, reviewerId, reviewedId, rating, comment });

    const UserModel = require('../models/User');
    await UserModel.updateRating(reviewedId);

    return review;
  },

  async getByUser(userId, page, limit) {
    return ReviewModel.findByReviewedId(userId, { page, limit });
  },

  async getStats(userId) {
    return ReviewModel.getAverageRating(userId);
  },
};

module.exports = ReviewService;
