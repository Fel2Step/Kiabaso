const { v4: uuidv4 } = require('uuid');

function generateUUID() {
  return uuidv4();
}

function formatCurrency(value, currency = 'AOA') {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency,
  }).format(value);
}

function sanitizeString(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

function paginate(page = 1, limit = 20) {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (p - 1) * l;
  return { offset, limit: l, page: p };
}

function buildResponse(success, data = null, message = null, errors = null) {
  const response = { success };
  if (data) response.data = data;
  if (message) response.message = message;
  if (errors) response.errors = errors;
  return response;
}

module.exports = {
  generateUUID,
  formatCurrency,
  sanitizeString,
  paginate,
  buildResponse,
};
