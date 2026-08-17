import { createClient } from '@supabase/supabase-js';

// Leer las credenciales de forma segura, usando las credenciales públicas como respaldo directo para producción
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iikdrjygbrbqrvqblple.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpa2RyanlnYnJicXJ2cWJscGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjI3MjQsImV4cCI6MjEwMjE5ODcyNH0.UNNXmGFBS0-AfOiwOhxfawrEn6rPKYF4MxEGoXVPhZg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
