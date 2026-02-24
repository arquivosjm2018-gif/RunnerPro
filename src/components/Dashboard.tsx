import React from 'react';
import { User } from '../types';
import { 
  TrendingUp, 
  Users, 
  Ticket, 
  Palette, 
  ArrowUpRight, 
  Flame,
  Zap,
  Calendar,
  Hash
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  user: User | null;
  setPage: (page: any) => void;
}

export default function Dashboard({ user, setPage }: DashboardProps) {
  const stats = [
    { label: 'Treinos Concluídos', value: '12', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Hashtags Geradas', value: '142', icon: Hash, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Legendas Criadas', value: '28', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Rifas Ativas', value: '3', icon: Ticket, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const quickActions = [
    { id: 'hashtags', label: 'Gerar Hashtags', description: 'Otimize seu alcance social', icon: Hash },
    { id: 'captions', label: 'Legenda por Foto', description: 'IA analisa sua performance', icon: Zap },
    { id: 'training', label: 'Ver Planilha', description: 'Próximos treinos da semana', icon: Calendar },
    { id: 'catalog', label: 'Catálogo de Artes', icon: Palette, description: 'Prompts exclusivos' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-display font-bold text-zinc-900">Olá, {user?.name?.split(' ')[0] || 'Corredor'}! 👋</h1>
        <p className="text-zinc-500 mt-1">Bem-vindo ao seu centro de performance RunnerPro AI.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                +12% <TrendingUp size={12} />
              </span>
            </div>
            <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-display font-bold text-zinc-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-display font-bold text-zinc-900 flex items-center gap-2">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => setPage(action.id)}
                className="group glass-card p-6 text-left hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-zinc-50 text-zinc-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <action.icon size={24} />
                  </div>
                  <ArrowUpRight size={20} className="text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h3 className="mt-4 font-bold text-zinc-900">{action.label}</h3>
                <p className="text-sm text-zinc-500">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Plan Status */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-zinc-900">Seu Plano</h2>
          <div className="bg-zinc-900 rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-bold tracking-widest uppercase">
                  {user?.plan || 'Starter'}
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold mb-2">RunnerPro {user?.plan === 'Elite' ? 'Elite' : 'Pro'}</h3>
              <p className="text-zinc-400 text-sm mb-6">
                {user?.plan === 'Elite' 
                  ? 'Você tem acesso total a todas as ferramentas e artes exclusivas.' 
                  : 'Desbloqueie legendas ilimitadas e o catálogo completo de artes.'}
              </p>
              {user?.plan !== 'Elite' && (
                <button className="w-full bg-white text-zinc-900 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors">
                  Fazer Upgrade Agora
                </button>
              )}
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -ml-12 -mb-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
