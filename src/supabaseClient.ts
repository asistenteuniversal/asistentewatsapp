import { createClient } from '@supabase/supabase-js';

// Leer las credenciales de forma segura desde las variables de entorno locales del sistema
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Advertencia: Faltan las credenciales de Supabase en las variables de entorno.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
