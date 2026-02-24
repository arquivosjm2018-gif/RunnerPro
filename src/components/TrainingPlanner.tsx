import React, { useState } from 'react';
import { Calendar, Loader2, Sparkles, Download, CheckCircle2, Circle } from 'lucide-react';
import { generateTrainingPlan } from '../services/geminiService';
import Markdown from 'react-markdown';
import { User } from '../types';
import { cn } from '../lib/utils';

export default function TrainingPlanner({ user }: { user: User | null }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    objective: 'Sub 20min nos 5km',
    level: 'Intermediário',
    days: 4,
    timePerWorkout: 60,
    injuries: 'Nenhuma'
  });

  const [completedDays, setCompletedDays] = useState<number[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await generateTrainingPlan(formData);
      setResult(res || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: number) => {
    setCompletedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="text-center">
        <div className="inline-flex p-3 rounded-2xl bg-orange-50 text-orange-600 mb-4">
          <Calendar size={32} />
        </div>
        <h1 className="text-3xl font-display font-bold text-zinc-900">Organizador de Treinos IA</h1>
        <p className="text-zinc-500 mt-2">Planilhas personalizadas focadas no seu objetivo de performance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4 h-fit">
          <h3 className="font-bold text-zinc-900 mb-4">Configurar Plano</h3>
          
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Objetivo</label>
            <input 
              type="text"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Ex: Maratona Sub 4h"
              value={formData.objective}
              onChange={e => setFormData({...formData, objective: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Nível Atual</label>
            <select 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={formData.level}
              onChange={e => setFormData({...formData, level: e.target.value})}
            >
              <option>Iniciante</option>
              <option>Intermediário</option>
              <option>Avançado</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Dias/Semana</label>
              <input 
                type="number"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.days}
                onChange={e => setFormData({...formData, days: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Minutos/Treino</label>
              <input 
                type="number"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.timePerWorkout}
                onChange={e => setFormData({...formData, timePerWorkout: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            Gerar Planilha
          </button>
        </form>

        <div className="lg:col-span-2 space-y-6">
          {/* Progress Tracker */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-zinc-900">Progresso da Semana</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                {completedDays.length} / {formData.days} Concluídos
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={cn(
                    "flex-1 min-w-[60px] aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border",
                    completedDays.includes(i) 
                      ? "bg-emerald-600 border-emerald-600 text-white" 
                      : "bg-white border-zinc-200 text-zinc-400 hover:border-emerald-300"
                  )}
                >
                  <span className="text-[10px] font-bold uppercase">Dia {i + 1}</span>
                  {completedDays.includes(i) ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
              ))}
            </div>
          </div>

          {/* Training Plan Result */}
          <div className="glass-card p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-zinc-900">Sua Planilha</h3>
              {result && (
                <button className="text-zinc-500 hover:text-emerald-600 flex items-center gap-1 text-sm font-bold">
                  <Download size={16} />
                  PDF
                </button>
              )}
            </div>
            
            <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4 py-12">
                  <Loader2 className="animate-spin" size={48} />
                  <p className="text-sm font-medium">O treinador está montando seu plano...</p>
                </div>
              ) : result ? (
                <div className="prose prose-zinc prose-sm max-w-none">
                  <Markdown>{result}</Markdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-center space-y-2 py-12">
                  <Calendar size={48} strokeWidth={1} />
                  <p className="text-sm">Gere sua planilha para começar a treinar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


