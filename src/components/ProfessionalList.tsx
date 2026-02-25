import React, { useState, useEffect } from 'react';
import { ShieldCheck, MessageCircle, Instagram, ExternalLink } from 'lucide-react';
import { Professional } from '../types';
import { motion } from 'motion/react';

export default function ProfessionalList() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/professionals')
      .then(res => res.json())
      .then(data => {
        setProfessionals(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching professionals:", err);
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
      <header>
        <h1 className="text-3xl font-display font-bold text-zinc-900">Profissionais Recomendados</h1>
        <p className="text-zinc-500 mt-1">Conecte-se com especialistas que entendem de corrida e performance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map((pro) => (
          <motion.div
            key={pro.id}
            whileHover={{ y: -5 }}
            className="glass-card overflow-hidden flex flex-col"
          >
            <div className="p-6 flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img 
                    src={pro.foto_url || `https://picsum.photos/seed/pro${pro.id}/200/200`} 
                    alt={pro.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-100"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg shadow-lg">
                    <ShieldCheck size={14} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">{pro.name}</h3>
                  <p className="text-sm text-emerald-600 font-bold">{pro.specialty}</p>
                </div>
              </div>

              <p className="text-sm text-zinc-500 mb-6 line-clamp-3">
                {pro.bio}
              </p>

              <div className="flex flex-col gap-3">
                <a 
                  href={`https://wa.me/${pro.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full py-2.5 text-sm"
                >
                  <MessageCircle size={18} />
                  Falar no WhatsApp
                </a>
                {pro.instagram && (
                  <a 
                    href={`https://instagram.com/${pro.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full py-2.5 text-sm"
                  >
                    <Instagram size={18} />
                    Ver Instagram
                  </a>
                )}
              </div>
            </div>
            <div className="bg-zinc-50 p-3 border-t border-zinc-100 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <ShieldCheck size={12} className="text-emerald-500" />
              Profissional Verificado RunnerPro
            </div>
          </motion.div>
        ))}
      </div>

      {/* Professional Partnership CTA */}
      <div className="glass-card p-8 text-center border-2 border-dashed border-zinc-200">
        <h3 className="text-xl font-display font-bold text-zinc-900">É um profissional da área?</h3>
        <p className="text-zinc-500 mt-2 mb-6 max-w-md mx-auto">
          Junte-se ao nosso ecossistema e seja recomendado para centenas de corredores todos os dias.
        </p>
        <button className="btn-secondary px-8">
          Seja um Parceiro
          <ExternalLink size={18} />
        </button>
      </div>
    </div>
  );
}
