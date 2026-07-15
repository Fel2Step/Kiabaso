'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/shared/Header';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../lib/api';

const CATEGORIES = [
  { id: 'eletronicos', name: 'Eletrónicos', icon: '📱' },
  { id: 'moda', name: 'Moda', icon: '👗' },
  { id: 'automoveis', name: 'Automóveis', icon: '🚗' },
  { id: 'imoveis', name: 'Imóveis', icon: '🏠' },
  { id: 'servicos', name: 'Serviços', icon: '🔧' },
  { id: 'desporto', name: 'Desporto', icon: '⚽' },
  { id: 'casa_jardim', name: 'Casa e Jardim', icon: '🏡' },
  { id: 'livros', name: 'Livros', icon: '📚' },
  { id: 'musica_filmes', name: 'Música e Filmes', icon: '🎵' },
  { id: 'outros', name: 'Outros', icon: '📦' },
];

const PROMOTIONS = [
  { id: 'free', name: 'Gratuito', price: 0, duration: '30 dias', desc: 'Anúncio básico' },
  { id: 'basico', name: 'Básico', price: 500, duration: '3 dias', desc: 'Maior visibilidade' },
  { id: 'premium', name: 'Premium', price: 1500, duration: '7 dias', desc: 'Destaque no feed' },
  { id: 'vip', name: 'VIP', price: 3000, duration: '14 dias', desc: 'Máximo destaque' },
];

export default function CreateAdPage() {
  const router = useRouter();
  const { user, wallet, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: '',
    subcategory: '', location: '', condition: 'new',
    promotion_level: 'free', images: [],
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  async function handleSubmit() {
    setError('');
    if (!form.title || form.title.length < 3) return setError('Título deve ter pelo menos 3 caracteres');
    if (!form.price || form.price <= 0) return setError('Preço deve ser positivo');
    if (!form.category) return setError('Seleccione uma categoria');
    if (!form.location) return setError('Indique a localização');

    setSubmitting(true);
    try {
      const res = await api.post('/ads', {
        ...form,
        price: parseFloat(form.price),
        images: form.images,
        promotion_level: form.promotion_level,
      });

      if (form.promotion_level !== 'free' && res.success) {
        try {
          await api.post('/promotions', {
            ad_id: res.data.id,
            plan: form.promotion_level,
          });
        } catch (err) {
          console.error('[CreateAd] Erro ao activar promoção:', err);
        }
      }

      if (res.success) {
        refreshProfile();
        router.push(`/ad/${res.data.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header user={user} wallet={wallet} />
      <div className="page-container max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`flex-1 h-1 rounded ${step >= s ? 'bg-primary' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="card p-6 md:p-8">
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-4">📂 Seleccionar Categoria</h2>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { update('category', cat.id); setStep(2); }}
                    className={`p-4 rounded-card border-2 text-left transition-all ${
                      form.category === cat.id ? 'border-primary bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <p className="font-medium mt-1">{cat.name}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-4">📝 Preencher Dados</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título do anúncio</label>
                  <input value={form.title} onChange={e => update('title', e.target.value)} className="input-field" placeholder="Ex: Samsung Galaxy S21" maxLength={200} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)} className="input-field" rows={4} placeholder="Descreva o produto em detalhe..." maxLength={5000} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço (Kz)</label>
                    <input type="number" value={form.price} onChange={e => update('price', e.target.value)} className="input-field" placeholder="150000" min={0} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Condição</label>
                    <select value={form.condition} onChange={e => update('condition', e.target.value)} className="input-field">
                      <option value="new">Novo</option>
                      <option value="used">Usado</option>
                      <option value="refurbished">Recondicionado</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Localização</label>
                  <input value={form.location} onChange={e => update('location', e.target.value)} className="input-field" placeholder="Ex: Talatona, Luanda" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-ghost">Voltar</button>
                  <button onClick={() => setStep(3)} className="btn-primary">Continuar</button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-4">🖼️ Carregar Imagens</h2>
              <p className="text-sm text-gray-500 mb-4">Máximo 8 imagens. A primeira será a capa.</p>

              <div className="grid grid-cols-4 gap-3 mb-4">
                {form.images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-card overflow-hidden bg-gray-100">
                    <img src={img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => update('images', form.images.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >✕</button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded">Capa</span>}
                  </div>
                ))}
                {form.images.length < 8 && (
                  <label className="aspect-square rounded-card border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <span className="text-2xl">+</span>
                    <span className="text-xs text-gray-400 mt-1">Adicionar</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('images', file);
                        try {
                          const res = await api.upload('/upload', formData);
                          if (res.success) {
                            update('images', [...form.images, ...res.data.files.map(f => f.url)]);
                          }
                        } catch (err) {
                          setError(err.message);
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
              </div>

              <p className="text-xs text-gray-400 mb-4">JPG, PNG ou WebP • Máx. 5MB cada</p>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-ghost">Voltar</button>
                <button onClick={() => setStep(4)} className="btn-primary">Continuar</button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-2xl font-bold mb-4">🚀 Escolher Promoção</h2>
              <p className="text-sm text-gray-500 mb-4">Aumente a visibilidade do seu anúncio</p>
              <div className="space-y-3">
                {PROMOTIONS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => update('promotion_level', p.id)}
                    className={`w-full p-4 rounded-card border-2 text-left transition-all ${
                      form.promotion_level === p.id ? 'border-primary bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-sm text-gray-500">{p.desc} • {p.duration}</p>
                      </div>
                      <p className="font-bold text-primary">{p.price === 0 ? 'Grátis' : `${p.price} Kz`}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(3)} className="btn-ghost">Voltar</button>
                <button onClick={() => setStep(5)} className="btn-primary">Continuar</button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-2xl font-bold mb-4">👁️ Pré-visualizar e Publicar</h2>
              <div className="card p-4 mb-6">
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-card flex items-center justify-center text-6xl mb-4 overflow-hidden">
                  {form.images.length > 0 ? (
                    <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${form.images[0]}`} alt="" className="w-full h-full object-cover" />
                  ) : '📱'}
                </div>
                <h3 className="font-bold text-lg">{form.title || 'Título do anúncio'}</h3>
                <p className="text-primary text-2xl font-bold">{form.price ? `${parseFloat(form.price).toLocaleString()} Kz` : '0 Kz'}</p>
                <p className="text-sm text-gray-500 mt-2">{form.description?.slice(0, 100)}...</p>
                <div className="flex flex-wrap gap-2 mt-3 text-sm text-gray-500">
                  <span>📍 {form.location}</span>
                  <span>📂 {CATEGORIES.find(c => c.id === form.category)?.name}</span>
                  <span>🏷️ {form.condition === 'new' ? 'Novo' : 'Usado'}</span>
                  <span>🚀 {PROMOTIONS.find(p => p.id === form.promotion_level)?.name}</span>
                </div>
              </div>
              {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
              <div className="flex gap-3">
                <button onClick={() => setStep(4)} className="btn-ghost">Voltar</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Publicando...' : '📢 Publicar Anúncio'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
