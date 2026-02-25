import React, { useState, useEffect } from 'react';
import { Palette, Copy, Check, Search, Filter, Download, Lock, Maximize2, X } from 'lucide-react';
import { CatalogItem, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function ArtCatalog({ user }: { user: User | null }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [filter, setFilter] = useState('Todos');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  useEffect(() => {
    fetch('/api/catalog')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching catalog:", err);
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

  const copyPrompt = (item: CatalogItem) => {
    if (user?.plan === 'Starter' && item.category === 'Elite') return;
    navigator.clipboard.writeText(item.prompt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ['Todos', 'Elite', 'Trail', 'Urbana', 'Motivacional'];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-900">Catálogo de Artes (Carro Forte)</h1>
          <p className="text-zinc-500 mt-1">Artes exclusivas criadas por IA com prompts copiáveis.</p>
        </div>
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
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.filter(i => filter === 'Todos' || i.category === filter).map((item) => (
          <motion.div
            layout
            key={item.id}
            className="group glass-card overflow-hidden flex flex-col"
          >
            <div className="aspect-square relative overflow-hidden cursor-pointer" onClick={() => setSelectedItem(item)}>
              <img 
                src={item.image_url} 
                alt="Art" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              {user?.plan === 'Starter' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20 rotate-45 select-none">
                  <span className="text-4xl font-black text-white whitespace-nowrap">RUNNERPRO AI</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-zinc-900">
                  {item.category}
                </span>
              </div>
              
              {user?.plan === 'Starter' && item.category === 'Elite' && (
                <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-6 text-center">
                  <Lock size={32} className="mb-2 opacity-50" />
                  <p className="font-bold text-sm">Acesso Elite</p>
                  <p className="text-xs text-zinc-300 mt-1">Faça upgrade para ver o prompt e baixar a arte.</p>
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="text-white" size={32} />
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <div className="flex-1">
                <p className="text-xs text-zinc-400 mb-2">Prompt Original:</p>
                <p className="text-sm text-zinc-600 line-clamp-3 italic">
                  "{item.prompt}"
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center gap-2">
                <button
                  disabled={user?.plan === 'Starter' && item.category === 'Elite'}
                  onClick={() => copyPrompt(item)}
                  className="flex-1 btn-secondary py-2 text-xs"
                >
                  {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                  {copiedId === item.id ? 'Copiado' : 'Copiar Prompt'}
                </button>
                <button 
                  disabled={user?.plan === 'Starter' && item.category === 'Elite'}
                  className="p-2 bg-zinc-50 text-zinc-400 hover:text-emerald-600 rounded-xl transition-colors border border-zinc-200"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Preview Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col md:flex-row"
            >
              <div className="md:w-1/2 aspect-square relative">
                <img 
                  src={selectedItem.image_url} 
                  className="w-full h-full object-cover"
                  alt="Art Preview"
                  referrerPolicy="no-referrer"
                />
                {user?.plan === 'Starter' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 rotate-45 select-none">
                    <span className="text-6xl font-black text-black whitespace-nowrap">RUNNERPRO AI</span>
                  </div>
                )}
              </div>
              <div className="p-8 md:w-1/2 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100">
                      {selectedItem.category}
                    </span>
                    <h3 className="text-2xl font-display font-bold text-zinc-900 mt-2">{selectedItem.title || 'Arte Exclusiva'}</h3>
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <X size={24} className="text-zinc-400" />
                  </button>
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Prompt Completo</p>
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 relative group">
                      <p className="text-sm text-zinc-600 italic leading-relaxed">
                        "{selectedItem.prompt}"
                      </p>
                      <button 
                        onClick={() => copyPrompt(selectedItem)}
                        className="absolute top-2 right-2 p-2 bg-white shadow-sm border border-zinc-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedId === selectedItem.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Estilo</p>
                      <p className="text-sm font-bold text-zinc-900">{selectedItem.style || 'Cinematic'}</p>
                    </div>
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Criado por</p>
                      <p className="text-sm font-bold text-zinc-900">{selectedItem.created_by}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    disabled={user?.plan === 'Starter' && selectedItem.category === 'Elite'}
                    className="flex-1 btn-primary py-4"
                  >
                    <Download size={20} />
                    Download HD
                  </button>
                  <button 
                    onClick={() => copyPrompt(selectedItem)}
                    className="px-6 btn-secondary py-4"
                  >
                    {copiedId === selectedItem.id ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
                {user?.plan === 'Starter' && selectedItem.category === 'Elite' && (
                  <p className="text-xs text-center text-zinc-400 mt-4">
                    Upgrade para o plano <span className="text-emerald-600 font-bold">Pro ou Elite</span> para baixar sem marca d'água.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


