import React, { useState, useEffect } from 'react';
import { Tag, ExternalLink, Percent, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { User, Promotion } from '../types';
import { motion } from 'motion/react';

export default function Promotions({ user }: { user: User | null }) {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/promotions')
      .then(res => res.json())
      .then(data => {
        setPromos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching promotions:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

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
            <div className="relative aspect-video overflow-hidden bg-zinc-100">
              <img 
                src={promo.image_url || 'https://picsum.photos/seed/promo/800/450'} 
                alt={promo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100">
                  {promo.category}
                </span>
              </div>
            </div>
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-emerald-600 font-bold">
                  <Percent size={14} />
                  <span className="text-sm">OFERTA</span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-zinc-900 mb-2">{promo.title}</h3>
              <p className="text-sm text-zinc-500 mb-6 line-clamp-2">{promo.description}</p>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-display font-bold text-zinc-900">{promo.price}</span>
                <span className="text-sm text-zinc-400 line-through">{promo.original_price}</span>
              </div>

              <a 
                href={promo.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
              >
                Ver Promoção
                <ExternalLink size={16} />
              </a>
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
