import React, { useState } from 'react';
import { Hash, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { generateHashtags } from '../services/geminiService';
import Markdown from 'react-markdown';
import { User } from '../types';

export default function HashtagGenerator({ user }: { user: User | null }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    type: 'Maratona',
    objective: 'Performance',
    city: 'São Paulo',
    level: 'Intermediário',
    contentType: 'Treino'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await generateHashtags(formData);
      setResult(res || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-4">
          <Hash size={32} />
        </div>
        <h1 className="text-3xl font-display font-bold text-zinc-900">Gerador de Hashtags Inteligente</h1>
        <p className="text-zinc-500 mt-2">Gere as melhores hashtags para Instagram, TikTok e Strava.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Tipo de Corrida</label>
            <select 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option>5K</option>
              <option>10K</option>
              <option>Meia Maratona</option>
              <option>Maratona</option>
              <option>Trail Run</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Cidade / Região</label>
            <input 
              type="text"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Ex: São Paulo"
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Nível</label>
              <select 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.level}
                onChange={e => setFormData({...formData, level: e.target.value})}
              >
                <option>Iniciante</option>
                <option>Intermediário</option>
                <option>Elite</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Conteúdo</label>
              <select 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.contentType}
                onChange={e => setFormData({...formData, contentType: e.target.value})}
              >
                <option>Treino</option>
                <option>Prova</option>
                <option>Motivacional</option>
                <option>Dica</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            Gerar Hashtags
          </button>
        </form>

        <div className="glass-card p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-zinc-900">Resultado</h3>
            {result && (
              <button 
                onClick={copyToClipboard}
                className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm font-bold"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            )}
          </div>
          
          <div className="flex-1 bg-zinc-50 rounded-xl p-4 overflow-y-auto border border-zinc-100">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-2">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-sm">IA está correndo para gerar suas hashtags...</p>
              </div>
            ) : result ? (
              <div className="prose prose-zinc prose-sm max-w-none">
                <Markdown>{result}</Markdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-center space-y-2">
                <Hash size={48} strokeWidth={1} />
                <p className="text-sm">Preencha os dados ao lado para gerar as hashtags estratégicas.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
