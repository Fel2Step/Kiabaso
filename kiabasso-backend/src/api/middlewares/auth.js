const jwt = require('jsonwebtoken');
const jwtConfig = require('../../config/jwt');
const pool = require('../../config/database');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtConfig.secret);

    const [users] = await pool.execute(
      'SELECT id, name, email, phone, verified, status, rating, avatar_url FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Utilizador não encontrado' });
    }

    const user = users[0];
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Conta suspensa ou banida' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado' });
    }
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
}

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtConfig.secret);

    const [users] = await pool.execute(
      'SELECT id, name, email, phone, verified, status, rating, avatar_url FROM users WHERE id = ?',
      [decoded.userId]
    );

    req.user = users.length > 0 && users[0].status === 'active' ? users[0] : null;
    next();
  } catch {
    req.user = null;
    next();
  }
}

module.exports = { authenticate, optionalAuth };
