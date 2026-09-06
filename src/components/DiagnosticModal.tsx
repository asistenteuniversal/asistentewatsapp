import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Credenciales conocidas para el diagnóstico (valores directos)
const KNOWN_URL = 'https://iikdrjygbrbqrvqblple.supabase.co';
const KNOWN_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpa2RyanlnYnJicXJ2cWJscGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjI3MjQsImV4cCI6MjEwMjE5ODcyNH0.UNNXmGFBS0-AfOiwOhxfawrEn6rPKYF4MxEGoXVPhZg';

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const runDiagnostics = async () => {
    setIsRunning(true);
    let log = '';

    const addLog = (text: string) => {
      log += text + '\n';
      setReport(log);
    };

    addLog('=== REPORTE DE DIAGNÓSTICO DEL SISTEMA ===');
    addLog(`Fecha: ${new Date().toLocaleString('es-MX')}`);
    addLog(`Origen: ${window.location.href}`);
    addLog('');

    try {
      // ===== 1. CREDENCIALES =====
      addLog('--- [1/6] CREDENCIALES CONFIGURADAS ---');
      addLog(`* URL Supabase: ${KNOWN_URL}`);
      addLog(`* Clave (primeros 20 chars): ${KNOWN_KEY.substring(0, 20)}...`);
      addLog(`* Tipo de clave: Legacy JWT ✓`);
      addLog(`* Variable de entorno URL: ${import.meta.env.VITE_SUPABASE_URL || '⚠ VACÍA (usando fallback directo)'}`);
      addLog(`* Variable de entorno KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Definida ✓' : '⚠ VACÍA (usando fallback directo)'}`);
      addLog('');

      // ===== 2. INTERNET GENERAL =====
      addLog('--- [2/6] CONEXIÓN A INTERNET ---');
      addLog(`* navigator.onLine: ${navigator.onLine ? '🟢 Conectado' : '🔴 Sin conexión'}`);
      addLog('');

      // ===== 3. PING AL SERVIDOR =====
      addLog('--- [3/6] PING AL SERVIDOR SUPABASE ---');
      try {
        const t0 = Date.now();
        const pingRes = await fetch(KNOWN_URL, { method: 'GET', mode: 'cors' });
        const ms = Date.now() - t0;
        addLog(`🟢 Servidor responde. Código: ${pingRes.status}. Tiempo: ${ms}ms`);
      } catch (e: any) {
        addLog(`🔴 FALLO DE PING: ${e.message}`);
        addLog(`* Causa probable: Red bloqueando supabase.co, antivirus o ISP.`);
      }
      addLog('');

      // ===== 4. LECTURA DE TABLA =====
      addLog('--- [4/6] LECTURA DE BASE DE DATOS (SELECT) ---');
      try {
        const { data, error } = await supabase
          .from('asistente_config')
          .select('client_id')
          .limit(1);

        if (error) {
          addLog(`🔴 ERROR AL LEER: Código=${error.code} Mensaje=${error.message}`);
          addLog(`* Detalles: ${error.details || 'ninguno'}`);
          addLog(`* Hint: ${error.hint || 'ninguno'}`);
        } else {
          addLog(`🟢 LECTURA EXITOSA. Registros obtenidos: ${data?.length ?? 0}`);
          if (data && data.length > 0) {
            addLog(`* Primer client_id encontrado: ${data[0].client_id}`);
          }
        }
      } catch (e: any) {
        addLog(`🔴 EXCEPCIÓN EN SELECT: ${e.message}`);
      }
      addLog('');

      // ===== 5. PRUEBA DE ESCRITURA/BORRADO =====
      addLog('--- [5/6] PRUEBA DE PERMISOS (DELETE en registro ficticio) ---');
      try {
        const { error } = await supabase
          .from('asistente_config')
          .delete()
          .eq('client_id', '__test_diagnostico_temporal_xyz__');

        if (error) {
          addLog(`🔴 ERROR DE BORRADO: Código=${error.code} Mensaje=${error.message}`);
          if (error.code === '42501') addLog('* Causa: Política RLS bloqueando DELETE. Ejecutar DISABLE ROW LEVEL SECURITY en Supabase.');
        } else {
          addLog(`🟢 DELETE ejecutado sin errores de permisos (el registro ficticio no existe, pero el comando sí pasó).`);
        }
      } catch (e: any) {
        addLog(`🔴 EXCEPCIÓN EN DELETE: ${e.message}`);
      }
      addLog('');

      // ===== 6. ENTORNO Y LOCALSTORAGE =====
      addLog('--- [6/6] ENTORNO DEL DISPOSITIVO ---');
      const hasAndroid = typeof (window as any).AndroidInterface !== 'undefined';
      addLog(`* Plataforma: ${hasAndroid ? '📱 App Android (WebView)' : '💻 Navegador de PC/Web'}`);
      addLog(`* User-Agent: ${navigator.userAgent.substring(0, 80)}...`);
      addLog(`* ava_client_id en memoria: ${localStorage.getItem('ava_client_id') || 'Ninguno'}`);
      addLog(`* ava_admin_logged: ${localStorage.getItem('ava_admin_logged') || 'No'}`);
      addLog('');

      addLog('==========================================');
      addLog('✅ ESCANEO COMPLETADO. PRESIONA "COPIAR REPORTE".');
      addLog('==========================================');

    } catch (e: any) {
      addLog(`\n🔴 ERROR CRÍTICO DURANTE EL ESCANEO: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const goldTextGradient = {
    background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
  };

  const goldMetallicBg = {
    background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 30%, #B38728 70%, #AA771C 100%)',
    boxShadow: '0 4px 15px rgba(179, 135, 40, 0.3)'
  };

  const goldBorderGradient = {
    position: 'relative' as const,
    border: '1px solid transparent',
    backgroundImage: 'linear-gradient(#050508, #050508), linear-gradient(135deg, #BF953F, #FCF6BA, #B38728, #AA771C)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box'
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 text-white select-text">
      <div
        style={goldBorderGradient}
        className="w-full max-w-[660px] rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_80px_rgba(191,149,63,0.4)] flex flex-col gap-5 max-h-[90vh]"
      >
        {/* Cabecera */}
        <div className="text-center shrink-0">
          <span className="text-3xl block mb-1">🔍</span>
          <h2 className="text-xl font-black uppercase tracking-widest" style={goldTextGradient}>
            Diagnosticar Errores
          </h2>
          <div className="w-32 h-[2px] mx-auto my-2 bg-gradient-to-r from-transparent via-[#BF953F] to-transparent" />
          <p className="text-[9px] text-[#FCF6BA] uppercase tracking-widest font-semibold">
            Analizador de fallas y estado del sistema
          </p>
        </div>

        {/* Área del reporte */}
        <div className="flex-1 min-h-[260px] bg-black/80 border border-[#BF953F]/20 rounded-2xl p-4 overflow-y-auto">
          <pre className="font-mono text-[10px] sm:text-[11px] text-[#FCF6BA] leading-relaxed whitespace-pre-wrap">
            {report || 'Presiona "Iniciar Diagnóstico" para escanear el sistema completo...'}
          </pre>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3 shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="py-4 bg-zinc-900 hover:bg-zinc-800 border border-[#BF953F]/40 text-white font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? '⏳ Escaneando...' : '▶ Iniciar Diagnóstico'}
            </button>

            <button
              onClick={handleCopy}
              disabled={!report || isRunning}
              style={report && !isRunning ? goldMetallicBg : {}}
              className="py-4 text-black font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:bg-zinc-800 disabled:text-zinc-500 cursor-pointer"
            >
              {copied ? '✅ ¡Copiado!' : '📋 Copiar Reporte'}
            </button>
          </div>

          <button
            onClick={onClose}
            disabled={isRunning}
            className="py-3 text-zinc-500 hover:text-white hover:bg-white/5 font-semibold rounded-xl text-[10px] uppercase tracking-widest transition-all duration-200 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
