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
import { DiagnosticModal } from './components/DiagnosticModal';

export default function App() {
  const [mode, setMode] = useState<AppMode>(() => {
    // Detectar si el usuario quiere entrar al panel de administración con la ruta oculta
    if (window.location.pathname === '/panel-26' || window.location.search.includes('panel-26')) {
      return 'admin';
    }
    const saved = localStorage.getItem('ava_app_mode');
    return (saved as AppMode) || 'neon';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Modal de Administrador (original)
  const [isClientSettingsOpen, setIsClientSettingsOpen] = useState(false); // Modal de Cliente (nuevo)
  const [isSystemLoading, setIsSystemLoading] = useState(true); // Temporizador de arranque seguro
  const [updateAvailable, setUpdateAvailable] = useState(false); // Estado de actualizador flotante

  // Estados de licenciamiento dinámico
  const [clientId, setClientId] = useState<string | null>(() => localStorage.getItem('ava_client_id'));
  const [activationKeyInput, setActivationKeyInput] = useState<string>('');
  const [licensingError, setLicensingError] = useState<string>('');
  const [isLicensingLoading, setIsLicensingLoading] = useState<boolean>(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState<boolean>(false);

  // Estilos CSS inline para el oro metálico pulido (mismos que en AdminPanel)
  const goldTextGradient = {
    background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 10px rgba(212, 175, 55, 0.1)'
  };

  const goldMetallicBg = {
    background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 30%, #B38728 70%, #AA771C 100%)',
    boxShadow: '0 4px 15px rgba(179, 135, 40, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
  };

  const goldBorderGradient = {
    position: 'relative' as const,
    border: '1px solid transparent',
    backgroundImage: 'linear-gradient(black, black), linear-gradient(135deg, #BF953F, #FCF6BA, #B38728, #AA771C)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box'
  };

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLicensingError('');
    // Limpiar espacios y guiones intermedios para normalizar la entrada
    const cleanedInput = activationKeyInput.trim().toUpperCase().replace(/[\s-]/g, '');
    if (!cleanedInput) return;

    setIsLicensingLoading(true);
    try {
      // 1. Consultar si la clave existe en Supabase de forma flexible
      let data = null;
      let error = null;

      // Intento 1: Buscar la clave exacta escrita por el usuario
      const res1 = await supabase
        .from('asistente_config')
        .select('*')
        .eq('activation_key', cleanedInput)
        .single();

      if (!res1.error && res1.data) {
        data = res1.data;
      } else {
        // Intento 2: Si no empieza con AVA, intentar agregando el prefijo 'AVA'
        if (!cleanedInput.startsWith('AVA')) {
          const res2 = await supabase
            .from('asistente_config')
            .select('*')
            .eq('activation_key', 'AVA' + cleanedInput)
            .single();
          if (!res2.error && res2.data) {
            data = res2.data;
          } else {
            // Intento 3: Intentar agregando el prefijo y los guiones de formato viejo (ej: AVA-7551-9412)
            // Si el texto limpio tiene 8 dígitos numéricos, lo formateamos
            if (/^\d{8}$/.test(cleanedInput)) {
              const formattedOldKey = `AVA-${cleanedInput.slice(0, 4)}-${cleanedInput.slice(4)}`;
              const res3 = await supabase
                .from('asistente_config')
                .select('*')
                .eq('activation_key', formattedOldKey)
                .single();
              if (!res3.error && res3.data) {
                data = res3.data;
              } else {
                error = res1.error || res2.error || res3.error;
              }
            } else {
              error = res1.error || res2.error;
            }
          }
        } else {
          // Intento 4: Si empieza con AVA pero no tiene guiones, intentar formatearlo con guiones
          // por si es una clave vieja registrada en base de datos con guiones (ej: AVA75519412 -> AVA-7551-9412)
          const numbersPart = cleanedInput.substring(3);
          if (numbersPart.length === 8) {
            const formattedOldKey = `AVA-${numbersPart.slice(0, 4)}-${numbersPart.slice(4)}`;
            const res4 = await supabase
              .from('asistente_config')
              .select('*')
              .eq('activation_key', formattedOldKey)
              .single();
            if (!res4.error && res4.data) {
              data = res4.data;
            } else {
              error = res1.error || res4.error;
            }
          } else {
            error = res1.error;
          }
        }
      }

      if (error || !data) {
        setLicensingError(`Clave de activación inválida. ${error ? 'Detalle: ' + error.message : 'No encontrada en la base de datos.'}`);
        setIsLicensingLoading(false);
        return;
      }

      // 2. Validar Hardware ID
      const currentHwId = (window as any).AndroidInterface && (window as any).AndroidInterface.getDeviceId 
        ? (window as any).AndroidInterface.getDeviceId() 
        : 'browser-test-id';

      if (data.hardware_id && data.hardware_id !== currentHwId) {
        setLicensingError('Esta clave ya está vinculada a otro dispositivo. Libérela en su panel antes de continuar.');
        setIsLicensingLoading(false);
        return;
      }

      // 3. Vincular dispositivo en Supabase
      const { error: updateError } = await supabase
        .from('asistente_config')
        .update({ hardware_id: currentHwId })
        .eq('client_id', data.client_id);

      if (updateError) throw updateError;

      // 4. Guardar datos locales y arrancar
      localStorage.setItem('ava_client_id', data.client_id);
      localStorage.setItem('ava_client_name', data.client_name);
      setClientId(data.client_id);
    } catch (err: any) {
      console.error('Error durante la activación de licencia:', err);
      setLicensingError(`Fallo de conexión: ${err.message || 'Verifique su red o credenciales'}`);
    } finally {
      setIsLicensingLoading(false);
    }
  };
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
          .eq('client_id', clientId || 'cliente_maestro')
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
        .eq('client_id', clientId || 'cliente_maestro');

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

  // Si no está licenciado y no es administrador, mostrar pantalla de activación
  if (!clientId) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center p-4 font-sans text-white select-none">
        <form 
          onSubmit={handleActivateLicense} 
          style={goldBorderGradient}
          className="w-full max-w-sm bg-[#050508] rounded-[2rem] p-8 shadow-[0_0_80px_rgba(191,149,63,0.25)] space-y-8 text-center"
        >
          <div className="space-y-2">
            <span className="text-4xl block">✨</span>
            <h1 className="text-2xl font-black uppercase tracking-widest" style={goldTextGradient}>
              Activar Asistente
            </h1>
            <div className="w-20 h-[2px] mx-auto bg-gradient-to-r from-transparent via-[#BF953F] to-transparent" />
            <p className="text-[10px] text-[#FCF6BA] uppercase tracking-widest font-semibold">
              Ingrese su clave de licencia
            </p>
          </div>

          <div className="space-y-2.5 text-left">
            <label className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">
              Clave de Activación
            </label>
            <input
              type="text"
              value={activationKeyInput}
              onChange={(e) => setActivationKeyInput(e.target.value)}
              placeholder="Ej: AVA12345678"
              className="w-full bg-black/85 border border-[#BF953F]/30 rounded-2xl px-4 py-3.5 text-white text-sm text-center font-mono font-bold tracking-widest focus:outline-none focus:border-[#FCF6BA] focus:ring-1 focus:ring-[#FCF6BA]/50 transition duration-300 placeholder-gray-700"
              required
            />
          </div>

          {licensingError && (
            <p className="text-xs text-red-500 font-bold leading-relaxed">{licensingError}</p>
          )}

          <button
            type="submit"
            disabled={isLicensingLoading}
            style={goldMetallicBg}
            className="w-full py-4 text-black font-extrabold rounded-2xl text-xs uppercase tracking-widest transition duration-300 transform active:scale-95 disabled:opacity-50 hover:brightness-110 shadow-lg cursor-pointer"
          >
            {isLicensingLoading ? 'Verificando...' : 'Activar Licencia'}
          </button>

          <button
            type="button"
            onClick={() => setIsDiagnosticOpen(true)}
            className="w-full py-3.5 bg-zinc-900 border border-red-500/40 hover:bg-zinc-800 text-red-400 font-extrabold rounded-2xl text-[10px] uppercase tracking-widest transition duration-300 transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Diagnosticar Errores 🔍</span>
          </button>
        </form>

        {/* Modal de Diagnóstico de Errores */}
        <DiagnosticModal
          isOpen={isDiagnosticOpen}
          onClose={() => setIsDiagnosticOpen(false)}
        />
      </div>
    );
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

      {/* Modal de Diagnóstico de Errores */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
      />
    </div>
  );
}

