process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iikdrjygbrbqrvqblple.supabase.co';
const supabaseAnonKey = 'sb_publishable_V2NLoA-2EuC28cjtUv2m9A_nFw-9KxC';

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
