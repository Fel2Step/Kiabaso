'use client';
import { useState, useEffect } from 'react';
import Header from '../../../components/shared/Header';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../../lib/utils';
import Link from 'next/link';

export default function OrdersPage() {
  const { user, wallet, refreshProfile } = useAuth();
  const [tab, setTab] = useState('buyer');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { refreshProfile(); }, []);
  useEffect(() => { loadOrders(); }, [tab]);

  async function loadOrders() {
    setLoading(true);
    try {
      const endpoint = tab === 'buyer' ? '/orders/buyer' : '/orders/seller';
      const res = await api.get(endpoint);
      if (res.success) setOrders(res.data.orders || []);
    } catch (err) { console.error('[Orders] Erro ao carregar pedidos:', err); } finally { setLoading(false); }
  }

  async function handleAccept(orderId) {
    try {
      await api.post(`/orders/${orderId}/accept`);
      loadOrders();
    } catch (err) { alert(err.message); }
  }

  async function handleCancel(orderId) {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;
    try {
      await api.post(`/orders/${orderId}/cancel`);
      loadOrders();
    } catch (err) { alert(err.message); }
  }

  async function handleConfirmDelivery(orderId) {
    try {
      if (tab === 'buyer') {
        await api.post(`/orders/${orderId}/confirm-delivery`);
      } else {
        await api.post(`/orders/${orderId}/confirm-seller`);
      }
      refreshProfile();
      loadOrders();
    } catch (err) { alert(err.message); }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header user={user} wallet={wallet} />
      <div className="page-container max-w-3xl mx-auto">
        <h1 className="section-title mb-6">📋 Pedidos</h1>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('buyer')} className={`chip ${tab === 'buyer' ? 'chip-active' : ''}`}>Compras</button>
          <button onClick={() => setTab('seller')} className={`chip ${tab === 'seller' ? 'chip-active' : ''}`}>Vendas</button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 mb-4">Nenhum pedido encontrado</p>
            <Link href="/feed" className="btn-primary">Ver anúncios</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{order.ad_title || `Pedido #${order.tracking_code}`}</p>
                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`badge ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {tab === 'buyer' ? `Vendedor: ${order.seller_name}` : `Comprador: ${order.buyer_name}`}
                    </p>
                    <p className="text-primary font-bold text-lg">{formatCurrency(order.amount)}</p>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p>Taxa: {formatCurrency(order.fee_amount)}</p>
                    <p>#{order.tracking_code}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  {order.status === 'pending' && tab === 'seller' && (
                    <button onClick={() => handleAccept(order.id)} className="btn-primary text-sm py-2">✓ Aceitar</button>
                  )}
                  {(order.status === 'pending' || (order.status === 'accepted' && tab === 'buyer')) && (
                    <button onClick={() => handleCancel(order.id)} className="btn-danger text-sm py-2">Cancelar</button>
                  )}
                  {order.status === 'in_transit' && (
                    <button onClick={() => handleConfirmDelivery(order.id)} className="btn-primary text-sm py-2">
                      ✓ Confirmar Entrega
                    </button>
                  )}
                  {order.status === 'accepted' && tab === 'seller' && (
                    <Link href={`/orders/${order.id}`} className="btn-outline text-sm py-2">Marcar como Enviado</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
