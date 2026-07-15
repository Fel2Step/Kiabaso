'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kiabasso_token');
    setChecking(false);
    if (token) {
      router.replace('/feed');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
          <span className="text-4xl font-bold text-white">K</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Kiabasso</h1>
        <p className="text-gray-500 mt-2">A carregar...</p>
      </div>
    </div>
  );
}
