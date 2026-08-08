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
}

export const ChatGPTLayer: React.FC<ChatGPTLayerProps> = () => {
  // Cargamos directamente Google AI Studio Live en pantalla completa sin barras ni proxies
  return (
    <div className="w-full h-full bg-black relative flex flex-col">
      <iframe
        src="https://aistudio.google.com/live?model=gemini-3.1-flash-live-preview"
        title="Google AI Studio Live"
        className="w-full h-full border-none bg-black"
        allow="microphone; camera; clipboard-write; autoplay; encrypted-media;"
      />
    </div>
  );
};
