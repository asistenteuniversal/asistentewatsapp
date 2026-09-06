import { createClient } from '@supabase/supabase-js';

// Credenciales oficiales de Supabase para el proyecto ianeoavan (asistentewatsapp)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lcweuigpzktekwduqvvb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_FR1aPq7-iw_m-2PEJrT5MQ_HwBbb2Kx';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
