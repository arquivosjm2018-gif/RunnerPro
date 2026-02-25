import React, { useState, useEffect } from 'react';
import { Ticket, Users, Trophy, Timer, ArrowRight, Sparkles } from 'lucide-react';
import { Raffle, User } from '../types';
import { motion } from 'motion/react';

export default function RaffleList({ user }: { user: User | null }) {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/raffles')
      .then(res => res.json())
      .then(data => {
        setRaffles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching raffles:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-900">Rifas Eletrônicas</h1>
          <p className="text-zinc-500 mt-1">Participe e concorra aos melhores equipamentos de corrida.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100">
          <Trophy size={18} />
          <span className="text-sm font-bold">Último Ganhador: @marcos_run</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {raffles.map((raffle) => {
          const progress = (raffle.sold_numbers / raffle.total_numbers) * 100;
          
          return (
            <motion.div
              key={raffle.id}
              whileHover={{ y: -5 }}
              className="glass-card overflow-hidden flex flex-col"
            >
              <div className="h-48 bg-zinc-100 relative overflow-hidden">
                <img 
                  src={raffle.image_url || `https://picsum.photos/seed/gear${raffle.id}/600/400`} 
                  alt={raffle.product}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  R$ {raffle.value_number.toFixed(2)} / número
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-zinc-900 mb-2 line-clamp-1">{raffle.product}</h3>
                
                <div className="flex items-center justify-between text-sm text-zinc-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{raffle.sold_numbers} vendidos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Ticket size={16} />
                    <span>{raffle.total_numbers} total</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-400">Progresso</span>
                    <span className="text-emerald-600">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <button className="w-full btn-primary">
                    Comprar Números
                    <ArrowRight size={18} />
                  </button>
                  <p className="text-[10px] text-center text-zinc-400 uppercase tracking-widest font-bold">
                    Sorteio automático via RunnerPro AI
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Create Raffle CTA for Admin/Elite */}
        {user?.plan === 'Elite' && (
          <div className="glass-card border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center p-8 text-center group hover:border-emerald-500 transition-colors cursor-pointer">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <Sparkles size={32} />
            </div>
            <h3 className="font-bold text-zinc-900">Criar Nova Rifa</h3>
            <p className="text-sm text-zinc-500 mt-2">Como membro Elite, você pode criar suas próprias rifas e monetizar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
