'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (code.length !== 6) return setError('Código deve ter 6 dígitos');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-phone', { code });
      if (res.success) {
        router.push('/profile');
      } else {
        setError(res.message || 'Código inválido');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="text-xl font-bold mb-2">Verificar Telefone</h2>
          <p className="text-gray-500 mb-6">Digite o código de 6 dígitos enviado por SMS</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input-field text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500">
            <Link href="/profile" className="text-primary hover:underline">Voltar ao perfil</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
