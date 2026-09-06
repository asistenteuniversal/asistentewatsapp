process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno del archivo .env local de la carpeta web
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/(^['"]|['"]$)/g, ''); // Quitar comillas si tiene
        process.env[key] = value;
      }
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Error: Faltan credenciales de Supabase en el archivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const configPath = path.join(__dirname, 'public', 'asistente_config.json');
  if (!fs.existsSync(configPath)) {
    console.error("❌ Error: No se encontró el archivo public/asistente_config.json");
    process.exit(1);
  }

  const raw = fs.readFileSync(configPath, 'utf8');
  let data;
  try {
    const cleanedRaw = raw.trim().replace(/^\uFEFF/, '');
    data = JSON.parse(cleanedRaw);
  } catch (e) {
    console.error("❌ Error: El archivo JSON de configuración está corrupto.", e);
    process.exit(1);
  }

  const instructions = data.systemInstructions || '';

  console.log("☁️ Sincronizando instrucciones con Supabase para cliente_maestro...");
  try {
    const { error } = await supabase
      .from('asistente_config')
      .update({ system_instructions: instructions })
      .eq('client_id', 'cliente_maestro');

    if (error) {
      throw error;
    }

    console.log("✅ ¡Sincronización con base de datos de Supabase exitosa!");
  } catch (err) {
    console.warn("⚠️ Advertencia: No se pudo subir a Supabase (base de datos pausada u offline):", err.message || err);
    console.log("💡 Nota: Tus cambios se guardaron localmente en public/asistente_config.json y se subirán a Render de todos modos.");
  }
}

run();
