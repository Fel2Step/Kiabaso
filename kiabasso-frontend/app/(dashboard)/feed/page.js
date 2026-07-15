'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/shared/Header';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { formatCurrency, formatDate, getCategoryIcon, getConditionLabel } from '../../../lib/utils';

const CATEGORIES = [
  { id: 'eletronicos', icon: '📱', name: 'Eletrónica' },
  { id: 'moda', icon: '👗', name: 'Moda' },
  { id: 'automoveis', icon: '🚗', name: 'Auto' },
  { id: 'imoveis', icon: '🏠', name: 'Imóveis' },
  { id: 'servicos', icon: '🔧', name: 'Serviços' },
  { id: 'desporto', icon: '⚽', name: 'Desporto' },
  { id: 'casa_jardim', icon: '🏡', name: 'Casa' },
  { id: 'livros', icon: '📚', name: 'Livros' },
];

export default function FeedPage() {
  const { user, wallet, refreshProfile } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => { refreshProfile(); }, []);

  useEffect(() => {
    loadAds();
  }, [page, selectedCategory]);

  async function loadAds() {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (selectedCategory) params.category = selectedCategory;
      const response = await api.get('/ads/feed', params);
      if (response.success) {
        const parsed = (response.data.ads || []).map(ad => ({
          ...ad,
          images: typeof ad.images === 'string' ? JSON.parse(ad.images) : (ad.images || []),
        }));
        setAds(prev => page === 1 ? parsed : [...prev, ...parsed]);
        setHasMore(parsed.length === 20);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleCategoryClick(catId) {
    setSelectedCategory(prev => prev === catId ? null : catId);
    setPage(1);
    setAds([]);
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header user={user} wallet={wallet} />

      <div className="page-container">
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => { setSelectedCategory(null); setPage(1); setAds([]); }}
            className={`chip flex-shrink-0 ${!selectedCategory ? 'chip-active' : ''}`}
          >
            Todos
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`chip flex-shrink-0 ${selectedCategory === cat.id ? 'chip-active' : ''}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {loading && ads.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-card" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ads.map(ad => (
                <Link key={ad.id} href={`/ad/${ad.id}`} className="card overflow-hidden hover:shadow-medium transition-shadow group">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {ad.images?.length > 0 ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${ad.images[0]}`}
                        alt={ad.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-50 to-gray-100">
                        {getCategoryIcon(ad.category)}
                      </div>
                    )}
                    {ad.is_featured && (
                      <span className="absolute top-2 left-2 badge bg-secondary text-white text-xs">🚀 DESTAQUE</span>
                    )}
                    {ad.condition === 'new' && (
                      <span className="absolute top-2 right-2 badge bg-green-500 text-white text-xs">✨ NOVO</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm truncate">{ad.title}</h3>
                    <p className="text-primary font-bold text-lg mt-1">{formatCurrency(ad.price)}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>📍 {ad.location?.split(',')[0]}</span>
                      <span>{formatDate(ad.created_at)}</span>
                    </div>
                    {ad.user_rating && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-yellow-500">
                        ⭐ {ad.user_rating}
                        <span className="text-gray-400">• {ad.user_name?.split(' ')[0]}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className="btn-outline"
                >
                  {loading ? 'A carregar...' : 'Carregar mais anúncios...'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
