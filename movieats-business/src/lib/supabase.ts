import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Inicialização com verificação de chaves
export const supabase = (() => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("ERRO: Variáveis de ambiente do Supabase ausentes no .env.local");
      return null;
    }
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("ERRO: Falha ao inicializar Supabase", e);
    return null;
  }
})() as any;





