
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are missing or invalid
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const isValidSupabaseConfig = supabaseUrl && 
                             supabaseAnonKey && 
                             supabaseUrl !== 'https://your-project-url.supabase.co' &&
                             supabaseAnonKey !== 'your-supabase-anon-key' &&
                             isValidUrl(supabaseUrl);

// Create a real client if environment variables are valid, otherwise create a dummy client
export const supabase = isValidSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase não configurado') }),
      insert: () => ({ data: null, error: new Error('Supabase não configurado') }),
      update: () => ({ data: null, error: new Error('Supabase não configurado') }),
      delete: () => ({ data: null, error: new Error('Supabase não configurado') }),
      eq: () => ({ data: null, error: new Error('Supabase não configurado') }),
    }),
    auth: {
      onAuthStateChange: () => ({ data: null, error: new Error('Supabase não configurado') }),
    },
  } as any;

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
