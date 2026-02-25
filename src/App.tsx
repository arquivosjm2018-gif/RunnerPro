import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Hash, 
  Image as ImageIcon, 
  Ticket, 
  Palette, 
  Calendar, 
  Tag, 
  ChevronRight,
  Menu,
  X,
  Zap,
  User as UserIcon,
  LogOut,
  Trophy,
  TrendingUp,
  Flame,
  ShieldCheck,
  Apple,
  UserCheck,
  Shield,
  Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { User } from './types';
import Dashboard from './components/Dashboard';
import HashtagGenerator from './components/HashtagGenerator';
import CaptionGenerator from './components/CaptionGenerator';
import ArtCatalog from './components/ArtCatalog';
import TrainingPlanner from './components/TrainingPlanner';
import RaffleList from './components/RaffleList';
import Promotions from './components/Promotions';

import AdminPanel from './components/AdminPanel';

import NutritionAssistant from './components/NutritionAssistant';
import ProfessionalList from './components/ProfessionalList';
import MediaLibrary from './components/MediaLibrary';

type Page = 'dashboard' | 'hashtags' | 'captions' | 'catalog' | 'training' | 'raffles' | 'promotions' | 'admin' | 'nutrition' | 'professionals' | 'media';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/user/me')
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => console.error("Erro ao carregar usuário:", err));
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin', label: 'Painel do Criador', icon: Shield },
    { id: 'hashtags', label: 'Hashtags', icon: Hash },
    { id: 'captions', label: 'Legendas IA', icon: ImageIcon },
    { id: 'nutrition', label: 'Nutrição IA', icon: Apple },
    { id: 'catalog', label: 'Catálogo de Artes', icon: Palette },
    { id: 'media', label: 'Filmes & Séries', icon: Film },
    { id: 'training', label: 'Planilha de Treino', icon: Calendar },
    { id: 'professionals', label: 'Profissionais', icon: UserCheck },
    { id: 'raffles', label: 'Rifas Ativas', icon: Ticket },
    { id: 'promotions', label: 'Super Promoções', icon: Tag },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard user={user} setPage={setActivePage} />;
      case 'hashtags': return <HashtagGenerator user={user} />;
      case 'captions': return <CaptionGenerator user={user} />;
      case 'nutrition': return <NutritionAssistant user={user} />;
      case 'catalog': return <ArtCatalog user={user} />;
      case 'media': return <MediaLibrary user={user} />;
      case 'training': return <TrainingPlanner user={user} />;
      case 'professionals': return <ProfessionalList />;
      case 'raffles': return <RaffleList user={user} />;
      case 'promotions': return <Promotions user={user} />;
      case 'admin': return <AdminPanel />;
      default: return <Dashboard user={user} setPage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-50">
      <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-[10px] text-center z-[9999] py-1 font-bold">
        DEBUG: PAINEL DO CRIADOR ATIVADO NO MENU LATERAL
      </div>
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Flame className="text-white fill-white" size={24} />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">RunnerPro AI</span>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id as Page)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  activePage === item.id 
                    ? item.id === 'admin' 
                      ? "bg-[#111111] border border-[#D4AF37] text-white shadow-lg shadow-black/20"
                      : "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {activePage === item.id && (
                  <motion.div layoutId="active-pill" className="ml-auto">
                    <ChevronRight size={16} />
                  </motion.div>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 mt-auto">
            <div className="bg-zinc-800 rounded-2xl p-4 border border-zinc-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                  <UserIcon size={20} className="text-zinc-400" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{user?.name || 'Carregando...'}</p>
                    {user?.role === 'admin' && (
                      <span className="bg-emerald-500 text-[8px] font-black px-1 rounded text-white">ADMIN</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{user?.plan || 'Starter'} Plan</p>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 text-xs text-zinc-400 hover:text-white py-2 transition-colors">
                <LogOut size={14} />
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 lg:px-8">
          {user?.role === 'admin' && (
            <div className="absolute top-0 left-0 right-0 bg-emerald-600 text-white text-[10px] py-1 px-4 text-center font-bold z-[60]">
              MODO ADMINISTRADOR ATIVO • <button onClick={() => setActivePage('admin')} className="underline">CLIQUE AQUI PARA ACESSAR O PAINEL</button>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
              <Zap size={14} className="fill-emerald-700" />
              {user?.plan === 'Elite' ? 'ACESSO ELITE' : 'UPGRADE PARA PRO'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
