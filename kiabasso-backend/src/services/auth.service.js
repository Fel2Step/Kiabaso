const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const jwtConfig = require('../config/jwt');
const UserModel = require('../models/User');
const pool = require('../config/database');
const { generateUUID } = require('../utils/helpers');
const NotificationService = require('./notification.service');

const AuthService = {
  async register({ name, email, password, phone = null }) {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('Email já registado');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ name, email, passwordHash, phone });

    const tokens = this.generateTokens(user.id);
    return { user, ...tokens };
  },

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Email ou senha incorrectos');
    }

    if (user.status !== 'active') {
      throw new Error('Conta suspensa ou banida');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Email ou senha incorrectos');
    }

    await UserModel.update(user.id, { last_login: new Date() });

    const tokens = this.generateTokens(user.id);
    const userData = { ...user };
    delete userData.password_hash;

    return { user: userData, ...tokens };
  },

  async forgotPassword(email) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return { success: true, message: 'Se o email existir, receberá instruções' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const id = generateUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.execute(
      'INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [id, user.id, token, expiresAt]
    );

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    await NotificationService.sendEmail(
      user.email,
      'Recuperação de Senha - Kiabasso',
      `Clique no link para redefinir sua senha: ${resetUrl}\n\nEste link expira em 1 hora.`
    );

    return { success: true, message: 'Se o email existir, receberá instruções' };
  },

  async resetPassword(token, newPassword) {
    const [rows] = await pool.execute(
      'SELECT * FROM password_resets WHERE token = ? AND used = false AND expires_at > NOW()',
      [token]
    );

    if (rows.length === 0) {
      throw new Error('Token inválido ou expirado');
    }

    const reset = rows[0];
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await UserModel.update(reset.user_id, { password_hash: passwordHash });
    await pool.execute('UPDATE password_resets SET used = true WHERE id = ?', [reset.id]);

    return { success: true, message: 'Senha redefinida com sucesso' };
  },

  async sendVerificationCode(userId, phone) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const id = generateUUID();
    await pool.execute(
      'INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [id, userId, `otp_${code}`, expiresAt]
    );

    await NotificationService.sendSMS(
      phone,
      `Kiabasso: Seu código de verificação é ${code}. Válido por 10 minutos.`
    );

    return { success: true };
  },

  async verifyCode(userId, code) {
    const [rows] = await pool.execute(
      'SELECT * FROM password_resets WHERE user_id = ? AND token = ? AND used = false AND expires_at > NOW()',
      [userId, `otp_${code}`]
    );

    if (rows.length === 0) throw new Error('Código inválido ou expirado');

    await pool.execute('UPDATE password_resets SET used = true WHERE id = ?', [rows[0].id]);
    await UserModel.update(userId, { verified: true, verification_method: 'sms' });

    return { success: true, message: 'Número verificado com sucesso' };
  },

  generateTokens(userId) {
    const accessToken = jwt.sign({ userId }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    const refreshToken = jwt.sign({ userId }, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  },

  async refreshTokens(refreshToken) {
    const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    const user = await UserModel.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      throw new Error('Conta suspensa ou removida');
    }
    return this.generateTokens(decoded.userId);
  },
};

module.exports = AuthService;
