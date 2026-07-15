const AdService = require('../services/ad.service');
const AdModel = require('../models/Ad');
const { buildResponse, paginate } = require('../utils/helpers');

const AdsController = {
  async create(req, res) {
    try {
      const data = {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        subcategory: req.body.subcategory,
        location: req.body.location,
        condition: req.body.condition,
        promotion_level: req.body.promotion_level || 'free',
        images: req.body.images || [],
      };

      const ad = await AdService.create(data, req.user.id);
      res.status(201).json(buildResponse(true, ad, 'Anúncio criado com sucesso'));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async getFeed(req, res) {
    try {
      const { page, limit } = paginate(req.query.page, req.query.limit);
      const result = await AdService.getFeed({
        page,
        limit,
        category: req.query.category,
        location: req.query.location,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        condition: req.query.condition,
        query: req.query.q,
      });
      res.json(buildResponse(true, result));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao carregar feed'));
    }
  },

  async search(req, res) {
    try {
      const { page, limit } = paginate(req.query.page, req.query.limit);
      const params = {
        query: req.query.q,
        category: req.query.category,
        location: req.query.location,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        condition: req.query.condition,
        sort: req.query.sort,
        page,
        limit,
      };
      const result = await AdService.search(params);
      res.json(buildResponse(true, result));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro na pesquisa'));
    }
  },

  async getById(req, res) {
    try {
      const ad = await AdService.getById(req.params.id);
      res.json(buildResponse(true, ad));
    } catch (error) {
      res.status(404).json(buildResponse(false, null, error.message));
    }
  },

  async update(req, res) {
    try {
      const ad = await AdService.update(req.params.id, req.body, req.user.id);
      res.json(buildResponse(true, ad, 'Anúncio actualizado'));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async delete(req, res) {
    try {
      await AdService.delete(req.params.id, req.user.id);
      res.json(buildResponse(true, null, 'Anúncio removido'));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async getMyAds(req, res) {
    try {
      const { page, limit } = paginate(req.query.page, req.query.limit);
      const result = await AdService.getUserAds(req.user.id, {
        page,
        limit,
        status: req.query.status,
      });
      res.json(buildResponse(true, result));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao carregar anúncios'));
    }
  },

  async getCategories(req, res) {
    try {
      const categories = await AdModel.getCategories();
      res.json(buildResponse(true, categories));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao carregar categorias'));
    }
  },
};

module.exports = AdsController;
