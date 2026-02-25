export interface User {
  id: number;
  name: string;
  email: string;
  plan: 'Starter' | 'Pro' | 'Elite';
  role: 'user' | 'admin';
  status_pagamento: string;
}

export interface Raffle {
  id: number;
  product: string;
  description: string;
  value_number: number;
  total_numbers: number;
  sold_numbers: number;
  draw_date: string;
  status: 'Ativo' | 'Inativo';
  image_url?: string;
  image_path?: string;
  thumbnail_url?: string;
}

export interface CatalogItem {
  id: number;
  title: string;
  image_url: string;
  image_path?: string;
  preview_blur_url?: string;
  prompt: string;
  description: string;
  category: string;
  style: string;
  min_plan: 'Starter' | 'Pro' | 'Elite';
  status: 'Ativo' | 'Inativo';
  created_by: string;
}

export interface NutritionLog {
  id: number;
  user_id: number;
  meal: string;
  time: string;
  description: string;
  calories?: number;
  observation?: string;
}

export interface Professional {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  whatsapp: string;
  instagram?: string;
  foto_url?: string;
  foto_path?: string;
  active: number;
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
  price: string;
  original_price: string;
  category: string;
  link: string;
  image_url: string;
  active: number;
}

export interface Media {
  id: number;
  tipo: 'Filme' | 'Série' | 'Documentário';
  titulo: string;
  categoria: 'Corrida' | 'Motivacional' | 'Disciplina';
  sinopse: string;
  plataforma: string;
  ano: number;
  imagem_url: string;
  link_externo?: string;
  criado_por: string;
  status: 'ativo' | 'pendente';
  aprovado_por_admin: number;
}
