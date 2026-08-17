import { createClient } from '@supabase/supabase-js';

// Leer las credenciales de forma segura, usando las credenciales públicas como respaldo directo para producción
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iikdrjygbrbqrvqblple.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_V2NLoA-2EuC28cjtUv2m9A_nFw-9KxC';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
