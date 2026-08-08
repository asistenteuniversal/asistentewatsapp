import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppMode, AppSettings, ChatMessage } from './types';
import { StealthHeader } from './components/StealthHeader';
import { ChatGPTLayer } from './components/ChatGPTLayer';
import { NeonCoverLayer } from './components/NeonCoverLayer';
import { SettingsModal } from './components/SettingsModal';
import { useVoiceEngine } from './hooks/useVoiceEngine';

export default function App() {
  const [mode, setMode] = useState<AppMode>('neon'); // Default to NEON phone cover
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initial chat history matching Image 1
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Me dedico a conversar, a pensar contigo y a desatorar ideas, cosas prácticas o temas curiosos. ¿En qué te echo una mano?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: '2',
      role: 'user',
      content: '¿Qué más sabes de la vida',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: '3',
      role: 'assistant',
      content:
        'Bueno, sé que la vida se aprende más viviéndola que descifrándola. Pero también ayuda a hacerse buenas preguntas. ¿Qué te trae dando vueltas hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [settings, setSettings] = useState<AppSettings>({
    chatUrl: 'https://aistudio.google.com/live?model=gemini-3.1-flash-live-preview',
    stealthOpacity: 0.9,
    hotkeyEnabled: true,
    pulseSpeed: 1.0,
    voiceConfig: {
      voiceName: 'Kore',
      pitch: 1.0,
      rate: 1.0,
      useGeminiTts: false,
    },
    autoStartVoice: false,
    showIframeFallback: false,
  });

  // Handle incoming AI response from backend
  const handleUserPrompt = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
            mode: mode === 'neon' ? 'voice' : 'text',
          }),
        });

        const data = await response.json();
        const replyText = data.reply || 'Entendido.';

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);

        // Speak aloud if voice call is active
        if (voiceEngine.isCallActive || mode === 'neon') {
          voiceEngine.speakText(replyText);
        }
      } catch (err) {
        console.error('Error fetching chat response:', err);
      }
    },
    [messages, mode]
  );

  // Hook for voice call engine
  const voiceEngine = useVoiceEngine((recognizedText) => {
    handleUserPrompt(recognizedText);
  }, settings.voiceConfig);

  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket Server
  useEffect(() => {
    let active = true;
    let ws: WebSocket | null = null;

    const connectWs = () => {
      if (!active) return;
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log('[Controller] Conectando a WebSocket:', wsUrl);
      
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[Controller] Conexión WebSocket establecida con éxito.');
        if (ws) {
          ws.send(JSON.stringify({ type: 'register', role: 'controller' }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[Controller] Mensaje WS recibido:', data);
        } catch (e) {
          console.error('[Controller] Error al parsear mensaje WS:', e);
        }
      };

      ws.onclose = () => {
        if (active) {
          console.log('[Controller] Conexión WebSocket cerrada. Reintentando en 3s...');
          setTimeout(connectWs, 3000);
        }
      };

      ws.onerror = (err) => {
        console.error('[Controller] Error en WebSocket:', err);
        if (ws) {
          ws.close();
        }
      };

      wsRef.current = ws;
    };

    connectWs();

    return () => {
      active = false;
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Intercept call toggle to send commands to agent via WebSockets
  const handleToggleCall = useCallback(async () => {
    // 1. Toggle call locally in UI
    await voiceEngine.toggleCall();

    // 2. Send command to agent via WebSocket
    const willBeActive = !voiceEngine.isCallActive;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const command = willBeActive ? 'start-call' : 'end-call';
      console.log('[Controller] Enviando comando por WebSocket:', command);
      wsRef.current.send(JSON.stringify({ type: 'command', action: command }));
    }
  }, [voiceEngine]);

  // Keyboard shortcut handler (Ctrl + Shift + H)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setMode((prev) => (prev === 'neon' ? 'studio' : 'neon'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative flex flex-col select-none">
      {/* Top Stealth Header Bar */}
      <StealthHeader
        mode={mode}
        setMode={setMode}
        settings={settings}
        setSettings={setSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isCallActive={voiceEngine.isCallActive}
        audioLevel={voiceEngine.audioLevel}
      />

      {/* Main Container switching between Fase 1 (ChatGPT) and Fase 2 (NEON Cover) */}
      <main className="w-full h-full relative flex-1 overflow-hidden">
        {/* Layer 1: Google AI Studio Interface (Visible or Hidden underneath) */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
            mode === 'studio'
              ? 'z-20 opacity-100 pointer-events-auto'
              : 'z-0 opacity-0 pointer-events-none'
          }`}
        >
          <ChatGPTLayer
            chatUrl={settings.chatUrl}
            onUpdateUrl={(newUrl) => setSettings((prev) => ({ ...prev, chatUrl: newUrl }))}
            messages={messages}
            onSendMessage={handleUserPrompt}
            onToggleVoice={handleToggleCall}
            isCallActive={voiceEngine.isCallActive}
            isListening={voiceEngine.isListening}
            isSpeaking={voiceEngine.isSpeaking}
            settings={settings}
          />
        </div>

        {/* Layer 2: NEON Stealth Cover Interface */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
            mode === 'neon'
              ? 'z-20 opacity-100 pointer-events-auto'
              : 'z-0 opacity-0 pointer-events-none'
          }`}
        >
          <NeonCoverLayer
            isCallActive={voiceEngine.isCallActive}
            isListening={voiceEngine.isListening}
            isSpeaking={voiceEngine.isSpeaking}
            audioLevel={voiceEngine.audioLevel}
            callDuration={voiceEngine.callDuration}
            onToggleVoice={handleToggleCall}
            transcript={voiceEngine.transcript}
            pulseSpeed={settings.pulseSpeed}
          />
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
        micGranted={voiceEngine.micPermissionGranted}
        onRequestMic={handleToggleCall}
      />
    </div>
  );
}
