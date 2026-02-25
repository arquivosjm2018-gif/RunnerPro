import React, { useState, useEffect } from 'react';
import { Film, Plus, Search, Filter, ExternalLink, Play, Clock, Info, X, Loader2, Send } from 'lucide-react';
import { Media, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function MediaLibrary({ user }: { user: User | null }) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  
  const [suggestion, setSuggestion] = useState({
    titulo: '',
    tipo: 'Filme',
    categoria: 'Corrida',
    sinopse: '',
    plataforma: '',
    ano: new Date().getFullYear(),
    imagem_url: '',
    link_externo: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      setMedia(data);
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...suggestion, role: user?.role })
      });
      setShowSuggestModal(false);
      setSuggestion({
        titulo: '',
        tipo: 'Filme',
        categoria: 'Corrida',
        sinopse: '',
        plataforma: '',
        ano: new Date().getFullYear(),
        imagem_url: '',
        link_externo: ''
      });
      if (user?.role === 'admin') fetchMedia();
      else alert("Sugestão enviada com sucesso! Aguarde a aprovação do administrador.");
    } catch (err) {
      console.error("Error suggesting media:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['Todos', 'Corrida', 'Motivacional', 'Disciplina'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-900">Filmes & Séries</h1>
          <p className="text-zinc-500 mt-1">Conteúdo selecionado para manter sua mente focada e motivada.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  filter === cat ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowSuggestModal(true)}
            className="btn-primary whitespace-nowrap"
          >
            <Plus size={18} />
            Sugerir Conteúdo
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {media.filter(m => filter === 'Todos' || m.categoria === filter).map((item) => (
          <motion.div
            layout
            key={item.id}
            whileHover={{ y: -5 }}
            className="group glass-card overflow-hidden flex flex-col cursor-pointer"
            onClick={() => setSelectedMedia(item)}
          >
            <div className="aspect-[2/3] relative overflow-hidden">
              <img 
                src={item.imagem_url || `https://picsum.photos/seed/movie${item.id}/400/600`} 
                alt={item.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <div className="flex items-center gap-2 text-white mb-2">
                  <Play size={20} className="fill-white" />
                  <span className="font-bold">Ver Detalhes</span>
                </div>
              </div>
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/20">
                  {item.tipo}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{item.categoria}</span>
                <span className="text-[10px] text-zinc-400">•</span>
                <span className="text-[10px] text-zinc-400">{item.ano}</span>
              </div>
              <h3 className="font-bold text-zinc-900 truncate">{item.titulo}</h3>
              <p className="text-xs text-zinc-500 mt-1">{item.plataforma}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Suggest Modal */}
      <AnimatePresence>
        {showSuggestModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuggestModal(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-zinc-900">Sugerir Filme ou Série</h2>
                <button onClick={() => setShowSuggestModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={24} className="text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleSuggest} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Título</label>
                    <input 
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Nome do filme ou série"
                      value={suggestion.titulo}
                      onChange={e => setSuggestion({...suggestion, titulo: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Tipo</label>
                    <select 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      value={suggestion.tipo}
                      onChange={e => setSuggestion({...suggestion, tipo: e.target.value as any})}
                    >
                      <option>Filme</option>
                      <option>Série</option>
                      <option>Documentário</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Categoria</label>
                    <select 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      value={suggestion.categoria}
                      onChange={e => setSuggestion({...suggestion, categoria: e.target.value as any})}
                    >
                      <option>Corrida</option>
                      <option>Motivacional</option>
                      <option>Disciplina</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Por que você recomenda?</label>
                    <textarea 
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                      placeholder="Conte-nos um pouco sobre o conteúdo..."
                      value={suggestion.sinopse}
                      onChange={e => setSuggestion({...suggestion, sinopse: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Plataforma</label>
                    <input 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: Netflix, Prime"
                      value={suggestion.plataforma}
                      onChange={e => setSuggestion({...suggestion, plataforma: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Link (Opcional)</label>
                    <input 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="URL externa"
                      value={suggestion.link_externo}
                      onChange={e => setSuggestion({...suggestion, link_externo: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full btn-primary py-4 mt-4"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  Enviar Sugestão
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMedia(null)}
              className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col md:row"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/5 aspect-[2/3] md:aspect-auto">
                  <img 
                    src={selectedMedia.imagem_url || `https://picsum.photos/seed/movie${selectedMedia.id}/600/900`} 
                    className="w-full h-full object-cover"
                    alt={selectedMedia.titulo}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-8 md:w-3/5 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-100">
                      {selectedMedia.tipo}
                    </span>
                    <button onClick={() => setSelectedMedia(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                      <X size={24} className="text-zinc-400" />
                    </button>
                  </div>

                  <h2 className="text-3xl font-display font-bold text-zinc-900 mb-2">{selectedMedia.titulo}</h2>
                  
                  <div className="flex items-center gap-4 text-sm text-zinc-500 mb-6">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{selectedMedia.ano}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Info size={16} />
                      <span className="text-emerald-600 font-bold">{selectedMedia.categoria}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play size={16} />
                      <span>{selectedMedia.plataforma}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-zinc-600 leading-relaxed">
                      {selectedMedia.sinopse}
                    </p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-zinc-100 flex gap-4">
                    {selectedMedia.link_externo && (
                      <a 
                        href={selectedMedia.link_externo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 btn-primary py-4"
                      >
                        <ExternalLink size={20} />
                        Assistir Agora
                      </a>
                    )}
                    <button 
                      onClick={() => setSelectedMedia(null)}
                      className="px-8 btn-secondary py-4"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
