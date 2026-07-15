'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AuthService } from '../../lib/auth';
import { formatCurrency } from '../../lib/utils';
import api from '../../lib/api';

export default function Header({ user, wallet, onSearch }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/chat/unread');
        if (res.success) setUnreadCount(res.data.count);
      } catch (err) { console.error('[Header] Erro ao carregar não lidas:', err); }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    AuthService.logout(router);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/feed" className="flex items-center gap-2">
            <span className="text-2xl">🔵</span>
            <span className="font-heading font-bold text-xl text-primary">Kiabasso</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 pr-4 py-2 text-sm"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </form>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/faq" className="hidden sm:block text-sm text-gray-500 hover:text-primary transition-colors">FAQ</Link>
                <Link href="/wallet" className="hidden sm:flex items-center gap-1 bg-primary-50 text-primary px-3 py-1.5 rounded-full text-sm font-semibold">
                  💼 {wallet ? formatCurrency(wallet.available_balance) : '...'}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{user.name?.split(' ')[0]}</span>
                  </button>

                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-card shadow-medium border border-gray-100 z-20 py-2">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>👤 Meu Perfil</Link>
                        <Link href="/my-ads" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>📦 Meus Anúncios</Link>
                        <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>📋 Pedidos</Link>
                        <Link href="/chat" className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                          <span>💬 Chat</span>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                          )}
                        </Link>
                        <Link href="/wallet" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>💼 Bolsa</Link>
                        <hr className="my-1 border-gray-100" />
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">🚪 Sair</button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link href="/login" className="btn-primary text-sm py-2 px-4">Entrar</Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
          <div className="flex justify-around py-2">
            <Link href="/feed" className={`flex flex-col items-center px-3 py-1 text-xs ${pathname === '/feed' ? 'text-primary' : 'text-gray-500'}`}>
              <span className="text-lg">🏠</span>
              <span>Feed</span>
            </Link>
            <Link href="/search" className={`flex flex-col items-center px-3 py-1 text-xs ${pathname?.startsWith('/search') ? 'text-primary' : 'text-gray-500'}`}>
              <span className="text-lg">🔍</span>
              <span>Pesquisar</span>
            </Link>
            <Link href="/create-ad" className={`flex flex-col items-center px-3 py-1 text-xs ${pathname === '/create-ad' ? 'text-primary' : 'text-gray-500'}`}>
              <span className="text-lg">➕</span>
              <span>Publicar</span>
            </Link>
            <Link href="/chat" className={`flex flex-col items-center px-3 py-1 text-xs relative ${pathname === '/chat' ? 'text-primary' : 'text-gray-500'}`}>
              <span className="text-lg">💬</span>
              <span>Chat</span>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link href="/profile" className={`flex flex-col items-center px-3 py-1 text-xs ${pathname === '/profile' ? 'text-primary' : 'text-gray-500'}`}>
              <span className="text-lg">👤</span>
              <span>Perfil</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
