const express = require('express');
const router = express.Router();
const UserModel = require('../../models/User');
const AdModel = require('../../models/Ad');
const { authenticate, optionalAuth } = require('../middlewares/auth');
const { buildResponse, paginate } = require('../../utils/helpers');

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json(buildResponse(false, null, 'Utilizador não encontrado'));

    const { page, limit } = paginate(req.query.page, req.query.limit);
    const ads = await AdModel.findByUserId(req.params.id, { page, limit, status: 'active' });

    res.json(buildResponse(true, { profile: user, ads }));
  } catch (error) {
    res.status(500).json(buildResponse(false, null, 'Erro ao carregar perfil'));
  }
});

module.exports = router;
