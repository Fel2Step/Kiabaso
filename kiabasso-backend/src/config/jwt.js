module.exports = {
  secret: process.env.JWT_SECRET || 'default_secret_change_me',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_change_me',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
