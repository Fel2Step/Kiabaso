const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }
  return transporter;
}

const NotificationService = {
  async sendEmail(to, subject, body) {
    console.log(`[EMAIL] Para: ${to} | Assunto: ${subject}`);

    const t = getTransporter();
    if (t) {
      try {
        await t.sendMail({
          from: `"Kiabasso" <${process.env.SMTP_USER || 'noreply@kiabasso.com'}>`,
          to,
          subject,
          text: body,
          html: body.replace(/\n/g, '<br>'),
        });
        console.log(`[EMAIL] Enviado com sucesso para ${to}`);
      } catch (error) {
        console.error(`[EMAIL] Erro ao enviar para ${to}:`, error.message);
      }
    }

    return true;
  },

  async sendSMS(to, message) {
    console.log(`[SMS] Para: ${to} | Mensagem: ${message}`);

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to,
        });
        console.log(`[SMS] Enviado com sucesso para ${to}`);
      } catch (error) {
        console.error(`[SMS] Erro ao enviar para ${to}:`, error.message);
      }
    }

    return true;
  },

  async notifyNewMessage(userId, data) {
    console.log(`[NOTIFICATION] Nova mensagem para ${userId}:`, data);

    const UserModel = require('../models/User');
    const user = await UserModel.findById(userId);
    if (user && user.email) {
      await this.sendEmail(
        user.email,
        'Nova mensagem - Kiabasso',
        `Você recebeu uma nova mensagem no Kiabasso.\n\n${data.content || ''}\n\nAcesse o chat para responder.`
      );
    }

    return true;
  },

  async notifyOrderUpdate(userId, orderId, status) {
    console.log(`[NOTIFICATION] Pedido #${orderId} actualizado para ${status} para utilizador ${userId}`);

    const UserModel = require('../models/User');
    const user = await UserModel.findById(userId);
    if (user && user.email) {
      const statusLabels = {
        pending: 'Pendente',
        accepted: 'Aceite',
        in_transit: 'Em Transporte',
        delivered: 'Entregue',
        completed: 'Concluído',
        cancelled: 'Cancelado',
        disputed: 'Em Disputa',
      };

      await this.sendEmail(
        user.email,
        `Pedido #${orderId} - ${statusLabels[status] || status}`,
        `O seu pedido #${orderId} foi actualizado para: ${statusLabels[status] || status}\n\nAcesse a plataforma para mais detalhes.`
      );
    }

    return true;
  },
};

module.exports = NotificationService;
