import React from 'react';
import { Tag, ExternalLink, Percent, ShoppingBag, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { motion } from 'motion/react';

export default function Promotions({ user }: { user: User | null }) {
  const promos = [
    {
      id: 1,
      title: 'Nike Vaporfly 3 - 30% OFF',
      description: 'O tênis mais rápido da Nike com um desconto imperdível para membros RunnerPro.',
      price: 'R$ 1.299,00',
      originalPrice: 'R$ 1.899,00',
      category: 'Tênis',
      link: '#'
    },
    {
      id: 2,
      title: 'Garmin Forerunner 255',
      description: 'Precisão absoluta no seu pulso. Promoção exclusiva na Netshoes via nosso link.',
      price: 'R$ 2.100,00',
      originalPrice: 'R$ 2.800,00',
      category: 'Acessórios',
      link: '#'
    },
    {
      id: 3,
      title: 'Kit Gel de Carboidrato (10 un)',
      description: 'Energia para seus longões. Compre 10 e leve 12.',
      price: 'R$ 90,00',
      originalPrice: 'R$ 120,00',
      category: 'Suplementos',
      link: '#'
    }
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-display font-bold text-zinc-900">Super Promoções</h1>
        <p className="text-zinc-500 mt-1">Ofertas curadas e exclusivas para a comunidade RunnerPro.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.map((promo) => (
          <motion.div
            key={promo.id}
            whileHover={{ scale: 1.02 }}
            className="glass-card overflow-hidden flex flex-col"
          >
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100">
                  {promo.category}
                </span>
                <div className="flex items-center gap-1 text-emerald-600 font-bold">
                  <Percent size={14} />
                  <span className="text-sm">OFERTA</span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-zinc-900 mb-2">{promo.title}</h3>
              <p className="text-sm text-zinc-500 mb-6 line-clamp-2">{promo.description}</p>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-display font-bold text-zinc-900">{promo.price}</span>
                <span className="text-sm text-zinc-400 line-through">{promo.originalPrice}</span>
              </div>

              <button className="w-full btn-primary py-2.5 text-sm">
                Ver Promoção
                <ExternalLink size={16} />
              </button>
            </div>
            <div className="bg-zinc-50 p-3 border-t border-zinc-100 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <ShoppingBag size={12} />
              Link de Afiliado RunnerPro
            </div>
          </motion.div>
        ))}
      </div>

      {/* Affiliate Program CTA */}
      <div className="bg-emerald-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-display font-bold">Encontrou uma promoção?</h2>
          <p className="text-emerald-100">Envie para nossa equipe e ganhe pontos se ela for publicada!</p>
        </div>
        <button className="bg-white text-emerald-700 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center gap-2 whitespace-nowrap">
          Enviar Promoção
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
