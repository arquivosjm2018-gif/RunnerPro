export interface User {
  id: number;
  name: string;
  email: string;
  plan: 'Starter' | 'Pro' | 'Elite';
  status_pagamento: string;
}

export interface Raffle {
  id: number;
  product: string;
  value_number: number;
  total_numbers: number;
  sold_numbers: number;
  status: string;
}

export interface CatalogItem {
  id: number;
  image_url: string;
  prompt: string;
  category: string;
  created_by: string;
}
