import React, { useState, useRef, useEffect } from 'react';
import {
  Headphones,
  Plus,
  Sparkles,
  Lock,
  Share2,
  MoreVertical,
  ChevronLeft,
  ExternalLink,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check
} from 'lucide-react';
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

export const ChatGPTLayer: React.FC<ChatGPTLayerProps> = ({
  chatUrl,
  onUpdateUrl,
  messages,
  onSendMessage,
  onToggleVoice,
  isCallActive,
  isListening,
  isSpeaking,
  settings,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showIframeView, setShowIframeView] = useState(false);
  const [useProxy, setUseProxy] = useState(true);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(chatUrl);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrlInput(chatUrl);
    if (chatUrl) {
      setShowIframeView(true);
    }
  }, [chatUrl]);

  const getTargetUrl = (raw: string) => {
    let formatted = raw.trim();
    if (formatted && !formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
    }
    return formatted;
  };

  const iframeSrc = showIframeView
    ? useProxy
      ? `/api/proxy?url=${encodeURIComponent(getTargetUrl(chatUrl || 'https://aistudio.google.com/apps'))}`
      : getTargetUrl(chatUrl || 'https://aistudio.google.com/apps')
    : '';

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let formatted = urlInput.trim();
    if (formatted && !formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
    }
    if (formatted) {
      if (onUpdateUrl) {
        onUpdateUrl(formatted);
      }
      setShowIframeView(true);
    }
    setIsEditingUrl(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isListening, isSpeaking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full h-full bg-[#121212] text-white flex flex-col font-sans select-none overflow-hidden relative">
      {/* Mobile Browser Top Bar (Matching Image 1: 9:47 AM, chatgpt.com/c/..., 47 tabs) */}
      <div className="bg-[#171717] border-b border-neutral-800 px-3 py-2 flex items-center justify-between gap-2 shrink-0 pt-10 sm:pt-4">
        <div className="flex items-center gap-2 text-neutral-400">
          <ChevronLeft className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>

        {/* URL Pill Bar (Clickable and editable) */}
        <div className="flex-1 bg-[#212121] border border-neutral-700/60 rounded-full px-3 py-1.5 flex items-center justify-between text-xs text-neutral-300 shadow-inner group hover:border-neutral-500 transition">
          {isEditingUrl ? (
            <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center gap-1.5 mr-2">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onBlur={handleUrlSubmit}
                autoFocus
                className="w-full bg-transparent text-white font-mono text-[11px] outline-none border-b border-emerald-500 px-1 py-0.5"
                placeholder="https://chatgpt.com/c/..."
              />
            </form>
          ) : (
            <div
              onClick={() => setIsEditingUrl(true)}
              className="flex-1 flex items-center gap-1.5 overflow-hidden text-neutral-300 font-mono text-[11px] cursor-pointer hover:text-white transition"
              title="Haz clic para editar la dirección URL web"
            >
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{chatUrl ? chatUrl.replace(/^https?:\/\//, '') : 'chatgpt.com'}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowIframeView(!showIframeView)}
            className="text-[10px] font-sans px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 shrink-0 ml-1 border border-neutral-700 transition"
            title="Cambiar entre Vista Web / Vista Simulador"
          >
            {showIframeView ? 'Vista App' : 'Iframe Web'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold">
          <div className="w-5 h-5 rounded-md border border-neutral-600 flex items-center justify-center text-[10px]">
            47
          </div>
          <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Main Content View (Iframe or Simulator) */}
      {showIframeView ? (
        <div className="flex-1 w-full h-full relative bg-black flex flex-col">
          <div className="bg-[#171717] px-3 py-2 border-b border-neutral-800 flex flex-wrap items-center justify-between text-[11px] text-neutral-300 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">
                {useProxy ? 'Proxy Anti-Bloqueo Activo' : 'Conexión Directa'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUseProxy(!useProxy)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-neutral-700 font-mono text-[10px] transition cursor-pointer"
                title="Alternar entre Proxy Anti-Bloqueo y Carga Directa"
              >
                {useProxy ? 'Modo Directo' : 'Activar Proxy'}
              </button>
              <button
                type="button"
                onClick={() => window.open(getTargetUrl(chatUrl || 'https://aistudio.google.com/apps'), '_blank')}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] transition cursor-pointer flex items-center gap-1 shadow"
                title="Abrir en pestaña nueva del navegador para iniciar sesión en Google sin restricciones"
              >
                <span>Abrir en Pestaña</span>
              </button>
            </div>
          </div>

          <iframe
            key={`${chatUrl}-${useProxy}`}
            src={iframeSrc}
            title="Navegador Web"
            className="w-full flex-1 border-none bg-black"
            allow="microphone; camera; clipboard-write; autoplay; encrypted-media;"
          />
        </div>
      ) : (
        /* Replica Layout */
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#212121]">
          {/* Header Bar inside replica */}
          <div className="px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-sm bg-[#171717]/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-neutral-300 font-medium">
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
                Google Account / Web
              </span>
              <span className="text-xs text-neutral-400 truncate max-w-[140px]">
                Navegador Activo
              </span>
            </div>
            <div className="flex items-center gap-3 text-neutral-400">
              <Share2 className="w-4 h-4 cursor-pointer hover:text-white" />
              <ExternalLink
                className="w-4 h-4 cursor-pointer hover:text-white"
                onClick={() => window.open(chatUrl, '_blank')}
                title="Abrir URL en pestaña nueva"
              />
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-900/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-white text-base font-semibold">
                  Navegador e Interfaz Oculta NEON
                </h3>
                <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                  Esta sesión se ejecuta por debajo de la carátula NEON. Puedes iniciar sesión con Google o usar comandos de voz.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#303030] text-white rounded-br-none border border-neutral-700/50'
                        : 'bg-[#2f2f2f] text-neutral-100 rounded-bl-none border border-neutral-700/30'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Actions for assistant message */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-1 text-neutral-500 text-xs px-1">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-neutral-300 transition"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <ThumbsUp className="w-3.5 h-3.5 hover:text-neutral-300 cursor-pointer" />
                      <ThumbsDown className="w-3.5 h-3.5 hover:text-neutral-300 cursor-pointer" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Listening / Speaking Live Indicator */}
            {(isListening || isSpeaking) && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full w-fit animate-pulse">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                <span>{isSpeaking ? 'Voz Inteligente respondiendo...' : 'Escuchando tu voz...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Bar (Exact replica of Image 1) */}
          <div className="p-3 bg-[#171717] border-t border-neutral-800 shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-[#2f2f2f] hover:bg-[#383838] flex items-center justify-center text-neutral-300 shrink-0 border border-neutral-700"
              >
                <Plus className="w-5 h-5" />
              </button>

              <div className="flex-1 bg-[#2f2f2f] border border-neutral-700 rounded-full px-4 py-2 flex items-center gap-2 text-sm text-white">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Preguntar lo que quieras"
                  className="w-full bg-transparent outline-none text-white placeholder-neutral-500 text-sm"
                />

                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">Pensar</span>
                </button>
              </div>

              {/* Headphone / Voice Mode Button (Matching Image 1 rightmost button) */}
              <button
                type="button"
                id="boton_voz_chatgpt"
                onClick={onToggleVoice}
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all shadow-md ${
                  isCallActive
                    ? 'bg-red-600 text-white animate-pulse border-2 border-red-400'
                    : 'bg-white text-black hover:bg-neutral-200'
                }`}
                title="Modo de voz de ChatGPT (Headphone button)"
              >
                <Headphones className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
