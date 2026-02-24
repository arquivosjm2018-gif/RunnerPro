import React, { useState, useEffect } from 'react';
import { 
  Apple, 
  Plus, 
  Trash2, 
  Loader2, 
  Sparkles, 
  MessageCircle, 
  Instagram, 
  ExternalLink,
  Clock,
  Utensils,
  Info
} from 'lucide-react';
import { NutritionLog, Professional, User } from '../types';
import { generateNutritionStrategy } from '../services/geminiService';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function NutritionAssistant({ user }: { user: User | null }) {
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<string | null>(null);
  const [showLogForm, setShowLogForm] = useState(false);

  const [newLog, setNewLog] = useState({
    meal: 'Café da Manhã',
    time: '',
    description: '',
    calories: '',
    observation: ''
  });

  const [strategyData, setStrategyData] = useState({
    type: 'Moderado',
    distance: '10km',
    objective: 'Performance',
    time: 'Manhã',
    level: 'Intermediário',
    restrictions: 'Nenhuma'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [nRes, pRes] = await Promise.all([
      fetch('/api/nutrition'),
      fetch('/api/professionals')
    ]);
    setLogs(await nRes.json());
    setProfessionals(await pRes.json());
  };

  const addLog = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newLog,
        calories: newLog.calories ? parseInt(newLog.calories) : null
      })
    });
    setNewLog({ meal: 'Café da Manhã', time: '', description: '', calories: '', observation: '' });
    setShowLogForm(false);
    fetchData();
  };

  const deleteLog = async (id: number) => {
    await fetch(`/api/nutrition/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleGenerateStrategy = async () => {
    setLoading(true);
    try {
      const currentNutrition = logs.map(l => `- ${l.meal} (${l.time}): ${l.description}`).join('\n');
      const res = await generateNutritionStrategy({
        ...strategyData,
        currentNutrition,
        plan: user?.plan || 'Starter'
      });
      setStrategy(res || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="text-center">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
          <Apple size={32} />
        </div>
        <h1 className="text-3xl font-display font-bold text-zinc-900">Assistente Nutricional Inteligente</h1>
        <p className="text-zinc-500 mt-2">Sua alimentação sincronizada com sua performance na corrida.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Nutrition Logs */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <Utensils size={20} className="text-emerald-600" />
                Minha Alimentação
              </h3>
              <button 
                onClick={() => setShowLogForm(!showLogForm)}
                className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            <AnimatePresence>
              {showLogForm && (
                <motion.form 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={addLog}
                  className="space-y-3 mb-6 overflow-hidden"
                >
                  <select 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newLog.meal}
                    onChange={e => setNewLog({...newLog, meal: e.target.value})}
                  >
                    <option>Café da Manhã</option>
                    <option>Lanche da Manhã</option>
                    <option>Almoço</option>
                    <option>Lanche da Tarde</option>
                    <option>Pré-Treino</option>
                    <option>Pós-Treino</option>
                    <option>Jantar</option>
                    <option>Ceia</option>
                  </select>
                  <input 
                    type="time"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newLog.time}
                    onChange={e => setNewLog({...newLog, time: e.target.value})}
                    required
                  />
                  <textarea 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
                    placeholder="O que você comeu?"
                    value={newLog.description}
                    onChange={e => setNewLog({...newLog, description: e.target.value})}
                    required
                  />
                  <button type="submit" className="btn-primary w-full py-2 text-sm">Salvar Refeição</button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {logs.length > 0 ? logs.map(log => (
                <div key={log.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{log.meal}</span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Clock size={10} /> {log.time}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700">{log.description}</p>
                  <button 
                    onClick={() => deleteLog(log.id)}
                    className="absolute top-2 right-2 p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )) : (
                <div className="text-center py-8 text-zinc-400">
                  <Utensils size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Nenhuma refeição cadastrada hoje.</p>
                </div>
              )}
            </div>
          </div>

          {/* Professionals Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-zinc-900 flex items-center gap-2 px-2">
              👨‍⚕️ Profissionais Recomendados
            </h3>
            {professionals.map(pro => (
              <div key={pro.id} className="glass-card p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-zinc-900">{pro.name}</h4>
                    <p className="text-xs text-emerald-600 font-bold">{pro.specialty}</p>
                  </div>
                  {pro.instagram && (
                    <a href={`https://instagram.com/${pro.instagram}`} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-pink-500 transition-colors">
                      <Instagram size={18} />
                    </a>
                  )}
                </div>
                <p className="text-xs text-zinc-500 line-clamp-2">{pro.bio}</p>
                <a 
                  href={`https://wa.me/${pro.whatsapp}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-secondary w-full py-2 text-xs bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
                >
                  <MessageCircle size={16} />
                  Falar no WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: IA Strategy */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-600" />
              Gerar Estratégia Alimentar IA
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Tipo de Treino</label>
                <select 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={strategyData.type}
                  onChange={e => setStrategyData({...strategyData, type: e.target.value})}
                >
                  <option>Leve</option>
                  <option>Moderado</option>
                  <option>Intenso</option>
                  <option>Intervalado</option>
                  <option>Longão</option>
                  <option>Prova</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Distância</label>
                <input 
                  type="text"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: 10km"
                  value={strategyData.distance}
                  onChange={e => setStrategyData({...strategyData, distance: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Horário do Treino</label>
                <select 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={strategyData.time}
                  onChange={e => setStrategyData({...strategyData, time: e.target.value})}
                >
                  <option>Manhã</option>
                  <option>Tarde</option>
                  <option>Noite</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Restrições</label>
                <input 
                  type="text"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: Nenhuma, Vegetariano..."
                  value={strategyData.restrictions}
                  onChange={e => setStrategyData({...strategyData, restrictions: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3 mb-6">
              <Info className="text-emerald-600 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-emerald-800 leading-relaxed">
                A IA analisará sua alimentação cadastrada à esquerda para sugerir ajustes precisos baseados no seu treino.
              </p>
            </div>

            <button 
              onClick={handleGenerateStrategy}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              Montar Estratégia Alimentar
            </button>
          </div>

          <div className="glass-card p-6 min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-zinc-900">Estratégia Personalizada</h3>
              {user?.plan === 'Elite' && (
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                  MODO ELITE ATIVO
                </span>
              )}
            </div>
            
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4 py-12">
                  <Loader2 className="animate-spin" size={48} />
                  <p className="text-sm font-medium">O nutricionista IA está analisando seus dados...</p>
                </div>
              ) : strategy ? (
                <div className="prose prose-zinc prose-sm max-w-none">
                  <Markdown>{strategy}</Markdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-center space-y-2 py-12">
                  <Apple size={48} strokeWidth={1} />
                  <p className="text-sm">Sua estratégia alimentar personalizada aparecerá aqui.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
