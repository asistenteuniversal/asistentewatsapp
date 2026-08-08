import React from 'react';
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
  return (
    <div className="w-full h-full bg-black relative flex flex-col">
      {/* Botón flotante premium para regresar a la carátula principal */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-16 left-4 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border border-cyan-500/40 text-cyan-300 font-bold px-4 py-2.5 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all hover:bg-cyan-500/20 active:scale-95 text-xs flex items-center gap-1.5 cursor-pointer font-sans"
        >
          <span>← Volver a Carátula</span>
        </button>
      )}
      <iframe
        src="https://aistudio.google.com/live?model=gemini-3.1-flash-live-preview"
        title="Google AI Studio Live"
        className="w-full h-full border-none bg-black"
        allow="microphone; camera; clipboard-write; autoplay; encrypted-media;"
      />
    </div>
  );
};
