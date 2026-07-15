const ReviewService = require('../services/review.service');
const { buildResponse, paginate } = require('../utils/helpers');

const ReviewsController = {
  async create(req, res) {
    try {
      const { orderId, rating, comment } = req.body;
      const review = await ReviewService.create({
        orderId,
        reviewerId: req.user.id,
        rating,
        comment,
      });
      res.status(201).json(buildResponse(true, review, 'Avaliação registada'));
    } catch (error) {
      const msg = error.message;
      const badRequestErrors = ['não encontrado', 'não concluídos', 'já avaliou'];
      const status = badRequestErrors.some(e => msg.includes(e)) ? 400 : 403;
      res.status(status).json(buildResponse(false, null, msg));
    }
  },

  async getByUser(req, res) {
    try {
      const { page, limit } = paginate(req.query.page, req.query.limit);
      const reviews = await ReviewService.getByUser(req.params.id, page, limit);
      const stats = await ReviewService.getStats(req.params.id);
      res.json(buildResponse(true, { reviews, stats }));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao carregar avaliações'));
    }
  },
};

module.exports = ReviewsController;
