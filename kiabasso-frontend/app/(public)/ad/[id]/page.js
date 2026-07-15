'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../../components/shared/Header';
import { useAuth } from '../../../../hooks/useAuth';
import api from '../../../../lib/api';
import { formatCurrency, formatDate, getConditionLabel } from '../../../../lib/utils';

export default function AdDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, wallet, refreshProfile } = useAuth();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);

  useEffect(() => { refreshProfile(); }, []);

  useEffect(() => {
    loadAd();
    loadReviews();
  }, [id]);

  useEffect(() => {
    if (user && ad) checkFavorite();
  }, [user, ad]);

  async function loadAd() {
    try {
      const res = await api.get(`/ads/${id}`);
      if (res.success) setAd(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadReviews() {
    try {
      const ad = await api.get(`/ads/${id}`);
      if (ad.success && ad.data.user_id) {
        const res = await api.get(`/reviews/user/${ad.data.user_id}`);
        if (res.success) {
          setReviews(res.data.reviews || []);
          setReviewStats(res.data.stats);
        }
      }
    } catch {}
  }

  async function checkFavorite() {
    try {
      const res = await api.get(`/favorites/check?ad_id=${id}`);
      if (res.success) setFavorited(res.data.favorited);
    } catch {}
  }

  async function toggleFavorite() {
    if (!user) return router.push('/login');
    try {
      const res = await api.post('/favorites', { ad_id: id });
      if (res.success) setFavorited(res.data.favorited);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleBuy() {
    if (!user) return router.push('/login');
    setPurchasing(true);
    setError('');
    try {
      const res = await api.post('/orders', { ad_id: id });
      if (res.success) {
        alert('Compra iniciada! Saldo bloqueado com sucesso.');
        refreshProfile();
        router.push('/orders');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPurchasing(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="page-container max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-96 bg-gray-200 rounded-card" />
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );

  if (!ad) return (
    <div className="min-h-screen bg-background">
      <Header user={user} wallet={wallet} />
      <div className="page-container text-center py-20">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-gray-500">{error || 'Anúncio não encontrado'}</p>
        <Link href="/feed" className="btn-primary mt-4 inline-block">Voltar ao Feed</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header user={user} wallet={wallet} />
      <div className="page-container max-w-4xl mx-auto">
        <Link href="/feed" className="text-gray-500 hover:text-primary text-sm mb-4 inline-block">← Voltar</Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="card overflow-hidden mb-3">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                {ad.images?.length > 0 ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${ad.images[currentImage]}`}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-8xl">📱</span>
                )}
              </div>
            </div>
            {ad.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {ad.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-16 h-16 rounded-card overflow-hidden border-2 flex-shrink-0 ${
                      currentImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              {ad.is_featured && <span className="badge bg-secondary text-white">🚀 Destaque</span>}
              <span className="badge bg-gray-100 text-gray-600">{getConditionLabel(ad.condition)}</span>
            </div>

            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold font-heading mb-2 flex-1">{ad.title}</h1>
              {user && (
                <button onClick={toggleFavorite} className="text-2xl p-1 hover:scale-110 transition-transform">
                  {favorited ? '❤️' : '🤍'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 flex-wrap">
              <span>📍 {ad.location}</span>
              <span>📅 {formatDate(ad.created_at)}</span>
              <span>👁️ {ad.views} visualizações</span>
              <span>⭐ {ad.favorites} favoritos</span>
            </div>

            <p className="text-4xl font-bold text-primary mb-6">{formatCurrency(ad.price)}</p>

            <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-line">{ad.description}</p>

            {ad.user_id !== user?.id && (
              <div className="space-y-3 mb-6">
                <button onClick={handleBuy} disabled={purchasing} className="btn-primary w-full text-lg">
                  {purchasing ? 'Processando...' : 'Comprar com Proteção 🔒'}
                </button>
                <Link href={`/chat?userId=${ad.user_id}&adId=${ad.id}`} className="btn-outline w-full block text-center">
                  💬 Contactar Vendedor
                </Link>
              </div>
            )}

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <div className="card p-4">
              <Link href={`/profile?id=${ad.user_id}`} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {ad.user_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold">{ad.user_name}</p>
                  <p className="text-sm text-yellow-500">⭐ {ad.user_rating || '0.0'}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {reviewStats && (
          <div className="card p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">⭐ Avaliações do Vendedor</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl font-bold text-yellow-500">{parseFloat(reviewStats.average).toFixed(1)}</div>
              <div>
                <div className="text-yellow-500 text-lg">
                  {'⭐'.repeat(Math.round(reviewStats.average || 0))}
                </div>
                <p className="text-sm text-gray-500">{reviewStats.total} avaliação(ões)</p>
              </div>
            </div>
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{r.reviewer_name}</span>
                      <span className="text-yellow-500 text-sm">{'⭐'.repeat(r.rating)}</span>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(r.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma avaliação ainda.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
