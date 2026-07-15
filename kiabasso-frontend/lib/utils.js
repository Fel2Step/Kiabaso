import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value, currency = 'AOA') {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;

  return date.toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function getCategoryIcon(category) {
  const icons = {
    eletronicos: '📱',
    moda: '👗',
    automoveis: '🚗',
    imoveis: '🏠',
    servicos: '🔧',
    desporto: '⚽',
    casa_jardim: '🏡',
    livros: '📚',
    musica_filmes: '🎵',
  };
  return icons[category] || '📦';
}

export function getConditionLabel(condition) {
  const labels = {
    new: 'Novo',
    used: 'Usado',
    refurbished: 'Recondicionado',
  };
  return labels[condition] || condition;
}

export function getStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    disputed: 'bg-orange-100 text-orange-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status) {
  const labels = {
    pending: 'Pendente',
    accepted: 'Aceite',
    in_transit: 'Em Transporte',
    delivered: 'Entregue',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    disputed: 'Disputa',
    active: 'Activo',
    inactive: 'Inactivo',
  };
  return labels[status] || status;
}
