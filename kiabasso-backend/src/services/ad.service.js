const AdModel = require('../models/Ad');
const UserModel = require('../models/User');

const AdService = {
  async create(data, userId) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Utilizador não encontrado');
    if (user.total_ads >= 50) throw new Error('Máximo de 50 anúncios activos atingido');

    const ad = await AdModel.create({ ...data, userId });

    await UserModel.incrementAds(userId);

    return ad;
  },

  async update(adId, data, userId) {
    const ad = await AdModel.findById(adId);
    if (!ad) throw new Error('Anúncio não encontrado');
    if (ad.user_id !== userId) throw new Error('Não autorizado');
    if (ad.status !== 'active') throw new Error('Apenas anúncios activos podem ser editados');

    return AdModel.update(adId, data);
  },

  async delete(adId, userId) {
    const ad = await AdModel.findById(adId);
    if (!ad) throw new Error('Anúncio não encontrado');
    if (ad.user_id !== userId) throw new Error('Não autorizado');

    await AdModel.softDelete(adId);
  },

  async getFeed({ page, limit, category, location, minPrice, maxPrice, condition, query }) {
    return AdModel.getFeed({ page, limit, category, location, minPrice, maxPrice, condition, query });
  },

  async search(params) {
    return AdModel.search(params);
  },

  async getById(adId) {
    const ad = await AdModel.findById(adId);
    if (!ad) throw new Error('Anúncio não encontrado');

    await AdModel.incrementViews(adId);
    return ad;
  },

  async getUserAds(userId, params) {
    return AdModel.findByUserId(userId, params);
  },
};

module.exports = AdService;
