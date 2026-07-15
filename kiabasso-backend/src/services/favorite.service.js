const FavoriteModel = require('../models/Favorite');
const AdModel = require('../models/Ad');

const FavoriteService = {
  async toggle(userId, adId) {
    const ad = await AdModel.findById(adId);
    if (!ad) throw new Error('Anúncio não encontrado');

    const isFavorited = await FavoriteModel.isFavorited(userId, adId);
    if (isFavorited) {
      await FavoriteModel.remove(userId, adId);
      await AdModel.decrementFavorites(adId);
      return { favorited: false };
    } else {
      await FavoriteModel.add(userId, adId);
      await AdModel.incrementFavorites(adId);
      return { favorited: true };
    }
  },

  async list(userId, page, limit) {
    return FavoriteModel.findByUser(userId, { page, limit });
  },

  async check(userId, adId) {
    return FavoriteModel.isFavorited(userId, adId);
  },
};

module.exports = FavoriteService;
