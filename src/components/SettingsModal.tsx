import React from 'react';
import { X, Eye } from 'lucide-react';
import { AppSettings } from '../types';
import { supabase } from '../supabaseClient';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (newInstructions: string) => Promise<void>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  errorLogs?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  settings,
  setSettings,
  errorLogs,
}) => {
  if (!isOpen) return null;

  const handleSave = async () => {
    if (onSave) {
      await onSave(settings.systemInstructions || '');
    }
    onClose();
  };

  const handleShowStudio = () => {
    if ((window as any).AndroidInterface && (window as any).AndroidInterface.showStudio) {
      try {
        (window as any).AndroidInterface.showStudio(true);
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("Esta opción solo está disponible dentro de la aplicación de celular.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020205]/85 backdrop-blur-xl flex items-center justify-center p-3 font-sans text-white">
      <div className="w-full max-w-sm bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 sm:p-5 shadow-[0_0_60px_rgba(6,182,212,0.2)] space-y-3.5 relative max-h-[94vh] overflow-y-auto">
        {/* Header - Botón del Ojito a la izquierda y Botón de cierre X a la derecha */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <button
            type="button"
            onClick={handleShowStudio}
            className="p-2 rounded-xl bg-black/70 border border-[#d4af37]/40 text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.15)] active:scale-95 transition hover:bg-[#d4af37]/10 flex items-center justify-center cursor-pointer"
            title="Mostrar Google Studio"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-3 text-xs">
          {/* System Instructions (Prompt) */}
          <div className="space-y-1">
            <label className="text-zinc-200 font-bold font-sans text-[11px] uppercase tracking-wider block">
              COMPORTAMIENTO ASISTENTE:
            </label>
            <textarea
              value={settings.systemInstructions || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, systemInstructions: e.target.value }))
              }
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-cyan-200 outline-none focus:border-cyan-500/80 font-sans text-xs backdrop-blur-md resize-none leading-relaxed"
              placeholder="Ejemplo: Eres un asistente servicial..."
            />
          </div>

          {/* Memoria de Conversacion (Prompt de Recuerdos) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap pb-0.5">
              <label className="text-zinc-200 font-bold text-[11px] uppercase tracking-wider">
                MEMORIA DE CONVERSACION:
              </label>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que deseas borrar toda la memoria de conversación local?')) {
                    setSettings((prev) => ({
                      ...prev,
                      systemMemory: '',
                      memorySaveDate: new Date().toDateString()
                    }));
                  }
                }}
                className="px-2 py-0.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-lg text-[8.5px] uppercase tracking-wider transition duration-300"
              >
                BORRADO DE MEMORIA DE CONVERSACION
              </button>
            </div>
            <textarea
              value={settings.systemMemory || ''}
              onChange={(e) => {
                const text = e.target.value;
                setSettings((prev) => ({ 
                  ...prev, 
                  systemMemory: text,
                  memorySaveDate: new Date().toDateString()
                }));
              }}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-cyan-200 outline-none focus:border-cyan-500/80 font-sans text-xs backdrop-blur-md resize-none leading-relaxed"
              placeholder="Escribe recuerdos de la conversación aquí..."
            />
          </div>

          {/* Conexión de Memoria Celular (Vincular / Autónomo) */}
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md font-sans">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-zinc-100 font-sans text-xs">
                Sincronización de Memoria:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    syncMemoryEnabled: prev.syncMemoryEnabled === undefined ? false : !prev.syncMemoryEnabled
                  }));
                }}
                className={`px-2.5 py-1 font-black rounded-xl text-[9px] uppercase tracking-wider transition duration-300 border cursor-pointer ${
                  settings.syncMemoryEnabled === false
                    ? 'bg-red-950/30 text-red-400 border-red-500/40 hover:bg-red-950/40'
                    : 'bg-green-950/30 text-green-300 border-green-500/40 hover:bg-green-950/40'
                }`}
              >
                {settings.syncMemoryEnabled === false ? '🔴 DESCONECTADO' : '🟢 CONECTADO (VINCULADO)'}
              </button>
            </div>
          </div>

          {/* ── BLOQUE LEGO INDEPENDIENTE: HISTORIAL DE FALLAS (IDÉNTICO A MEMORIA DE CONVERSACIÓN) ── */}
          <div className="space-y-1">
            <textarea
              readOnly
              value={errorLogs || localStorage.getItem('ava_last_error_log') || '[04/Sep/2026 02:10:43 AM] Start new stream'}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500/80 font-sans text-xs backdrop-blur-md resize-none leading-relaxed overflow-y-auto whitespace-pre-wrap select-text"
              placeholder="Historial de fallas..."
            />
          </div>

          {/* Voz del Asistente (Botón amplio con todo el texto integrado) */}
          <div className="space-y-1 font-sans">
            <button
              type="button"
              onClick={async () => {
                const nextVoiceMale = !settings.voiceMaleEnabled;
                setSettings((prev) => ({
                  ...prev,
                  voiceMaleEnabled: nextVoiceMale
                }));

                // Sincronizar en tiempo real con Supabase para el Panel de Administrador
                const clientId = localStorage.getItem('ava_client_id');
                if (clientId) {
                  const genderDirective = nextVoiceMale
                    ? 'GÉNERO E IDENTIDAD: Eres un asistente masculino (hombre). Expresate, habla y reconócete siempre como hombre en todas tus respuestas.'
                    : 'GÉNERO E IDENTIDAD: Eres una asistente femenina (mujer). Expresate, habla y reconócete siempre como mujer en todas tus respuestas.';
                  
                  let updatedInstructions = settings.systemInstructions || '';
                  if (updatedInstructions.includes('GÉNERO E IDENTIDAD:')) {
                    updatedInstructions = updatedInstructions.replace(/GÉNERO E IDENTIDAD:.*$/m, genderDirective);
                  } else {
                    updatedInstructions = `${genderDirective}\n\n${updatedInstructions}`;
                  }

                  try {
                    await supabase
                      .from('asistente_config')
                      .update({ 
                        system_instructions: updatedInstructions 
                      } as any)
                      .eq('client_id', clientId);
                  } catch (e) {
                    console.error('Error sincronizando voz con Supabase:', e);
                  }
                }
              }}
              className={`w-full py-2.5 px-3 font-black rounded-2xl text-[10.5px] uppercase tracking-wider transition duration-300 border shadow-md cursor-pointer flex items-center justify-center text-center ${
                settings.voiceMaleEnabled
                  ? 'bg-green-950/30 text-green-400 border-green-500/40 hover:bg-green-950/50 shadow-green-950/20'
                  : 'bg-pink-950/30 text-pink-300 border-pink-400/50 hover:bg-pink-950/50 shadow-pink-950/20'
              }`}
            >
              {settings.voiceMaleEnabled
                ? '🟢 VOZ DE HOMBRE — CAMBIAR A MUJER'
                : '🌸 VOZ DE MUJER — CAMBIAR A HOMBRE'}
            </button>
          </div>

          {/* Días de Memoria a Conservar */}
          <div className="space-y-1">
            <label className="text-zinc-200 font-bold font-sans text-[11px] uppercase tracking-wider block">
              DÍAS DE MEMORIA DE CONVERSACIÓN A GUARDAR:
            </label>
            <select
              value={
                settings.memoryDays !== undefined &&
                settings.memoryDays !== null &&
                settings.memoryDays >= 0 &&
                settings.memoryDays <= 31
                  ? settings.memoryDays
                  : 2
              }
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setSettings((prev) => ({
                  ...prev,
                  memoryDays: val
                }));
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-cyan-200 outline-none focus:border-cyan-500/80 font-sans text-xs backdrop-blur-md"
            >
              <option value="0" className="bg-[#0a0a0f] text-cyan-200">0 (Infinito)</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num} className="bg-[#0a0a0f] text-cyan-200">
                  {num === 2 ? `${num} días (Predeterminado)` : `${num} días`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-1.5">
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-black text-black text-xs transition shadow-[0_0_30px_rgba(6,182,212,0.5)] uppercase tracking-wider cursor-pointer"
          >
            Guardar y Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
