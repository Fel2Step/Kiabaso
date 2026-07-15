const FavoriteService = require('../services/favorite.service');
const { buildResponse, paginate } = require('../utils/helpers');

const FavoritesController = {
  async toggle(req, res) {
    try {
      const { ad_id } = req.body;
      const result = await FavoriteService.toggle(req.user.id, ad_id);
      res.json(buildResponse(true, result, result.favorited ? 'Adicionado aos favoritos' : 'Removido dos favoritos'));
    } catch (error) {
      res.status(400).json(buildResponse(false, null, error.message));
    }
  },

  async list(req, res) {
    try {
      const { page, limit } = paginate(req.query.page, req.query.limit);
      const favorites = await FavoriteService.list(req.user.id, page, limit);
      res.json(buildResponse(true, { favorites }));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao carregar favoritos'));
    }
  },

  async check(req, res) {
    try {
      const { ad_id } = req.query;
      const favorited = await FavoriteService.check(req.user.id, ad_id);
      res.json(buildResponse(true, { favorited }));
    } catch (error) {
      res.status(500).json(buildResponse(false, null, 'Erro ao verificar favorito'));
    }
  },
};

module.exports = FavoritesController;
