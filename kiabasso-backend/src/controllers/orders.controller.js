const PaymentService = require('../services/payment.service');
const OrderService = require('../services/order.service');
const WalletModel = require('../models/Wallet');
const AdModel = require('../models/Ad');
const { buildResponse, paginate } = require('../utils/helpers');

const OrdersController = {
  async purchase(req, res) {
    try {
      const { ad_id } = req.body;
      const ad = await AdModel.findById(ad_id);
      if (!ad) return res.status(404).json(buildResponse(false, null, 'Anúncio não encontrado'));
      if (ad.user_id === req.user.id) {
        return res.status(400).json(buildResponse(false, null, 'Não pode comprar o seu próprio anúncio'));
      }
      if (ad.status !== 'active') {
        return res.status(400).json(buildResponse(false, null, 'Anúncio não está activo'));
      }

      const order = await PaymentService.processPurchase({
        buyerId: req.user.id,
        sellerId: ad.user_id,
        adId: ad_id,
        amount: parseFloat(ad.price),
      });

      const wallet = await WalletModel.getBalance(req.user.id);

      res.status(201).json(buildResponse(true, {
        ...order,
        amount: parseFloat(order.amount),
        fee_amount: parseFloat(order.fee_amount),
        total: parseFloat(order.amount) + parseFloat(order.fee_amount),
        balance_after: parseFloat(wallet.available_balance),
      }, 'Compra iniciada com sucesso'));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async confirmDelivery(req, res) {
    try {
      const order = await PaymentService.confirmDelivery(req.params.id, req.user.id);
      res.json(buildResponse(true, order, 'Entrega confirmada'));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async confirmSellerDelivery(req, res) {
    try {
      const order = await PaymentService.confirmSellerDelivery(req.params.id, req.user.id);
      res.json(buildResponse(true, order, 'Entrega confirmada pelo vendedor'));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async cancel(req, res) {
    try {
      const order = await PaymentService.cancelOrder(req.params.id, req.user.id);
      res.json(buildResponse(true, order, 'Pedido cancelado'));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async getBuyerOrders(req, res) {
    try {
      const { page, limit } = paginate(req.query.page, req.query.limit);
      const result = await OrderService.getBuyerOrders(req.user.id, page, limit);
      res.json(buildResponse(true, result));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao carregar pedidos'));
    }
  },

  async getSellerOrders(req, res) {
    try {
      const { page, limit } = paginate(req.query.page, req.query.limit);
      const result = await OrderService.getSellerOrders(req.user.id, page, limit);
      res.json(buildResponse(true, result));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao carregar vendas'));
    }
  },

  async getById(req, res) {
    try {
      const order = await OrderService.getOrder(req.params.id);
      if (!order) return res.status(404).json(buildResponse(false, null, 'Pedido não encontrado'));
      if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id) {
        return res.status(403).json(buildResponse(false, null, 'Não autorizado'));
      }
      res.json(buildResponse(true, order));
    } catch (error) {
      res.status(404).json(buildResponse(false, null, error.message));
    }
  },

  async accept(req, res) {
    try {
      const order = await OrderService.acceptOrder(req.params.id, req.user.id);
      res.json(buildResponse(true, order, 'Pedido aceite'));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async markInTransit(req, res) {
    try {
      const order = await OrderService.markInTransit(req.params.id, req.user.id);
      res.json(buildResponse(true, order, 'Pedido marcado como em transporte'));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },
};

module.exports = OrdersController;
