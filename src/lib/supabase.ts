
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL e chave anônima são necessárias');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Tipos para as tabelas do Supabase
export type TransactionRecord = {
  id: string;
  user_id: string;
  family_id: string;
  description: string;
  amount: number;
  date: string; // ISO format string
  category: string;
  type: 'income' | 'expense';
  created_at: string;
}

export type FamilyMemberRecord = {
  id: string;
  family_id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  created_at: string;
}

export type FamilyRecord = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}
