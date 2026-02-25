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
  UserPlus,
  Tag,
  Link as LinkIcon,
  Loader2,
  Film,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { User, CatalogItem, Raffle, Professional, Promotion, Media } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'catalog' | 'raffles' | 'professionals' | 'promotions' | 'media'>('users');
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  const [newArt, setNewArt] = useState({ 
    title: '', 
    image_url: '', 
    image_path: '',
    prompt: '', 
    description: '', 
    category: 'Elite', 
    style: 'Cinematic', 
    min_plan: 'Pro' as any, 
    status: 'Ativo' as any 
  });
  const [newRaffle, setNewRaffle] = useState({ 
    product: '', 
    description: '', 
    value_number: 10, 
    total_numbers: 100, 
    draw_date: '', 
    status: 'Ativo' as any, 
    image_url: '',
    image_path: ''
  });
  const [newPro, setNewPro] = useState({ 
    name: '', 
    specialty: '', 
    bio: '', 
    whatsapp: '', 
    instagram: '', 
    active: true, 
    foto_url: '',
    foto_path: ''
  });
  const [newPromo, setNewPromo] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    category: 'Tênis',
    link: '',
    image_url: '',
    active: true
  });
  const [newMedia, setNewMedia] = useState({
    titulo: '',
    tipo: 'Filme',
    categoria: 'Corrida',
    sinopse: '',
    plataforma: '',
    ano: new Date().getFullYear(),
    imagem_url: '',
    link_externo: ''
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    plan: 'Starter',
    role: 'user'
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string, callback: (data: {url: string, path: string}) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Arquivo muito grande! Máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64, filename: file.name, type })
          });
          const data = await res.json();
          if (data.url) {
            callback(data);
          } else {
            throw new Error("Upload failed");
          }
        } catch (err) {
          console.error("Upload failed", err);
          alert("Erro ao fazer upload da imagem.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchData = async () => {
    const [uRes, cRes, rRes, pRes, prRes, mRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/catalog'),
      fetch('/api/raffles'),
      fetch('/api/admin/professionals'),
      fetch('/api/admin/promotions'),
      fetch('/api/admin/media')
    ]);
    setUsers(await uRes.json());
    setCatalog(await cRes.json());
    setRaffles(await rRes.json());
    setProfessionals(await pRes.json());
    setPromotions(await prRes.json());
    setMedia(await mRes.json());
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
    setNewArt({ 
      title: '', 
      image_url: '', 
      image_path: '',
      prompt: '', 
      description: '', 
      category: 'Elite', 
      style: 'Cinematic', 
      min_plan: 'Pro', 
      status: 'Ativo' 
    });
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
    setNewRaffle({ 
      product: '', 
      description: '', 
      value_number: 10, 
      total_numbers: 100, 
      draw_date: '', 
      status: 'Ativo', 
      image_url: '',
      image_path: ''
    });
    fetchData();
  };

  const addPro = async () => {
    await fetch('/api/admin/professionals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPro)
    });
    setNewPro({ name: '', specialty: '', bio: '', whatsapp: '', instagram: '', active: true, foto_url: '', foto_path: '' });
    fetchData();
  };

  const deletePro = async (id: number) => {
    await fetch(`/api/admin/professionals/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const fetchPromoMetadata = async (url: string) => {
    if (!url || !url.startsWith('http')) return;
    setIsFetchingMetadata(true);
    try {
      const res = await fetch('/api/utils/fetch-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.title || data.image) {
        setNewPromo(prev => ({
          ...prev,
          title: data.title || prev.title,
          description: data.description || prev.description,
          image_url: data.image || prev.image_url
        }));
      }
    } catch (err) {
      console.error("Failed to fetch metadata", err);
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const addPromo = async () => {
    await fetch('/api/admin/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPromo)
    });
    setNewPromo({
      title: '',
      description: '',
      price: '',
      original_price: '',
      category: 'Tênis',
      link: '',
      image_url: '',
      active: true
    });
    fetchData();
  };

  const deletePromo = async (id: number) => {
    await fetch(`/api/admin/promotions/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const addMedia = async () => {
    await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newMedia, role: 'admin' })
    });
    setNewMedia({
      titulo: '',
      tipo: 'Filme',
      categoria: 'Corrida',
      sinopse: '',
      plataforma: '',
      ano: new Date().getFullYear(),
      imagem_url: '',
      link_externo: ''
    });
    fetchData();
  };

  const approveMedia = async (id: number) => {
    await fetch(`/api/admin/media/approve/${id}`, { method: 'POST' });
    fetchData();
  };

  const deleteMedia = async (id: number) => {
    await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setNewUser({ name: '', email: '', plan: 'Starter', role: 'user' });
        setShowUserForm(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao adicionar usuário");
      }
    } catch (err) {
      console.error("Error adding user:", err);
    } finally {
      setIsAddingUser(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-900 flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" size={32} />
            Interface do Criador
          </h1>
          <p className="text-zinc-500 mt-1">Administre usuários, catálogo de artes, rifas e profissionais.</p>
        </div>
        <button onClick={fetchData} className="btn-secondary py-2 px-4 text-sm">
          <RefreshCw size={16} />
          Atualizar Dados
        </button>
      </header>

      <div className="flex gap-2 border-b border-zinc-200 pb-px overflow-x-auto">
        {[
          { id: 'users', label: 'Usuários', icon: Users },
          { id: 'catalog', label: 'Catálogo', icon: Palette },
          { id: 'raffles', label: 'Rifas', icon: Ticket },
          { id: 'professionals', label: 'Profissionais', icon: ShieldCheck },
          { id: 'promotions', label: 'Promoções', icon: Tag },
          { id: 'media', label: 'Filmes & Séries', icon: Film },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap",
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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-zinc-900">Gestão de Alunos</h3>
              <button 
                onClick={() => setShowUserForm(!showUserForm)}
                className="btn-primary"
              >
                <UserPlus size={18} />
                Adicionar Usuário
              </button>
            </div>

            {showUserForm && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 border-emerald-100"
              >
                <form onSubmit={addUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Nome do Cliente</label>
                    <input 
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: João Silva"
                      value={newUser.name}
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">E-mail da Compra</label>
                    <input 
                      required
                      type="email"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="exemplo@email.com"
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Plano Adquirido</label>
                    <select 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newUser.plan}
                      onChange={e => setNewUser({...newUser, plan: e.target.value})}
                    >
                      <option>Starter</option>
                      <option>Pro</option>
                      <option>Elite</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="submit" 
                      disabled={isAddingUser}
                      className="flex-1 btn-primary py-3"
                    >
                      {isAddingUser ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Cadastrar
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowUserForm(false)}
                      className="px-4 py-3 bg-zinc-100 text-zinc-500 rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

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
                  placeholder="Título da Arte"
                  value={newArt.title}
                  onChange={e => setNewArt({...newArt, title: e.target.value})}
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
                <input 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Estilo (ex: Cinematic, 3D, Minimalist)"
                  value={newArt.style}
                  onChange={e => setNewArt({...newArt, style: e.target.value})}
                />
                <select 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newArt.min_plan}
                  onChange={e => setNewArt({...newArt, min_plan: e.target.value as any})}
                >
                  <option value="Starter">Plano Mínimo: Starter</option>
                  <option value="Pro">Plano Mínimo: Pro</option>
                  <option value="Elite">Plano Mínimo: Elite</option>
                </select>
                <textarea 
                  className="md:col-span-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[60px]"
                  placeholder="Descrição da Arte"
                  value={newArt.description}
                  onChange={e => setNewArt({...newArt, description: e.target.value})}
                />
                <textarea 
                  className="md:col-span-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                  placeholder="Prompt Completo"
                  value={newArt.prompt}
                  onChange={e => setNewArt({...newArt, prompt: e.target.value})}
                />
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Imagem da Arte (Upload)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'catalog', (data) => setNewArt({...newArt, image_url: data.url, image_path: data.path}))}
                      className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    {newArt.image_url && (
                      <img src={newArt.image_url} className="w-12 h-12 rounded-lg object-cover border border-zinc-200" />
                    )}
                  </div>
                </div>
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
                    <p className="text-sm font-bold truncate">{item.title || item.category}</p>
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
                  placeholder="Nome do Produto"
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
                  placeholder="Quantidade de Números"
                  value={newRaffle.total_numbers}
                  onChange={e => setNewRaffle({...newRaffle, total_numbers: parseInt(e.target.value)})}
                />
                <input 
                  type="date"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newRaffle.draw_date}
                  onChange={e => setNewRaffle({...newRaffle, draw_date: e.target.value})}
                />
                <select 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newRaffle.status}
                  onChange={e => setNewRaffle({...newRaffle, status: e.target.value as any})}
                >
                  <option value="Ativo">Status: Ativa</option>
                  <option value="Inativo">Status: Inativa</option>
                </select>
                <div className="md:col-span-3">
                  <textarea 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[60px]"
                    placeholder="Descrição da Rifa"
                    value={newRaffle.description}
                    onChange={e => setNewRaffle({...newRaffle, description: e.target.value})}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Foto do Produto (Upload)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'raffle', (data) => setNewRaffle({...newRaffle, image_url: data.url, image_path: data.path}))}
                      className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    {newRaffle.image_url && (
                      <img src={newRaffle.image_url} className="w-12 h-12 rounded-lg object-cover border border-zinc-200" />
                    )}
                  </div>
                </div>
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
                    <div className="flex gap-4">
                      <img src={raffle.image_url} className="w-12 h-12 rounded-lg object-cover border border-zinc-200" />
                      <div>
                        <h4 className="font-bold text-zinc-900">{raffle.product}</h4>
                        <p className="text-xs text-zinc-500">R$ {raffle.value_number} / número</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-lg",
                      raffle.status === 'Ativo' ? "text-emerald-600 bg-emerald-50" : "text-zinc-400 bg-zinc-100"
                    )}>
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

        {activeTab === 'professionals' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-emerald-600" />
                Cadastrar Profissional Parceiro
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nome Completo"
                  value={newPro.name}
                  onChange={e => setNewPro({...newPro, name: e.target.value})}
                />
                <input 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Especialidade (ex: Nutricionista Esportivo)"
                  value={newPro.specialty}
                  onChange={e => setNewPro({...newPro, specialty: e.target.value})}
                />
                <input 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="WhatsApp (ex: 5511999999999)"
                  value={newPro.whatsapp}
                  onChange={e => setNewPro({...newPro, whatsapp: e.target.value})}
                />
                <input 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Instagram (sem @)"
                  value={newPro.instagram}
                  onChange={e => setNewPro({...newPro, instagram: e.target.value})}
                />
                <textarea 
                  className="md:col-span-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
                  placeholder="Breve biografia/descrição"
                  value={newPro.bio}
                  onChange={e => setNewPro({...newPro, bio: e.target.value})}
                />
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Foto do Profissional (Upload)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'pro', (data) => setNewPro({...newPro, foto_url: data.url, foto_path: data.path}))}
                      className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    {newPro.foto_url && (
                      <img src={newPro.foto_url} className="w-12 h-12 rounded-lg object-cover border border-zinc-200" />
                    )}
                  </div>
                </div>
              </div>
              <button onClick={addPro} className="btn-primary w-full md:w-auto">
                <Save size={18} />
                Cadastrar Profissional
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {professionals.map(pro => (
                <div key={pro.id} className="glass-card p-6 flex items-start justify-between">
                  <div className="flex gap-4">
                    <img src={pro.foto_url} className="w-12 h-12 rounded-lg object-cover border border-zinc-200" />
                    <div>
                      <h4 className="font-bold text-zinc-900">{pro.name}</h4>
                      <p className="text-xs text-emerald-600 font-bold">{pro.specialty}</p>
                      <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{pro.bio}</p>
                    </div>
                  </div>
                  <button onClick={() => deletePro(pro.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-emerald-600" />
                Cadastrar Nova Super Promoção
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Link de Afiliado (Importação Automática)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Cole o link aqui (ex: https://netshoes.com.br/...)"
                        value={newPromo.link}
                        onChange={e => setNewPromo({...newPromo, link: e.target.value})}
                      />
                      <LinkIcon className="absolute left-3 top-3.5 text-zinc-400" size={18} />
                    </div>
                    <button 
                      onClick={() => fetchPromoMetadata(newPromo.link)}
                      disabled={isFetchingMetadata || !newPromo.link}
                      className="btn-secondary px-6 whitespace-nowrap disabled:opacity-50"
                    >
                      {isFetchingMetadata ? <Loader2 className="animate-spin" size={18} /> : 'Importar Dados'}
                    </button>
                  </div>
                </div>

                <input 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Título da Promoção"
                  value={newPromo.title}
                  onChange={e => setNewPromo({...newPromo, title: e.target.value})}
                />
                <select 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newPromo.category}
                  onChange={e => setNewPromo({...newPromo, category: e.target.value})}
                >
                  <option>Tênis</option>
                  <option>Acessórios</option>
                  <option>Suplementos</option>
                  <option>Vestuário</option>
                  <option>Eletrônicos</option>
                </select>
                <input 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Preço com Desconto (ex: R$ 1.299,00)"
                  value={newPromo.price}
                  onChange={e => setNewPromo({...newPromo, price: e.target.value})}
                />
                <input 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Preço Original (ex: R$ 1.899,00)"
                  value={newPromo.original_price}
                  onChange={e => setNewPromo({...newPromo, original_price: e.target.value})}
                />
                <textarea 
                  className="md:col-span-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
                  placeholder="Descrição curta da oferta"
                  value={newPromo.description}
                  onChange={e => setNewPromo({...newPromo, description: e.target.value})}
                />
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Miniatura do Produto</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
                        placeholder="URL da Imagem (ou use o upload abaixo)"
                        value={newPromo.image_url}
                        onChange={e => setNewPromo({...newPromo, image_url: e.target.value})}
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'promo', (data) => setNewPromo({...newPromo, image_url: data.url}))}
                        className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                    </div>
                    {newPromo.image_url && (
                      <img src={newPromo.image_url} className="w-24 h-24 rounded-2xl object-cover border border-zinc-200 shadow-sm" />
                    )}
                  </div>
                </div>
              </div>
              <button onClick={addPromo} className="btn-primary w-full md:w-auto">
                <Save size={18} />
                Publicar Promoção
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promotions.map(promo => (
                <div key={promo.id} className="glass-card p-4 flex items-start gap-4">
                  <img src={promo.image_url} className="w-20 h-20 rounded-xl object-cover border border-zinc-100" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-bold uppercase rounded">
                        {promo.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-zinc-900 text-sm truncate">{promo.title}</h4>
                    <p className="text-xs text-zinc-500 font-bold">{promo.price}</p>
                    <div className="flex gap-2 mt-2">
                      <a href={promo.link} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-zinc-50 text-zinc-400 hover:text-emerald-600 rounded-lg border border-zinc-100 transition-colors">
                        <LinkIcon size={14} />
                      </a>
                      <button onClick={() => deletePromo(promo.id)} className="p-1.5 bg-zinc-50 text-zinc-400 hover:text-red-500 rounded-lg border border-zinc-100 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-emerald-600" />
                Cadastrar Novo Filme ou Série
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Título"
                  value={newMedia.titulo}
                  onChange={e => setNewMedia({...newMedia, titulo: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newMedia.tipo}
                    onChange={e => setNewMedia({...newMedia, tipo: e.target.value})}
                  >
                    <option>Filme</option>
                    <option>Série</option>
                    <option>Documentário</option>
                  </select>
                  <select 
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newMedia.categoria}
                    onChange={e => setNewMedia({...newMedia, categoria: e.target.value})}
                  >
                    <option>Corrida</option>
                    <option>Motivacional</option>
                    <option>Disciplina</option>
                  </select>
                </div>
                <input 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Plataforma (ex: Netflix)"
                  value={newMedia.plataforma}
                  onChange={e => setNewMedia({...newMedia, plataforma: e.target.value})}
                />
                <input 
                  type="number"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ano"
                  value={newMedia.ano}
                  onChange={e => setNewMedia({...newMedia, ano: parseInt(e.target.value)})}
                />
                <textarea 
                  className="md:col-span-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                  placeholder="Sinopse"
                  value={newMedia.sinopse}
                  onChange={e => setNewMedia({...newMedia, sinopse: e.target.value})}
                />
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Capa do Conteúdo</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
                        placeholder="URL da Imagem"
                        value={newMedia.imagem_url}
                        onChange={e => setNewMedia({...newMedia, imagem_url: e.target.value})}
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'media', (data) => setNewMedia({...newMedia, imagem_url: data.url}))}
                        className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                    </div>
                    {newMedia.imagem_url && (
                      <img src={newMedia.imagem_url} className="w-16 h-24 rounded-xl object-cover border border-zinc-200 shadow-sm" />
                    )}
                  </div>
                </div>
              </div>
              <button onClick={addMedia} className="btn-primary w-full md:w-auto">
                <Save size={18} />
                Salvar Conteúdo
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <RefreshCw size={20} className="text-emerald-600" />
                Sugestões e Conteúdos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {media.map(item => (
                  <div key={item.id} className={cn(
                    "glass-card p-4 flex items-start gap-4",
                    item.status === 'pendente' && "border-amber-200 bg-amber-50/30"
                  )}>
                    <img src={item.imagem_url} className="w-16 h-24 rounded-xl object-cover border border-zinc-100" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "px-1.5 py-0.5 text-[8px] font-bold uppercase rounded",
                          item.status === 'ativo' ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {item.status}
                        </span>
                        <span className="text-[8px] font-bold text-zinc-400 uppercase">{item.tipo}</span>
                      </div>
                      <h4 className="font-bold text-zinc-900 text-sm truncate">{item.titulo}</h4>
                      <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1">{item.sinopse}</p>
                      <div className="flex gap-2 mt-3">
                        {item.status === 'pendente' && (
                          <button 
                            onClick={() => approveMedia(item.id)}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg border border-emerald-100 transition-colors"
                            title="Aprovar"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteMedia(item.id)}
                          className="p-1.5 bg-zinc-50 text-zinc-400 hover:text-red-500 rounded-lg border border-zinc-100 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
