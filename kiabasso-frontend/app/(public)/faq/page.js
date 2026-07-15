'use client';
import { useState } from 'react';
import Link from 'next/link';

const FAQS = [
  {
    q: 'O que é o Kiabasso?',
    a: 'O Kiabasso é um marketplace digital angolano que permite comprar e vender produtos com segurança. Funciona como uma plataforma social onde compradores e vendedores podem negociar, com sistema de pagamento protegido (Bolsa Kiabasso).',
  },
  {
    q: 'Como criar uma conta?',
    a: 'Clique em "Criar Conta" na página de login, preencha seu nome, email e senha. Opcionalmente pode adicionar seu telefone para verificação SMS.',
  },
  {
    q: 'Como funciona a Bolsa Kiabasso?',
    a: 'A Bolsa é uma carteira digital que permite depositar, sacar e usar saldo para compras protegidas. O saldo fica bloqueado durante a transação e só é libertado quando ambas as partes confirmam a entrega.',
  },
  {
    q: 'O que é a Compra Protegida?',
    a: 'É um sistema de escrow (garantia): o valor da compra fica retido na Bolsa até que o comprador confirme o recebimento do produto. Apenas então o pagamento é libertado para o vendedor. A taxa Kiabasso é de apenas 2%.',
  },
  {
    q: 'Quanto custa publicar um anúncio?',
    a: 'Publicar anúncios é gratuito! Oferecemos planos de promoção pagos para destacar seus anúncios: Básico (500 Kz/3 dias), Premium (1.500 Kz/7 dias) e VIP (3.000 Kz/14 dias).',
  },
  {
    q: 'Como funciona o chat?',
    a: 'O chat integrado permite comunicar directamente com vendedores e compradores em tempo real. As conversas são organizadas por anúncio e ficam disponíveis por 90 dias.',
  },
  {
    q: 'Como posso depositar dinheiro na Bolsa?',
    a: 'Actualmente pode depositar através de transferência Multicaixa ou Unitel Money. O depósito mínimo é de 500 Kz. Os valores ficam disponíveis imediatamente.',
  },
  {
    q: 'Como levantar o saldo da Bolsa?',
    a: 'Pode solicitar um levantamento para sua conta bancária. O valor mínimo é de 1.000 Kz, com uma taxa de 2% (mín. 50 Kz, máx. 500 Kz).',
  },
  {
    q: 'O que acontece se houver um problema com uma compra?',
    a: 'Pode abrir uma disputa na página do pedido. Um administrador analisará o caso e decidirá a resolução. O saldo fica bloqueado até a decisão final.',
  },
  {
    q: 'Posso cancelar um pedido?',
    a: 'Sim! Se o pedido estiver pendente, o cancelamento é automático com reembolso imediato. Se já foi aceite, ambas as partes precisam concordar. Após envio, apenas por disputa.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold text-gray-900 mb-4">FAQ</h1>
          <p className="text-gray-500 text-lg">Perguntas Frequentes sobre o Kiabasso</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <span>{faq.q}</span>
                <span className={`text-primary transition-transform ${openIndex === i ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">Ainda tem dúvidas?</p>
          <Link href="/login" className="btn-primary">Fale Connosco</Link>
        </div>
      </div>
    </div>
  );
}
