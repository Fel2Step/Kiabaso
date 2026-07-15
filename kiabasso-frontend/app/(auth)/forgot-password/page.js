'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <span className="text-3xl font-bold text-white">K</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Recuperar Senha</h1>
          <p className="text-gray-500 mt-1">Receba instruções no seu email</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-xl font-bold mb-2">Email enviado!</h2>
              <p className="text-gray-500 mb-6">
                Se existir uma conta com este email, receberá instruções para redefinir a senha.
              </p>
              <Link href="/login" className="btn-primary inline-block">Voltar ao Login</Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Enviando...' : 'Enviar Instruções'}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-500">
                Lembrou a senha?{' '}
                <Link href="/login" className="text-primary font-semibold hover:underline">Entrar</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
