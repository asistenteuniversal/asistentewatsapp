process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iikdrjygbrbqrvqblple.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpa2RyanlnYnJicXJ2cWJscGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjI3MjQsImV4cCI6MjEwMjE5ODcyNH0.UNNXmGFBS0-AfOiwOhxfawrEn6rPKYF4MxEGoXVPhZg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Consultando tabla asistente_config en Supabase directamente desde la carpeta web...");
  try {
    const { data, error } = await supabase
      .from('asistente_config')
      .select('*');
    if (error) {
      console.error("Error al consultar:", error);
    } else {
      console.log("\n====== DATOS DE LA TABLA ======");
      console.log(JSON.stringify(data, null, 2));
      console.log("===============================\n");
    }
  } catch (err) {
    console.error("Excepción:", err);
  }
}
test();
