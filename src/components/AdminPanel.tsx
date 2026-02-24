import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Palette, 
  Ticket, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Save,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { User, CatalogItem, Raffle } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'catalog' | 'raffles'>('users');

  const [newArt, setNewArt] = useState({ image_url: '', prompt: '', category: 'Elite' });
  const [newRaffle, setNewRaffle] = useState({ product: '', value_number: 10, total_numbers: 100 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [uRes, cRes, rRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/catalog'),
      fetch('/api/raffles')
    ]);
    setUsers(await uRes.json());
    setCatalog(await cRes.json());
    setRaffles(await rRes.json());
  };

  const updatePlan = async (userId: number, plan: string) => {
    await fetch(`/api/admin/users/${userId}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    });
    fetchData();
  };

  const addArt = async () => {
    await fetch('/api/admin/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newArt, created_by: 'Admin' })
    });
    setNewArt({ image_url: '', prompt: '', category: 'Elite' });
    fetchData();
  };

  const deleteArt = async (id: number) => {
    await fetch(`/api/admin/catalog/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const addRaffle = async () => {
    await fetch('/api/admin/raffles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRaffle)
    });
    setNewRaffle({ product: '', value_number: 10, total_numbers: 100 });
    fetchData();
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-900 flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" size={32} />
            Interface do Criador
          </h1>
          <p className="text-zinc-500 mt-1">Administre usuários, catálogo de artes e rifas ativas.</p>
        </div>
        <button onClick={fetchData} className="btn-secondary py-2 px-4 text-sm">
          <RefreshCw size={16} />
          Atualizar Dados
        </button>
      </header>

      <div className="flex gap-2 border-b border-zinc-200 pb-px">
        {[
          { id: 'users', label: 'Usuários', icon: Users },
          { id: 'catalog', label: 'Catálogo', icon: Palette },
          { id: 'raffles', label: 'Rifas', icon: Ticket },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2",
              activeTab === tab.id 
                ? "border-emerald-600 text-emerald-600" 
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'users' && (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">E-mail</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Plano Atual</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Ações de Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900">{user.name}</td>
                    <td className="px-6 py-4 text-zinc-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                        user.plan === 'Elite' ? "bg-purple-100 text-purple-700" :
                        user.plan === 'Pro' ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-600"
                      )}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {['Starter', 'Pro', 'Elite'].map(p => (
                          <button
                            key={p}
                            onClick={() => updatePlan(user.id, p)}
                            disabled={user.plan === p}
                            className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                              user.plan === p 
                                ? "bg-emerald-600 text-white" 
                                : "bg-white border border-zinc-200 text-zinc-500 hover:border-emerald-500 hover:text-emerald-600"
                            )}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-emerald-600" />
                Adicionar Nova Arte ao Carro Forte
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="URL da Imagem (Picsum ou similar)"
                  value={newArt.image_url}
                  onChange={e => setNewArt({...newArt, image_url: e.target.value})}
                />
                <select 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newArt.category}
                  onChange={e => setNewArt({...newArt, category: e.target.value})}
                >
                  <option>Elite</option>
                  <option>Trail</option>
                  <option>Urbana</option>
                  <option>Motivacional</option>
                </select>
                <textarea 
                  className="md:col-span-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                  placeholder="Prompt Original da Arte"
                  value={newArt.prompt}
                  onChange={e => setNewArt({...newArt, prompt: e.target.value})}
                />
              </div>
              <button onClick={addArt} className="btn-primary w-full md:w-auto">
                <Save size={18} />
                Salvar no Catálogo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalog.map(item => (
                <div key={item.id} className="glass-card p-4 flex items-center gap-4">
                  <img src={item.image_url} className="w-16 h-16 rounded-lg object-cover" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{item.category}</p>
                    <p className="text-xs text-zinc-500 truncate">{item.prompt}</p>
                  </div>
                  <button onClick={() => deleteArt(item.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'raffles' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-emerald-600" />
                Lançar Nova Rifa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Produto da Rifa"
                  value={newRaffle.product}
                  onChange={e => setNewRaffle({...newRaffle, product: e.target.value})}
                />
                <input 
                  type="number"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Valor por Número"
                  value={newRaffle.value_number}
                  onChange={e => setNewRaffle({...newRaffle, value_number: parseFloat(e.target.value)})}
                />
                <input 
                  type="number"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Total de Números"
                  value={newRaffle.total_numbers}
                  onChange={e => setNewRaffle({...newRaffle, total_numbers: parseInt(e.target.value)})}
                />
              </div>
              <button onClick={addRaffle} className="btn-primary w-full md:w-auto">
                <Save size={18} />
                Criar Rifa
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {raffles.map(raffle => (
                <div key={raffle.id} className="glass-card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-zinc-900">{raffle.product}</h4>
                      <p className="text-xs text-zinc-500">R$ {raffle.value_number} / número</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      {raffle.sold_numbers} / {raffle.total_numbers}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Ajustar Vendas Manuais</label>
                    <div className="flex gap-2">
                      <input 
                        type="range" 
                        min="0" 
                        max={raffle.total_numbers} 
                        value={raffle.sold_numbers}
                        onChange={async (e) => {
                          const val = parseInt(e.target.value);
                          await fetch(`/api/admin/raffles/${raffle.id}/sold`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sold_numbers: val })
                          });
                          fetchData();
                        }}
                        className="flex-1 accent-emerald-600"
                      />
                      <span className="text-sm font-bold text-zinc-700 w-8 text-right">{raffle.sold_numbers}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
