import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const runDiagnostics = async () => {
    setIsRunning(true);
    setReport('Iniciando escaneo general de errores...\n\n');
    let log = '';

    const addLog = (text: string) => {
      log += text + '\n';
      setReport(log);
    };

    try {
      // 1. Diagnosticar Variables de Conexión
      addLog('--- [1/6] ESCANEANDO CREDENCIALES ---');
      const activeUrl = (supabase as any).supabaseUrl || 'No definida';
      const activeKey = (supabase as any).supabaseKey || 'No definida';
      
      addLog(`* URL Activa de Supabase: ${activeUrl}`);
      addLog(`* Clave API Activa (Anon): ${activeKey ? activeKey.substring(0, 15) + '...' + activeKey.substring(activeKey.length - 10) : 'Nula'}`);
      addLog(`* Tipo de Clave: ${activeKey.startsWith('eyJhbGci') ? 'Legacy (JWT Tradicional)' : activeKey.startsWith('sb_') ? 'Publishable (Nueva)' : 'Desconocido'}`);
      
      if (activeUrl.includes('iikdrjygbrbqrvqblple')) {
        addLog('🟢 URL del Proyecto coincide con Asistente Universal.');
      } else {
        addLog('⚠️ Advertencia: El subdominio URL no parece coincidir con el proyecto actual.');
      }
      
      // 2. Diagnosticar Conexión Física (Ping)
      addLog('\n--- [2/6] PROBANDO CONECTIVIDAD DE RED ---');
      try {
        const pingStart = Date.now();
        const pingRes = await fetch(activeUrl, { method: 'GET', mode: 'cors' });
        const pingTime = Date.now() - pingStart;
        addLog(`🟢 Conexión de red física establecida con Supabase.`);
        addLog(`* Tiempo de respuesta (Ping): ${pingTime}ms`);
        addLog(`* Código de respuesta de Kong: ${pingRes.status} (${pingRes.statusText})`);
      } catch (err: any) {
        addLog(`🔴 FALLO DE RED FÍSICA: No se pudo contactar al servidor.`);
        addLog(`* Detalle de excepción: ${err.message || JSON.stringify(err)}`);
        addLog(`* Posible causa: Cortafuegos, Antivirus bloqueando *.supabase.co, o DNS local dañado.`);
      }

      // 3. Diagnosticar Lectura de la Tabla (SELECT)
      addLog('\n--- [3/6] PROBANDO LECTURA EN BASE DE DATOS (SELECT) ---');
      try {
        const { data, error, status } = await supabase
          .from('asistente_config')
          .select('client_id')
          .limit(1);

        if (error) {
          addLog(`🔴 ERROR AL LEER TABLA: Supabase respondió con un error.`);
          addLog(`* Código de Error: ${error.code || 'Desconocido'}`);
          addLog(`* Mensaje: ${error.message}`);
          addLog(`* Detalles: ${error.details || 'Ninguno'}`);
        } else {
          addLog(`🟢 Lectura exitosa. Tabla 'asistente_config' accesible.`);
          addLog(`* Código HTTP: ${status}`);
          addLog(`* Registros encontrados (límite 1): ${data ? data.length : 0}`);
        }
      } catch (err: any) {
        addLog(`🔴 EXCEPCIÓN AL LEER: Falló la petición select en el navegador.`);
        addLog(`* Mensaje: ${err.message || JSON.stringify(err)}`);
      }

      // 4. Diagnosticar Permisos de Escritura y Borrado (RLS / UPDATE / DELETE)
      addLog('\n--- [4/6] PROBANDO PERMISOS DE ESCRITURA Y RLS ---');
      try {
        // Hacemos un UPDATE inofensivo a un cliente ficticio para ver si la base de datos devuelve error RLS
        const { error: writeError, status: writeStatus } = await supabase
          .from('asistente_config')
          .update({ is_active: true } as any)
          .eq('client_id', 'dummy_diagnostic_test_client_9999');

        if (writeError) {
          addLog(`🔴 BLOQUEO O FALLO DE ESCRITURA (UPDATE):`);
          addLog(`* Código: ${writeError.code || 'Desconocido'}`);
          addLog(`* Mensaje: ${writeError.message}`);
          addLog(`* Detalles: ${writeError.details || 'Ninguno'}`);
          addLog(`* Explicación RLS: Si dice 'violates row-level security policy', debes verificar las políticas en tu SQL Editor.`);
        } else {
          addLog(`🟢 Prueba de escritura (UPDATE) enviada sin errores de RLS (HTTP ${writeStatus}).`);
        }

        // Hacemos un DELETE inofensivo
        const { error: deleteError, status: deleteStatus } = await supabase
          .from('asistente_config')
          .delete()
          .eq('client_id', 'dummy_diagnostic_test_client_9999');

        if (deleteError) {
          addLog(`🔴 BLOQUEO O FALLO DE BORRADO (DELETE):`);
          addLog(`* Código: ${deleteError.code || 'Desconocido'}`);
          addLog(`* Mensaje: ${deleteError.message}`);
          addLog(`* Detalles: ${deleteError.details || 'Ninguno'}`);
        } else {
          addLog(`🟢 Prueba de borrado (DELETE) enviada sin errores de RLS (HTTP ${deleteStatus}).`);
        }
      } catch (err: any) {
        addLog(`🔴 EXCEPCIÓN DE ESCRITURA: El navegador abortó el envío de datos.`);
        addLog(`* Mensaje: ${err.message || JSON.stringify(err)}`);
      }

      // 5. Diagnosticar Enlace con Celular (Android Bridge)
      addLog('\n--- [5/6] ANALIZANDO ENTORNO DISPOSITIVO ---');
      const hasAndroidInterface = typeof (window as any).AndroidInterface !== 'undefined';
      addLog(`* ¿Detecta aplicación nativa Android?: ${hasAndroidInterface ? 'SÍ (WebView de Celular)' : 'NO (Navegador de PC o Web Normal)'}`);
      
      if (hasAndroidInterface) {
        const bridge = (window as any).AndroidInterface;
        addLog('* Métodos nativos disponibles:');
        addLog(`  - getDeviceId: ${typeof bridge.getDeviceId === 'function' ? '🟢 Disponible' : '🔴 NO ENCONTRADO'}`);
        addLog(`  - updateSystemInstructions: ${typeof bridge.updateSystemInstructions === 'function' ? '🟢 Disponible' : '🔴 NO ENCONTRADO'}`);
        addLog(`  - isGoogleSessionActive: ${typeof bridge.isGoogleSessionActive === 'function' ? '🟢 Disponible' : '🔴 NO ENCONTRADO'}`);
        addLog(`  - finishAndRemoveTask: ${typeof bridge.finishAndRemoveTask === 'function' ? '🟢 Disponible' : '🔴 NO ENCONTRADO'}`);
        
        if (typeof bridge.getDeviceId === 'function') {
          try {
            const devId = bridge.getDeviceId();
            addLog(`  - ID de Celular reportado: ${devId || 'Vacío'}`);
          } catch (e: any) {
            addLog(`  - 🔴 Error al ejecutar getDeviceId(): ${e.message}`);
          }
        }
      }

      // 6. Diagnosticar Almacenamiento Local (localStorage)
      addLog('\n--- [6/6] VERIFICANDO MEMORIA DE NAVEGADOR (LOCALSTORAGE) ---');
      try {
        const storedClientId = localStorage.getItem('ava_client_id') || 'Ninguno';
        const storedClientName = localStorage.getItem('ava_client_name') || 'Ninguno';
        const storedAdminLogged = localStorage.getItem('ava_admin_logged') || 'No';
        const keysCount = localStorage.length;
        
        addLog(`* ID de Cliente Licenciado en memoria: ${storedClientId}`);
        addLog(`* Nombre de Cliente en memoria: ${storedClientName}`);
        addLog(`* Administrador Sesión Iniciada: ${storedAdminLogged}`);
        addLog(`* Total de llaves en caché: ${keysCount}`);
        addLog('🟢 Almacenamiento local listo y funcional.');
      } catch (err: any) {
        addLog(`🔴 ERROR DE CACHÉ LOCAL: ${err.message || 'Bloqueado'}`);
      }

      addLog('\n======================================');
      addLog('ESCANEO COMPLETADO CON ÉXITO.');
      addLog('HAGA CLIC EN EL BOTÓN "COPIAR REPORTE" ABAJO Y PÉGUELO EN EL CHAT.');
      addLog('======================================');

    } catch (err: any) {
      addLog(`\n🔴 ERROR CRÍTICO DURANTE EL ESCANEO GENERAL: ${err.message || JSON.stringify(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Estilos dorados premium
  const goldBorderGradient = {
    position: 'relative' as const,
    border: '1px solid transparent',
    backgroundImage: 'linear-gradient(black, black), linear-gradient(135deg, #BF953F, #FCF6BA, #B38728, #AA771C)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box'
  };

  const goldTextGradient = {
    background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const goldMetallicBg = {
    background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 30%, #B38728 70%, #AA771C 100%)',
    boxShadow: '0 4px 15px rgba(179, 135, 40, 0.3)'
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 text-white select-text">
      <div 
        style={goldBorderGradient}
        className="w-full max-w-[650px] bg-[#050508] rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_80px_rgba(191,149,63,0.3)] space-y-6 flex flex-col max-h-[90vh]"
      >
        <div className="text-center space-y-1 shrink-0">
          <span className="text-3xl block">🔍</span>
          <h2 className="text-2xl font-black uppercase tracking-widest" style={goldTextGradient}>
            Diagnosticar Errores
          </h2>
          <div className="w-32 h-[2px] mx-auto bg-gradient-to-r from-transparent via-[#BF953F] to-transparent" />
          <p className="text-[9px] text-[#FCF6BA] uppercase tracking-widest font-semibold pt-1">
            Analizador de fallas y estado del sistema
          </p>
        </div>

        {/* Textbox del Reporte */}
        <div className="flex-1 min-h-[250px] overflow-hidden flex flex-col bg-black/70 border border-[#BF953F]/15 rounded-3xl p-4">
          <textarea
            readOnly
            value={report || 'Presione el botón "Iniciar Diagnóstico" para escanear el sistema...'}
            className="w-full h-full bg-transparent border-none text-left font-mono text-[10px] sm:text-xs text-[#FCF6BA] leading-relaxed resize-none focus:outline-none overflow-y-auto"
          />
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="col-span-2 py-4 bg-zinc-900 hover:bg-zinc-800 border border-[#BF953F]/35 text-white font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest transition duration-300 transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isRunning ? 'Escaneando...' : 'Iniciar Diagnóstico'}
          </button>
          
          {report && (
            <button
              onClick={handleCopy}
              style={goldMetallicBg}
              className="py-4 text-black font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest transition duration-300 transform active:scale-95 hover:brightness-110 shadow-lg cursor-pointer"
            >
              {copied ? '¡Copiado!' : 'Copiar Reporte'}
            </button>
          )}

          <button
            onClick={onClose}
            disabled={isRunning}
            className="col-span-3 py-3 hover:bg-white/5 text-zinc-500 hover:text-white font-semibold rounded-xl text-[10px] uppercase tracking-widest transition duration-200 cursor-pointer"
          >
            Cerrar Analizador
          </button>
        </div>
      </div>
    </div>
  );
};
