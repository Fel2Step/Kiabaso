const DisputeService = require('../services/dispute.service');
const { buildResponse, paginate } = require('../utils/helpers');

const DisputesController = {
  async open(req, res) {
    try {
      const { order_id, reason, description, evidence } = req.body;
      const dispute = await DisputeService.open({
        orderId: order_id,
        userId: req.user.id,
        reason,
        description,
        evidence,
      });
      res.status(201).json(buildResponse(true, dispute, 'Disputa aberta com sucesso'));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async resolve(req, res) {
    try {
      const { resolution, status } = req.body;
      const dispute = await DisputeService.resolve(req.params.id, {
        resolution,
        resolvedBy: req.user.id,
        status,
      });
      res.json(buildResponse(true, dispute, 'Disputa resolvida'));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async getAll(req, res) {
    try {
      const { page, limit } = paginate(req.query.page, req.query.limit);
      const result = await DisputeService.getAll(page, limit, req.query.status);
      res.json(buildResponse(true, result));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao carregar disputas'));
    }
  },
};

module.exports = DisputesController;
