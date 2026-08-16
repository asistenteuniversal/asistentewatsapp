import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppMode, AppSettings, ChatMessage } from './types';
import { StealthHeader } from './components/StealthHeader';
import { ChatGPTLayer } from './components/ChatGPTLayer';
import { NeonCoverLayer } from './components/NeonCoverLayer';
import { SettingsModal } from './components/SettingsModal';
import { ClientSettingsModal } from './components/ClientSettingsModal'; // Importar modal de cliente
import { useVoiceEngine } from './hooks/useVoiceEngine';
import { supabase } from './supabaseClient';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [mode, setMode] = useState<AppMode>(() => {
    // Detectar si el usuario quiere entrar al panel de administración
    if (window.location.pathname === '/admin' || window.location.search.includes('admin')) {
      return 'admin';
    }
    const saved = localStorage.getItem('ava_app_mode');
    return (saved as AppMode) || 'neon';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Modal de Administrador (original)
  const [isClientSettingsOpen, setIsClientSettingsOpen] = useState(false); // Modal de Cliente (nuevo)
  const [isSystemLoading, setIsSystemLoading] = useState(true); // Temporizador de arranque seguro
  const [updateAvailable, setUpdateAvailable] = useState(false); // Estado de actualizador flotante
  // Verificar actualizaciones remotas del chasis APK
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const res = await fetch(`/version.json?v=${new Date().getTime()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.versionCode) {
            let localVersion = 1;
            if ((window as any).AndroidInterface && (window as any).AndroidInterface.getApkVersionCode) {
              try {
                localVersion = parseInt((window as any).AndroidInterface.getApkVersionCode(), 10);
              } catch (e) {
                console.error("Error reading native version code:", e);
              }
            }
            if (data.versionCode > localVersion) {
              setUpdateAvailable(true);
            }
          }
        }
      } catch (err) {
        console.error('Error checking updates:', err);
      }
    };
    checkUpdates();
  }, []);


  // Temporizador de 4 segundos para permitir carga de Google en background
  useEffect(() => {
    if (isSystemLoading) {
      const timer = setTimeout(() => {
        setIsSystemLoading(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSystemLoading]);

  // Estado de vinculación reactivo compartido globalmente
  const [isGoogleLinked, setIsGoogleLinked] = useState(localStorage.getItem('google_logged_in') === 'true');

  // Escuchar la llamada nativa de Android al presionar el botón Atrás o tocar la cabecera
  useEffect(() => {
    (window as any).setAppModeNeon = () => {
      setMode('neon');
      setIsSystemLoading(true); // Disparar la pantalla de carga segura al regresar de Google
      localStorage.setItem('google_logged_in', 'true');
      setIsGoogleLinked(true); // Actualiza en caliente el modal del cliente
    };
    (window as any).setAppModeStudio = () => {
      setMode('studio');
      localStorage.setItem('google_logged_in', 'false');
      setIsGoogleLinked(false); // Actualiza en caliente el modal del cliente
    };
    return () => {
      delete (window as any).setAppModeNeon;
      delete (window as any).setAppModeStudio;
    };
  }, []);


  const handleSetMode = useCallback((newMode: AppMode) => {
    setMode(newMode);
    if (newMode === 'neon') {
      setIsSystemLoading(true); // Disparar la carga si se vuelve a la carátula
    }
    if ((window as any).AndroidInterface && (window as any).AndroidInterface.showStudio) {
      try {
        (window as any).AndroidInterface.showStudio(newMode === 'studio');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

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

  // Cargar Ajustes desde el almacenamiento local persistente (localStorage) del celular
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('neonSettings');
    const defaultSettings = {
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
      bridgeEnabled: true,
      systemInstructions: 'Eres un asistente de voz inteligente, servicial y amigable. Responde de forma clara, concisa y directa en español.',
      systemMemory: '',
      memorySaveDate: new Date().toDateString()
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const today = new Date().toDateString();
        // Si la fecha guardada es de un día anterior, limpiar memoria de 1 día
        if (parsed.memorySaveDate && parsed.memorySaveDate !== today) {
          parsed.systemMemory = '';
          parsed.memorySaveDate = today;
        }
        return { ...defaultSettings, ...parsed };
      } catch (e) {
        console.error(e);
      }
    }
    return defaultSettings;
  });

  // Cargar instrucciones externas de comportamiento configuradas desde el PC o Supabase
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log('[Supabase] Intentando cargar configuración desde la nube...');
        const { data, error } = await supabase
          .from('asistente_config')
          .select('system_instructions')
          .eq('client_id', 'cliente_maestro')
          .single();

        if (error) throw error;

        if (data && data.system_instructions) {
          console.log('[Supabase] Configuración cargada con éxito.');
          setSettings((prev) => ({
            ...prev,
            systemInstructions: data.system_instructions,
          }));
          // Inyectar en Android de inmediato si la interfaz nativa está activa
          if ((window as any).AndroidInterface && (window as any).AndroidInterface.updateSystemInstructions) {
            try {
              (window as any).AndroidInterface.updateSystemInstructions(data.system_instructions);
            } catch (e) {
              console.error(e);
            }
          }
          return; // Salir con éxito
        }
      } catch (err) {
        console.warn('[Supabase] Falló carga remota (base de datos pausada o sin conexión). Usando fallback local:', err);
      }

      // Fallback: Intentar leer el archivo local config
      try {
        const res = await fetch(`/asistente_config.json?v=${new Date().getTime()}`);
        if (res.ok) {
          const localData = await res.json();
          if (localData && localData.systemInstructions) {
            setSettings((prev) => ({
              ...prev,
              systemInstructions: localData.systemInstructions,
            }));
            if ((window as any).AndroidInterface && (window as any).AndroidInterface.updateSystemInstructions) {
              (window as any).AndroidInterface.updateSystemInstructions(localData.systemInstructions);
            }
          }
        }
      } catch (err) {
        console.error('[Fallback] Error al cargar archivo local:', err);
      }
    };

    loadConfig();
  }, []);

  // Guardar Ajustes en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem('neonSettings', JSON.stringify(settings));
  }, [settings]);

  // Escuchar transcripciones extraídas de Google y guardarlas en la memoria diaria
  useEffect(() => {
    (window as any).onGoogleTranscriptExtracted = (text: string) => {
      if (text && text.trim()) {
        setSettings((prev) => {
          const currentMemory = prev.systemMemory || '';
          const cleanText = text.trim();
          // Evitar duplicar el mismo bloque de conversación
          if (currentMemory.includes(cleanText)) return prev;

          const newMemory = currentMemory.trim()
            ? `${currentMemory}\n${cleanText}`
            : cleanText;
          return {
            ...prev,
            systemMemory: newMemory,
            memorySaveDate: new Date().toDateString(),
          };
        });
      }
    };
    return () => {
      delete (window as any).onGoogleTranscriptExtracted;
    };
  }, []);

  // Sincronizar el estado del puente (conectar/desconectar Página 1) con el celular
  useEffect(() => {
    if ((window as any).AndroidInterface && (window as any).AndroidInterface.setBridgeEnabled) {
      try {
        (window as any).AndroidInterface.setBridgeEnabled(settings.bridgeEnabled);
      } catch (e) {
        console.error(e);
      }
    }
  }, [settings.bridgeEnabled]);

  // Sincronizar las instrucciones del sistema (comportamiento + memoria de hoy) con el celular
  useEffect(() => {
    if ((window as any).AndroidInterface && (window as any).AndroidInterface.updateSystemInstructions) {
      try {
        const instructions = settings.systemInstructions || '';
        const memory = settings.systemMemory || '';
        const mergedText = memory.trim()
          ? `${instructions}\n\n[MEMORIA DE CONVERSACIONES ANTERIORES CON EL USUARIO (Esta es tu memoria de lo que platicaste anteriormente con la persona con la que estás hablando. No repitas nada de lo que está aquí, son solo tus recuerdos de hoy. Es información confidencial de tu pasado inmediato, úsala solo como referencia para responder)]: \n${memory}`
          : instructions;

        (window as any).AndroidInterface.updateSystemInstructions(mergedText);
      } catch (e) {
        console.error(e);
      }
    }
  }, [settings.systemInstructions, settings.systemMemory]);

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

  // Intercept call toggle to send commands to agent via WebSockets or native bridge
  const handleToggleCall = useCallback(async () => {
    // 1. Toggle call locally in UI
    await voiceEngine.toggleCall();

    const willBeActive = !voiceEngine.isCallActive;

    // 2. Tell the native Android app directly (if running inside APK)
    if ((window as any).AndroidInterface) {
      try {
        if (willBeActive) {
          (window as any).AndroidInterface.startVoiceCall();
        } else {
          (window as any).AndroidInterface.endVoiceCall();
        }
      } catch (e) {
        console.error("Error calling native voice toggler:", e);
      }
    }

    // 3. Send command to agent via WebSocket (for web version fallback)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const command = willBeActive ? 'start-call' : 'end-call';
      console.log('[Controller] Enviando comando por WebSocket:', command);
      wsRef.current.send(JSON.stringify({ type: 'command', action: command }));
    }
  }, [voiceEngine]);

  const handleToggleAudioCall = useCallback(async () => {
    await voiceEngine.toggleCall();
    const willBeActive = !voiceEngine.isCallActive;

    if ((window as any).AndroidInterface) {
      try {
        if (willBeActive) {
          (window as any).AndroidInterface.startVoiceCall(false); // Llamada de audio (con el flag false)
        } else {
          (window as any).AndroidInterface.endVoiceCall(); // Colgar idéntico
        }
      } catch (e) {
        console.error("Error calling native voice toggler:", e);
      }
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const command = willBeActive ? 'start-call' : 'end-call';
      wsRef.current.send(JSON.stringify({ type: 'command', action: command }));
    }
  }, [voiceEngine]);

  // Keyboard shortcut handler (Ctrl + Shift + H)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setMode((prev) => {
          const nextMode = prev === 'neon' ? 'studio' : 'neon';
          if ((window as any).AndroidInterface && (window as any).AndroidInterface.showStudio) {
            try {
              (window as any).AndroidInterface.showStudio(nextMode === 'studio');
            } catch (e) {
              console.error(e);
            }
          }
          return nextMode;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sincronizar nuevas instrucciones con Supabase en la nube
  const handleSaveSettings = useCallback(async (newInstructions: string) => {
    try {
      console.log('[Supabase] Sincronizando nuevas instrucciones con la nube...');
      const { error } = await supabase
        .from('asistente_config')
        .update({ system_instructions: newInstructions })
        .eq('client_id', 'cliente_maestro');

      if (error) throw error;
      console.log('[Supabase] Sincronización exitosa.');
    } catch (err) {
      console.error('[Supabase] Error de sincronización remota:', err);
      alert('Las instrucciones se guardaron localmente en este dispositivo, pero no se pudieron sincronizar en la base de datos de Supabase en la nube (el servidor de la base de datos podría estar pausado u offline).');
    }
  }, []);

  if (mode === 'admin') {
    return <AdminPanel />;
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative flex flex-col select-none">
      {/* Capa de Carga de Arranque Seguro (4 Segundos) */}
      {isSystemLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          {/* Línea de progreso minimalista color oro en el centro */}
          <div style={{
            width: '180px',
            height: '2px',
            backgroundColor: 'rgba(212, 175, 55, 0.15)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#d4af37',
              borderRadius: '2px',
              transformOrigin: 'left',
              animation: 'fillProgress 4s linear forwards'
            }} />
          </div>

          <style>{`
            @keyframes fillProgress {
              from { transform: scaleX(0); }
              to { transform: scaleX(1); }
            }
          `}</style>
        </div>
      )}
      {/* Top Stealth Header Bar - Only visible in studio mode */}
      {mode === 'studio' && (
        <StealthHeader
          mode={mode}
          setMode={handleSetMode}
          settings={settings}
          setSettings={setSettings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isCallActive={voiceEngine.isCallActive}
          audioLevel={voiceEngine.audioLevel}
        />
      )}

      {/* Main Container switching between Fase 1 (ChatGPT) and Fase 2 (NEON Cover) */}
      <main className="w-full h-full relative flex-1 overflow-hidden">
        {/* Layer 1: Google AI Studio Interface (Visible or Hidden underneath) */}
        {!((window as any).AndroidInterface) && (
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
              onClose={() => handleSetMode('neon')}
            />
          </div>
        )}

        {/* Layer 2: NEON Stealth Cover Interface */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
            mode === 'neon'
              ? 'z-20 opacity-100 pointer-events-auto'
              : 'z-0 opacity-0 pointer-events-none'
          }`}
        >
          <NeonCoverLayer
            isSystemLoading={isSystemLoading}
            isGoogleLinked={isGoogleLinked}
            isCallActive={voiceEngine.isCallActive}
            isListening={voiceEngine.isListening}
            isSpeaking={voiceEngine.isSpeaking}
            audioLevel={voiceEngine.audioLevel}
            callDuration={voiceEngine.callDuration}
            onToggleVoice={handleToggleCall}
            onToggleAudio={handleToggleAudioCall}
            transcript={voiceEngine.transcript}
            pulseSpeed={settings.pulseSpeed}
            onShowStudio={() => handleSetMode('studio')}
            onOpenSettings={() => setIsSettingsOpen(true)} // Engrane abre Administrador (original)
            onOpenClientSettings={() => setIsClientSettingsOpen(true)} // Sliders abre Cliente (nuevo)
            updateAvailable={updateAvailable}
          />
        </div>
      </main>

      {/* Modal de Ajustes del Cliente (Público) */}
      <ClientSettingsModal
        isOpen={isClientSettingsOpen}
        onClose={() => setIsClientSettingsOpen(false)}
        isGoogleLinked={isGoogleLinked}
        setIsGoogleLinked={setIsGoogleLinked}
      />

      {/* Settings Modal (Administrador) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
}

