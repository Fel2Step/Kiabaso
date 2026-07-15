'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/shared/Header';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { formatCurrency, formatDate, getCategoryIcon } from '../../../lib/utils';

function SearchContent() {
  const searchParams = useSearchParams();
  const { user, wallet } = useAuth();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ category: '', minPrice: '', maxPrice: '', condition: '', sort: 'recent' });

  const CATEGORIES = [
    { id: '', name: 'Todas as categorias' },
    { id: 'eletronicos', name: 'Eletrónicos' },
    { id: 'moda', name: 'Moda' },
    { id: 'automoveis', name: 'Automóveis' },
    { id: 'imoveis', name: 'Imóveis' },
    { id: 'servicos', name: 'Serviços' },
    { id: 'desporto', name: 'Desporto' },
    { id: 'casa_jardim', name: 'Casa e Jardim' },
    { id: 'livros', name: 'Livros' },
  ];

  useEffect(() => {
    if (query) performSearch();
  }, [query, filters]);

  async function performSearch() {
    setLoading(true);
    try {
      const params = { q: query, ...filters, page: 1, limit: 20 };
      const res = await api.get('/ads/search', params);
      if (res.success) setResults(res.data.ads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header user={user} wallet={wallet} />
      <div className="page-container">
        <h1 className="section-title mb-6">Resultados para &ldquo;{query}&rdquo;</h1>

        <div className="flex flex-wrap gap-3 mb-6">
          <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="input-field w-auto text-sm">
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select value={filters.sort} onChange={e => setFilters({...filters, sort: e.target.value})} className="input-field w-auto text-sm">
            <option value="recent">Mais recentes</option>
            <option value="price_asc">Preço: menor-maior</option>
            <option value="price_desc">Preço: maior-menor</option>
          </select>
          <select value={filters.condition} onChange={e => setFilters({...filters, condition: e.target.value})} className="input-field w-auto text-sm">
            <option value="">Todos os estados</option>
            <option value="new">Novo</option>
            <option value="used">Usado</option>
          </select>
          <input type="number" placeholder="Preço mín." value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})} className="input-field w-28 text-sm" />
          <input type="number" placeholder="Preço máx." value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})} className="input-field w-28 text-sm" />
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">A pesquisar...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500">Nenhum resultado encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map(ad => {
              let images = ad.images || [];
              if (typeof images === 'string') { try { images = JSON.parse(images); } catch { images = []; } }
              return (
              <Link key={ad.id} href={`/ad/${ad.id}`} className="card overflow-hidden hover:shadow-medium transition-shadow group">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {images.length > 0 ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${images[0]}`}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-50 to-gray-100">
                      {getCategoryIcon(ad.category)}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{ad.title}</h3>
                  <p className="text-primary font-bold text-lg mt-1">{formatCurrency(ad.price)}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>📍 {ad.location?.split(',')[0]}</span>
                    <span>{formatDate(ad.created_at)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">A carregar...</div>}>
      <SearchContent />
    </Suspense>
  );
}
