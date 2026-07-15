'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/shared/Header';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { formatCurrency, formatDate, getCategoryIcon } from '../../../lib/utils';

function ProfileContent() {
  const searchParams = useSearchParams();
  const profileId = searchParams.get('id');
  const { user, wallet, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', location: '', bio: '' });
  const [saving, setSaving] = useState(false);

  const isOwnProfile = !profileId || profileId === user?.id;
  const targetId = profileId || user?.id;

  useEffect(() => { refreshProfile(); }, []);

  useEffect(() => {
    if (targetId) loadProfile();
  }, [targetId]);

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await api.get(`/users/${targetId}`);
      if (res.success) {
        setProfile(res.data.profile);
        setAds(res.data.ads?.ads || res.data.ads || []);
        setForm({
          name: res.data.profile.name || '',
          phone: res.data.profile.phone || '',
          location: res.data.profile.location || '',
          bio: res.data.profile.bio || '',
        });
      }
    } catch (err) { console.error('[Profile] Erro ao carregar perfil:', err); } finally { setLoading(false); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.put('/auth/profile', form);
      setEditing(false);
      refreshProfile();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  }

  if (loading) return <div className="min-h-screen bg-background"><Header user={user} wallet={wallet} /><div className="page-container text-center py-20 text-gray-500">Carregando...</div></div>;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header user={user} wallet={wallet} />
      <div className="page-container max-w-3xl mx-auto">
        <div className="card p-6 md:p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              {editing ? (
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field text-lg font-bold mb-1" />
              ) : (
                <h1 className="text-2xl font-bold font-heading">{profile?.name}</h1>
              )}
              <div className="flex items-center gap-2 text-sm text-yellow-500">
                ⭐ {profile?.rating || '0.0'}
                <span className="text-gray-400">• {profile?.total_sales || 0} vendas</span>
                <span className="text-gray-400">• {profile?.total_ads || 0} anúncios</span>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <div className="mb-4">
              {editing ? (
                <div className="space-y-3">
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" placeholder="Telefone" />
                  <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input-field" placeholder="Localização" />
                  <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="input-field" placeholder="Bio" rows={3} />
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Salvando...' : 'Salvar'}</button>
                    <button onClick={() => setEditing(false)} className="btn-ghost">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm text-gray-600">
                  {profile?.email && <p>📧 {profile.email}</p>}
                  {profile?.phone && <p>📞 {profile.phone}</p>}
                  {profile?.location && <p>📍 {profile.location}</p>}
                  {profile?.bio && <p className="text-gray-500 mt-2">{profile.bio}</p>}
                  {isOwnProfile && <button onClick={() => setEditing(true)} className="btn-ghost text-primary mt-2">✏️ Editar perfil</button>}
                </div>
              )}
            </div>
          )}
        </div>

        <h2 className="font-bold text-lg mb-4">📦 Anúncios</h2>
        {ads.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum anúncio publicado</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ads.map(ad => (
              <Link key={ad.id} href={`/ad/${ad.id}`} className="card overflow-hidden hover:shadow-medium transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-4xl">
                  {getCategoryIcon(ad.category)}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{ad.title}</h3>
                  <p className="text-primary font-bold">{formatCurrency(ad.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Carregando perfil...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
