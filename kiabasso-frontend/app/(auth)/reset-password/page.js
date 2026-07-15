'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) return setError('Senha deve ter no mínimo 8 caracteres');
    if (!/[A-Z]/.test(password)) return setError('Senha deve ter pelo menos 1 letra maiúscula');
    if (!/\d/.test(password)) return setError('Senha deve ter pelo menos 1 número');
    if (password !== confirmPassword) return setError('Senhas não coincidem');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">Link Inválido</h2>
        <p className="text-gray-500 mb-6">Este link de recuperação é inválido ou expirou.</p>
        <Link href="/forgot-password" className="btn-primary inline-block">Solicitar novo link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-2">Senha Redefinida!</h2>
        <p className="text-gray-500 mb-6">Sua senha foi alterada com sucesso.</p>
        <Link href="/login" className="btn-primary inline-block">Entrar agora</Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="Mínimo 8 caracteres, 1 maiúscula, 1 número"
            required
            minLength={8}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            placeholder="Repita a senha"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Redefinindo...' : 'Redefinir Senha'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <span className="text-3xl font-bold text-white">K</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Redefinir Senha</h1>
        </div>

        <div className="card p-8">
          <Suspense fallback={<div className="text-center py-4 text-gray-500">Carregando...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
