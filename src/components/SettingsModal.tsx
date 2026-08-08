import React from 'react';
import { X, Mic, Globe, Eye, Sliders, KeyRound } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  micGranted: boolean | null;
  onRequestMic: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
  micGranted,
  onRequestMic,
}) => {
  if (!isOpen) return null;

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

          {/* Stealth Button Transparency */}
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

          {/* Pulse Animation Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-zinc-300 font-semibold">
              <span>Velocidad de Animación Pulso (`pulso.xml`):</span>
              <span className="font-mono text-cyan-400">{settings.pulseSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.25"
              value={settings.pulseSpeed}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  pulseSpeed: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
          {/* Bridge Button Toggle (ON/OFF) */}
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-2 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <span className="text-lg">🔗</span>
                Conectar Botón con Google:
              </span>
              <button
                id="bridge-toggle-btn"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    bridgeEnabled: !(prev.bridgeEnabled !== false),
                  }))
                }
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                  settings.bridgeEnabled !== false ? 'bg-cyan-500' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                    settings.bridgeEnabled !== false ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal">
              {settings.bridgeEnabled !== false
                ? '🟢 ACTIVO — El botón de la carátula presiona el botón "Talk" de Google automáticamente.'
                : '🔴 DESACTIVADO — El botón de la carátula está desconectado de Google (modo prueba manual).'}
            </p>
          </div>

          {/* Microphone Permission Status */}
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-2 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-cyan-400" />
                Permiso de Micrófono:
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  micGranted === true
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                }`}
              >
                {micGranted === true ? 'CONCEDIDO' : 'REQUIERE PERMISO'}
              </span>
            </div>

            {micGranted !== true && (
              <button
                onClick={onRequestMic}
                className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                Solicitar Permiso de Audio
              </button>
            )}
          </div>

          {/* Shortcut guide */}
          <div className="p-3.5 bg-cyan-950/30 rounded-2xl border border-cyan-500/30 text-cyan-300 space-y-1 backdrop-blur-md">
            <div className="flex items-center gap-1.5 font-bold text-[11px]">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              Atajo de Teclado Rápido:
            </div>
            <p className="text-[10px] text-cyan-200/80 leading-relaxed">
              Presiona <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono border border-white/10 text-cyan-300">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono border border-white/10 text-cyan-300">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono border border-white/10 text-cyan-300">H</kbd> para ocultar o mostrar la pantalla al instante.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-bold text-black text-xs transition shadow-[0_0_30px_rgba(6,182,212,0.5)] uppercase tracking-wider"
          >
            Guardar y Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
