import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Inicialização explícita para o build do Vercel
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("ERRO CRÍTICO: Chaves do Supabase não encontradas no ambiente de produção (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY). O build falhou para evitar erros em runtime.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);





