import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ChatMessage, AppSettings } from '../types';

interface ChatGPTLayerProps {
  chatUrl: string;
  onUpdateUrl?: (newUrl: string) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onToggleVoice: () => void;
  isCallActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  settings: AppSettings;
  onClose?: () => void;
}

export const ChatGPTLayer: React.FC<ChatGPTLayerProps> = ({ onClose }) => {
  const handleOpenStudio = () => {
    // Abrir Google AI Studio directamente en una pestaña nueva del navegador (donde corre Tampermonkey)
    window.open('https://aistudio.google.com/live?model=gemini-3.1-flash-live-preview', '_blank');
  };

  return (
    <div className="w-full h-full bg-[#020205] text-white flex flex-col justify-center items-center p-6 select-none relative font-sans">
      {/* Fondo Cyberpunk Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#020205_100%)] z-0" />
      
      {/* Rejilla de fondo decorativa */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 243, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Botón flotante para regresar a la carátula principal */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-16 left-4 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border border-cyan-500/40 text-cyan-300 font-bold px-4 py-2.5 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all hover:bg-cyan-500/20 active:scale-95 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>← Volver a Carátula</span>
        </button>
      )}

      {/* Tarjeta Central de Enlace */}
      <div className="relative z-10 w-full max-w-xs p-6 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,243,255,0.15)] flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full border border-cyan-500/40 p-3 shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center bg-white/5">
          <ExternalLink className="w-8 h-8 text-cyan-300 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-cyan-400">
            Conexión con Google AI Studio
          </h2>
          <p className="text-[11px] text-zinc-400 leading-relaxed px-1">
            Para iniciar el asistente de voz, abre la pestaña de Google AI Studio en tu navegador (Firefox) donde tienes instalada la extensión Tampermonkey.
          </p>
        </div>

        {/* Botón de Acción Principal (El que abre en pestaña) */}
        <button
          onClick={handleOpenStudio}
          className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs tracking-wider transition-all duration-300 shadow-[0_0_35px_rgba(6,182,212,0.65)] hover:scale-[1.02] active:scale-95 cursor-pointer uppercase"
        >
          Abrir Google AI Studio
        </button>
      </div>
    </div>
  );
};
