'use client';
import { useState, useEffect } from 'react';
import Header from '../../../components/shared/Header';
import { useAuth } from '../../../hooks/useAuth';
import { useWallet } from '../../../hooks/useWallet';
import { formatCurrency, formatDate } from '../../../lib/utils';

export default function WalletPage() {
  const { user, wallet, refreshProfile } = useAuth();
  const { deposit, withdraw, getHistory } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { refreshProfile(); loadHistory(); }, []);

  async function loadHistory() {
    try {
      const res = await getHistory(1);
      if (res?.success) setTransactions(res.data.transactions || []);
    } catch (err) { console.error('[Wallet] Erro ao carregar histórico:', err); } finally { setLoading(false); }
  }

  async function handleDeposit() {
    const val = parseFloat(amount);
    if (val < 500) return setError('Mínimo: 500 Kz');
    setProcessing(true); setError('');
    try {
      await deposit(val);
      setShowDeposit(false); setAmount('');
      refreshProfile(); loadHistory();
    } catch (err) { setError(err.message); } finally { setProcessing(false); }
  }

  async function handleWithdraw() {
    const val = parseFloat(amount);
    if (val < 1000) return setError('Mínimo: 1.000 Kz');
    setProcessing(true); setError('');
    try {
      await withdraw(val);
      setShowWithdraw(false); setAmount('');
      refreshProfile(); loadHistory();
    } catch (err) { setError(err.message); } finally { setProcessing(false); }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header user={user} wallet={wallet} />
      <div className="page-container max-w-3xl mx-auto">
        <h1 className="section-title mb-6">💼 Minha Bolsa</h1>

        <div className="card p-6 md:p-8 mb-6 bg-gradient-to-br from-primary to-primary-700 text-white">
          <p className="text-sm opacity-80 mb-1">Saldo Total</p>
          <p className="text-4xl md:text-5xl font-bold font-heading mb-4">
            {formatCurrency(wallet?.total_balance || 0)}
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <p className="opacity-70">Disponível</p>
              <p className="font-bold">{formatCurrency(wallet?.available_balance || 0)}</p>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <p className="opacity-70">Bloqueado</p>
              <p className="font-bold">{formatCurrency(wallet?.blocked_balance || 0)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button onClick={() => setShowDeposit(true)} className="btn-primary flex-1">+ Recarregar</button>
          <button onClick={() => setShowWithdraw(true)} className="btn-outline flex-1">↗ Levantar</button>
        </div>

        {(showDeposit || showWithdraw) && (
          <div className="card p-6 mb-6">
            <h3 className="font-bold mb-4">{showDeposit ? 'Recarregar Saldo' : 'Levantar Saldo'}</h3>
            {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
            <div className="flex gap-3">
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input-field flex-1" placeholder="Valor em Kz" min={showDeposit ? 500 : 1000} />
              <button onClick={showDeposit ? handleDeposit : handleWithdraw} disabled={processing} className="btn-primary">
                {processing ? '...' : 'Confirmar'}
              </button>
              <button onClick={() => { setShowDeposit(false); setShowWithdraw(false); setError(''); }} className="btn-ghost">Cancelar</button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {showDeposit ? 'Depósito mínimo: 500 Kz' : 'Levantamento mínimo: 1.000 Kz • Taxa: 2% (50-500 Kz)'}
            </p>
          </div>
        )}

        <h2 className="font-bold text-lg mb-4">📋 Últimas Transacções</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nenhuma transacção</div>
        ) : (
          <div className="space-y-2">
            {transactions.map(tx => (
              <div key={tx.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{tx.description || tx.type}</p>
                  <p className="text-xs text-gray-500">{formatDate(tx.created_at)} • {tx.reference}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${parseFloat(tx.amount) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {parseFloat(tx.amount) >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </p>
                  {parseFloat(tx.fee_amount) > 0 && <p className="text-xs text-gray-400">Taxa: {formatCurrency(tx.fee_amount)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
