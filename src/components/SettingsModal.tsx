import React from 'react';
import { X, Globe, Eye, Sliders } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (newInstructions: string) => Promise<void>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  settings,
  setSettings,
}) => {
  if (!isOpen) return null;

  const handleSave = async () => {
    if (onSave) {
      await onSave(settings.systemInstructions || '');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020205]/80 backdrop-blur-xl flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-md bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-[0_0_60px_rgba(6,182,212,0.25)] space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40">
              <Sliders className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="font-bold text-base tracking-wide font-sans">
              Configuración Phantom Link
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 text-xs">
          {/* Google Studio URL setting */}
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              URL de Google / Navegador Web:
            </label>
            <input
              type="text"
              value={settings.chatUrl}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, chatUrl: e.target.value }))
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-cyan-200 outline-none focus:border-cyan-500/80 font-mono text-[11px] backdrop-blur-md"
              placeholder="https://accounts.google.com"
            />
          </div>

          {/* System Instructions (Prompt) */}
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <span className="text-sm">🧠</span>
              Instrucciones del Sistema (Comportamiento):
            </label>
            <textarea
              value={settings.systemInstructions || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, systemInstructions: e.target.value }))
              }
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-cyan-200 outline-none focus:border-cyan-500/80 font-sans text-[11px] backdrop-blur-md resize-none"
              placeholder="Ejemplo: Eres un asistente servicial..."
            />
            <p className="text-[9px] text-zinc-400 leading-normal">
              Define la personalidad del asistente. Se inyectará automáticamente en Google Studio al abrir sus ajustes.
            </p>
          </div>

          {/* Memoria de Conversacion (Prompt de Recuerdos) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <span className="text-sm">📓</span>
                Memoria de Conversacion:
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
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold rounded-lg text-[9px] uppercase tracking-wider transition duration-300"
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-cyan-200 outline-none focus:border-cyan-500/80 font-sans text-[11px] backdrop-blur-md resize-none"
              placeholder="Escribe recuerdos de la conversación aquí..."
            />
            <p className="text-[9px] text-zinc-400 leading-normal">
              Añade recuerdos temporales. Se unirán al comportamiento y se borrarán automáticamente al cambiar de día.
            </p>
          </div>

          {/* Conexión de Memoria Celular (Vincular / Autónomo) */}
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-2 backdrop-blur-md font-sans">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5 font-sans">
                <span className="text-sm">🔄</span>
                Sincronización de Memoria:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSettings((prev) => {
                    const isAutonomous = prev.memoryDays === -1;
                    const nextDays = isAutonomous ? 2 : -1;
                    return {
                      ...prev,
                      memoryDays: nextDays
                    };
                  });
                }}
                className={`px-3 py-1.5 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition duration-300 border cursor-pointer ${
                  settings.memoryDays === -1
                    ? 'bg-red-950/20 text-red-400 border-red-500/30 hover:bg-red-950/30'
                    : 'bg-green-950/20 text-green-400 border-green-500/30 hover:bg-green-950/30'
                }`}
              >
                {settings.memoryDays === -1 ? '🔴 DESCONECTADO (AUTÓNOMO)' : '🟢 CONECTADO (VINCULADO)'}
              </button>
            </div>
            <p className="text-[9px] text-zinc-400 leading-normal font-sans">
              {settings.memoryDays === -1
                ? 'El celular está aislado de internet. Guarda sus recuerdos localmente.'
                : 'El celular sincroniza su memoria de forma bidireccional con Supabase.'}
            </p>
          </div>

          {/* Días de Memoria a Conservar */}
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-semibold flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-wider">
              <span className="text-sm">📅</span>
              DÍAS DE MEMORIA DE CONVERSACIÓN A GUARDAR:
            </label>
            <select
              value={settings.memoryDays === -1 ? 2 : (settings.memoryDays !== undefined && settings.memoryDays !== null ? settings.memoryDays : 2)}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setSettings((prev) => ({
                  ...prev,
                  memoryDays: val
                }));
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-cyan-200 outline-none focus:border-cyan-500/80 font-sans text-[11px] backdrop-blur-md"
            >
              <option value="0" className="bg-[#0a0a0f] text-cyan-200">0 (Infinito)</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num} className="bg-[#0a0a0f] text-cyan-200">
                  {num === 2 ? `${num} días (Predeterminado)` : `${num} días`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-zinc-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-400" />
                Transparencia del Botón Maestro:
              </span>
              <span className="font-mono text-cyan-400">
                {Math.round(settings.stealthOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={settings.stealthOpacity}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  stealthOpacity: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className="text-[10px] text-zinc-400 leading-normal">
              Ajusta la opacidad para que el botón de alternar sea casi invisible durante el uso.
            </p>
          </div>

          {/* Toggle to disconnect Page 1 from Page 2 */}
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-2 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5 font-sans">
                <span className="text-lg">🔗</span>
                Conectar Botón con Google:
              </span>
              <button
                id="bridge-toggle-btn"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    bridgeEnabled: !prev.bridgeEnabled,
                  }))
                }
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                  settings.bridgeEnabled ? 'bg-cyan-500' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                    settings.bridgeEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal font-sans">
              {settings.bridgeEnabled
                ? '🟢 CONECTADO — El botón de la carátula (Página 1) presiona el botón "Talk" de Google automáticamente.'
                : '🔴 DESCONECTADO — La Página 1 está aislada de Google. Úsalo para probar Google de forma 100% manual.'}
            </p>
          </div>

          {/* Cerrar Sesión de Google para cambiar cuenta */}
          <div className="pt-1">
            <button
              onClick={() => {
                if ((window as any).AndroidInterface && (window as any).AndroidInterface.logoutGoogle) {
                  try {
                    (window as any).AndroidInterface.logoutGoogle();
                  } catch (e) {
                    console.error(e);
                  }
                } else {
                  alert("Esta opción solo está disponible dentro de la aplicación de celular.");
                }
              }}
              className="w-full py-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 font-semibold text-[11px] transition duration-200 flex items-center justify-center gap-1.5 backdrop-blur-md"
            >
              <span className="text-xs">🔑</span>
              Cerrar Sesión de Google (Cambiar Correo)
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-bold text-black text-xs transition shadow-[0_0_30px_rgba(6,182,212,0.5)] uppercase tracking-wider"
          >
            Guardar y Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
