const PromotionService = require('../services/promotion.service');
const { buildResponse } = require('../utils/helpers');

const PromotionsController = {
  async purchase(req, res) {
    try {
      const { ad_id, plan } = req.body;
      const promotion = await PromotionService.purchase(ad_id, plan, req.user.id);
      res.status(201).json(buildResponse(true, promotion, 'Promoção activada com sucesso'));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async getPlans(req, res) {
    try {
      const plans = PromotionService.getPlans();
      res.json(buildResponse(true, plans));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao carregar planos'));
    }
  },

  async getMyPromotions(req, res) {
    try {
      const promotions = await PromotionService.getUserPromotions(req.user.id);
      res.json(buildResponse(true, promotions));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao carregar promoções'));
    }
  },
};

module.exports = PromotionsController;
