'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/feed', icon: '🏠', label: 'Feed' },
  { href: '/search', icon: '🔍', label: 'Pesquisar' },
  { href: '/create-ad', icon: '➕', label: 'Publicar' },
  { href: '/chat', icon: '💬', label: 'Chat' },
  { href: '/profile', icon: '👤', label: 'Perfil' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe">
      <div className="flex justify-around py-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center px-3 py-1 text-xs transition-colors ${
              pathname === item.href ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-lg mb-0.5">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
