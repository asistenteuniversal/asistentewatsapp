import React from 'react';
import { X } from 'lucide-react';
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
        {/* Header - Solo botón de cierre */}
        <div className="flex items-center justify-end border-b border-white/10 pb-2">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 text-xs">
          {/* System Instructions (Prompt) */}
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-semibold font-sans text-[10px] uppercase tracking-wider block">
              COMPORTAMIENTO ASISTENTE:
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
              <label className="text-zinc-300 font-semibold text-[10px] uppercase tracking-wider">
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
              <span className="font-semibold text-zinc-300 font-sans text-[11px]">
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
                className={`px-3 py-1.5 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition duration-300 border cursor-pointer ${
                  settings.syncMemoryEnabled === false
                    ? 'bg-red-950/20 text-red-400 border-red-500/30 hover:bg-red-950/30'
                    : 'bg-green-950/20 text-green-400 border-green-500/30 hover:bg-green-950/30'
                }`}
              >
                {settings.syncMemoryEnabled === false ? '🔴 DESCONECTADO (AUTÓNOMO)' : '🟢 CONECTADO (VINCULADO)'}
              </button>
            </div>
          </div>

          {/* Voz del Asistente (Hombre Verde / Mujer Rosa) */}
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-2 backdrop-blur-md font-sans">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300 font-sans text-[11px]">
                Voz del Asistente:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    voiceMaleEnabled: !prev.voiceMaleEnabled
                  }));
                }}
                className={`px-3 py-1.5 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition duration-300 border cursor-pointer ${
                  settings.voiceMaleEnabled
                    ? 'bg-green-950/20 text-green-400 border-green-500/30 hover:bg-green-950/30'
                    : 'bg-pink-950/25 text-pink-300 border-pink-400/40 hover:bg-pink-950/40'
                }`}
              >
                {settings.voiceMaleEnabled ? '🟢 VOZ DE HOMBRE (ALGIEBA)' : '🌸 VOZ DE MUJER (ZEPHYR)'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal font-sans italic font-medium">
              {settings.voiceMaleEnabled
                ? 'Presionar si quieres voz de mujer'
                : 'Presionar para voz de hombre'}
            </p>
          </div>

          {/* Días de Memoria a Conservar */}
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-semibold font-sans text-[10px] uppercase tracking-wider block">
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-cyan-200 outline-none focus:border-cyan-500/80 font-sans text-[11px] backdrop-blur-md"
            >
              <option value="0" className="bg-[#0a0a0f] text-cyan-200">0 (Infinito)</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num} className="bg-[#0a0a0f] text-cyan-200">
                  {num === 2 ? ${num} días (Predeterminado) : ${num} días}
                </option>
              ))}
            </select>
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
              className="w-full py-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 font-semibold text-[11px] transition duration-200 flex items-center justify-center backdrop-blur-md"
            >
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
