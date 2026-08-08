import React from 'react';
import { Eye, EyeOff, Settings, Shield, Mic, Volume2 } from 'lucide-react';
import { AppMode, AppSettings } from '../types';

interface StealthHeaderProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onOpenSettings: () => void;
  isCallActive: boolean;
  audioLevel: number;
}

export const StealthHeader: React.FC<StealthHeaderProps> = ({
  mode,
  setMode,
  settings,
  setSettings,
  onOpenSettings,
  isCallActive,
  audioLevel,
}) => {
  const isHiddenMode = mode === 'neon';

  const toggleMode = () => {
    setMode(isHiddenMode ? 'studio' : 'neon');
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-auto"
      style={{
        opacity: settings.stealthOpacity,
      }}
    >
      <div className="max-w-md mx-auto px-4 py-2 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-[0_0_25px_rgba(0,212,255,0.15)] flex items-center justify-between text-xs text-cyan-200">
        {/* Left: Indicator status */}
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-mono tracking-wider text-[11px] uppercase text-zinc-300">
            {isHiddenMode ? 'MODO CARÁTULA OCULTA' : 'MODO REGISTRO / CHAT'}
          </span>
          {isCallActive && (
            <span className="flex items-center gap-1 bg-cyan-950/40 backdrop-blur-md text-cyan-300 px-2.5 py-0.5 rounded-full text-[10px] border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              MIC: {audioLevel}%
            </span>
          )}
        </div>

        {/* Center/Right: Action toggle buttons */}
        <div className="flex items-center gap-2">
          {/* Main Mode Toggle Button */}
          <button
            id="boton_cambiar_modo"
            onClick={toggleMode}
            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-md backdrop-blur-md ${
              isHiddenMode
                ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-red-600/30 hover:bg-red-600/40 text-red-300 border border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]'
            }`}
            title="Cambiar entre modo activo y Carátula Oculta (Ctrl+Shift+H)"
          >
            {isHiddenMode ? (
              <>
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>MOSTRAR INTERFAZ</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-red-400" />
                <span>OCULTAR EN CARÁTULA</span>
              </>
            )}
          </button>

          {/* Quick Opacity Adjust Button */}
          <button
            onClick={() =>
              setSettings((prev) => ({
                ...prev,
                stealthOpacity: prev.stealthOpacity === 1 ? 0.2 : prev.stealthOpacity === 0.2 ? 0.05 : 1,
              }))
            }
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 backdrop-blur-md"
            title="Cambiar transparencia del botón maestro"
          >
            <span className="font-mono text-[10px] font-semibold text-cyan-400">
              {Math.round(settings.stealthOpacity * 100)}%
            </span>
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 hover:border-cyan-500/40 backdrop-blur-md"
            title="Configuración"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
