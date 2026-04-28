import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Inicialização com fallback para o build do Vercel
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("AVISO: Chaves do Supabase não encontradas no ambiente. O build continuará, mas a conexão falhará em runtime.");
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');





