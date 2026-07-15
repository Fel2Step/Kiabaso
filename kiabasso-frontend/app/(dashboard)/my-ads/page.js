'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/shared/Header';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { formatCurrency, formatDate, getCategoryIcon, getStatusColor, getStatusLabel } from '../../../lib/utils';

export default function MyAdsPage() {
  const { user, wallet, refreshProfile } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { refreshProfile(); }, []);
  useEffect(() => { loadAds(); }, [filter]);

  async function loadAds() {
    setLoading(true);
    try {
      const params = { page: 1, limit: 50 };
      if (filter) params.status = filter;
      const res = await api.get('/ads/my', params);
      if (res.success) setAds(res.data.ads || []);
    } catch (err) { console.error('[MyAds] Erro ao carregar anúncios:', err); } finally { setLoading(false); }
  }

  async function handleDelete(adId) {
    if (!confirm('Tem certeza que deseja remover este anúncio?')) return;
    try {
      await api.delete(`/ads/${adId}`);
      loadAds();
    } catch (err) { alert(err.message); }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header user={user} wallet={wallet} />
      <div className="page-container max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title">📦 Meus Anúncios</h1>
          <Link href="/create-ad" className="btn-primary text-sm">+ Novo</Link>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['', 'active', 'inactive'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`chip flex-shrink-0 ${filter === s ? 'chip-active' : ''}`}>
              {s === '' ? 'Todos' : s === 'active' ? 'Activos' : 'Inactivos'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 mb-4">Nenhum anúncio encontrado</p>
            <Link href="/create-ad" className="btn-primary">Publicar Anúncio</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {ads.map(ad => (
              <div key={ad.id} className="card p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-card flex items-center justify-center text-2xl flex-shrink-0">
                  {getCategoryIcon(ad.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm truncate">{ad.title}</h3>
                      <p className="text-primary font-bold">{formatCurrency(ad.price)}</p>
                    </div>
                    <span className={`badge ${getStatusColor(ad.status)}`}>{getStatusLabel(ad.status)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>👁️ {ad.views}</span>
                    <span>⭐ {ad.favorites}</span>
                    <span>{formatDate(ad.created_at)}</span>
                    {ad.is_featured && <span className="badge bg-secondary text-white">🚀 Destaque</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link href={`/ad/${ad.id}`} className="btn-ghost text-xs py-1">Ver</Link>
                  {ad.status === 'active' && (
                    <button onClick={() => handleDelete(ad.id)} className="btn-ghost text-xs py-1 text-red-500">Remover</button>
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
