import React, { useState, useEffect } from 'react';
import { Palette, Copy, Check, Search, Filter, Download, Lock } from 'lucide-react';
import { CatalogItem, User } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function ArtCatalog({ user }: { user: User | null }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    // Mock data for demo if API is empty
    const mockItems: CatalogItem[] = [
      {
        id: 1,
        image_url: 'https://picsum.photos/seed/run1/800/800',
        category: 'Elite',
        prompt: 'Create a hyper-realistic cinematic image of a professional runner in action. Location: Urban city at dawn. Camera: 85mm lens, shallow depth of field. Ultra HD, high detail.',
        created_by: 'RunnerPro AI'
      },
      {
        id: 2,
        image_url: 'https://picsum.photos/seed/run2/800/800',
        category: 'Trail',
        prompt: 'Cinematic shot of a trail runner on a mountain ridge during golden hour. Dramatic lighting, dust particles, high intensity, 35mm lens.',
        created_by: 'RunnerPro AI'
      },
      {
        id: 3,
        image_url: 'https://picsum.photos/seed/run3/800/800',
        category: 'Motivacional',
        prompt: 'Minimalist sports photography, runner silhouette against a vibrant sunset, clean composition, high contrast, 8k resolution.',
        created_by: 'RunnerPro AI'
      },
      {
        id: 4,
        image_url: 'https://picsum.photos/seed/run4/800/800',
        category: 'Urbana',
        prompt: 'Street style running photography, neon lights reflecting on wet pavement, night run, motion blur, cinematic color grading.',
        created_by: 'RunnerPro AI'
      }
    ];
    setItems(mockItems);
  }, []);

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
            <div className="aspect-square relative overflow-hidden">
              <img 
                src={item.image_url} 
                alt="Art" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
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
    </div>
  );
}


