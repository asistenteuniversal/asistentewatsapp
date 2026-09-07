import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppMode, AppSettings, ChatMessage } from './types';
import { StealthHeader } from './components/StealthHeader';
import { ChatGPTLayer } from './components/ChatGPTLayer';
import { NeonCoverLayer } from './components/NeonCoverLayer';
import { SettingsModal } from './components/SettingsModal';
import { ClientSettingsModal } from './components/ClientSettingsModal'; // Importar modal de cliente
import { AppsHubModal } from './components/AppsHubModal'; // Importar NEOAVANIA MULTIAPP Hub
import { useVoiceEngine } from './hooks/useVoiceEngine';
import { supabase } from './supabaseClient';
import { AdminPanel } from './components/AdminPanel';
import { DestroyedScreen } from './components/DestroyedScreen';

export default function App() {
  const [isAppDestroyed, setIsAppDestroyed] = useState<boolean>(() => localStorage.getItem('ava_destroyed') === 'true');
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
  const [isAppsHubOpen, setIsAppsHubOpen] = useState(false); // Modal NEOAVANIA MULTIAPP Hub
  const [isSystemLoading, setIsSystemLoading] = useState(true); // Temporizador de arranque seguro
  const [updateAvailable, setUpdateAvailable] = useState(false); // Estado de actualizador flotante
  const [connectionErrorVisible, setConnectionErrorVisible] = useState(false); // Aviso flotante de falla de conexión
  const [connectionErrorMessage, setConnectionErrorMessage] = useState('FALLA DE CONEXIÓN');
  const [errorLogs, setErrorLogs] = useState<string>(() => localStorage.getItem('ava_last_error_log') || '');

  // Estados de licenciamiento dinámico
  const [clientId, setClientId] = useState<string | null>(() => localStorage.getItem('ava_client_id'));
  const [activationKeyInput, setActivationKeyInput] = useState<string>('');
  const [licensingError, setLicensingError] = useState<string>('');
  const [isLicensingLoading, setIsLicensingLoading] = useState<boolean>(false);

  // Estados de bloqueo por licencia pausada
  const [isLicensePaused, setIsLicensePaused] = useState<boolean>(false);
  const [supportPhone, setSupportPhone] = useState<string>('527712070378');
  const [phoneCopied, setPhoneCopied] = useState<boolean>(false);

  const handleCopySupportPhone = () => {
    const num = supportPhone || '527712070378';
    navigator.clipboard.writeText(num).then(() => {
      setPhoneCopied(true);
      setTimeout(() => setPhoneCopied(false), 3000);
    });
  };

  const formatPhoneForDisplay = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('52') && clean.length === 12) {
      return `+52 ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
    }
    return `+${clean}`;
  };

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
    const rawInput = activationKeyInput.trim();

    // 🚀 DESBLOQUEO MAESTRO DIRECTO CON PIN 6551 / 86551 / AVANTAR-WHATSAPP-2026
    if (rawInput === '6551' || rawInput === '86551' || rawInput.toLowerCase() === 'manchas6551' || rawInput.toUpperCase() === 'AVANTAR-WHATSAPP-2026') {
      localStorage.setItem('ava_client_id', 'asistentewatsapp_master');
      localStorage.setItem('ava_client_name', 'Cliente Maestro WhatsApp');
      setClientId('asistentewatsapp_master');
      setIsLicensingLoading(false);
      return;
    }
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
      let currentHwId = 'browser-test-id';
      if ((window as any).AndroidInterface && (window as any).AndroidInterface.getDeviceId) {
        try {
          const nativeId = (window as any).AndroidInterface.getDeviceId();
          if (nativeId) {
            currentHwId = nativeId;
          }
        } catch (e) {
          console.error("Error al obtener ID de dispositivo nativo:", e);
        }
      } else {
        // Fallback para navegador web en PC: generar y persistir un ID único
        let browserId = localStorage.getItem('ava_browser_device_id');
        if (!browserId) {
          browserId = 'WEB-' + Math.random().toString(36).substring(2, 15).toUpperCase();
          localStorage.setItem('ava_browser_device_id', browserId);
        }
        currentHwId = browserId;
      }

      if (data.hardware_id && data.hardware_id !== currentHwId) {
        setLicensingError('ESTA CLAVE YA ESTÁ VINCULADA A OTRO DISPOSITIVO. PARA USARLA AQUÍ, NECESITA QUE NUESTRO EQUIPO LA ACTIVE EN ESTE CELULAR, POR FAVOR CONTACTE A SERVICIO AL CLIENTE. SI DESEA COMPRAR UN ASISTENTE PERSONALIZADO PARA USTED, REQUIERE UNA CLAVE NUEVA (POR DÍA, SEMANA O MES), PEDIR UNA PRUEBA O MUESTRA GRATIS, CONTACTE A SERVICIO AL CLIENTE, POR FAVOR COMUNÍQUESE A:');
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

  // Verificar actualizaciones remotas del chasis APK gobernadas desde la nube (Supabase + Cloudflare)
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const { data: adminConfig } = await supabase
          .from('asistente_config')
          .select('system_memory')
          .eq('client_id', 'admin')
          .single();

        const updatesPermitted = adminConfig && adminConfig.system_memory === 'UPDATES_ALLOWED';
        if (!updatesPermitted) {
          setUpdateAvailable(false);
          return;
        }

        const res = await fetch(`https://descargas-asistente-avantar.pages.dev/archivos/version.json?v=${new Date().getTime()}`);
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
              return;
            }
          }
        }
        setUpdateAvailable(false);
      } catch (err) {
        setUpdateAvailable(false);
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

  // Auto-reconocimiento por Hardware ID al arrancar si no hay clientId en el baúl local
  useEffect(() => {
    const checkAutoLoginByHardwareId = async () => {
      const savedClientId = localStorage.getItem('ava_client_id');
      if (savedClientId) return;

      try {
        let currentHwId = '';
        if ((window as any).AndroidInterface && (window as any).AndroidInterface.getDeviceId) {
          try {
            currentHwId = (window as any).AndroidInterface.getDeviceId();
          } catch (e) {
            console.error("Error al obtener ID de dispositivo nativo:", e);
          }
        }
        if (!currentHwId) return;

        const { data, error } = await supabase
          .from('asistente_config')
          .select('client_id, client_name, is_active')
          .eq('hardware_id', currentHwId)
          .eq('is_active', true)
          .single();

        if (!error && data && data.client_id) {
          console.log('[AutoLogin] Dispositivo reconocido por Hardware ID:', data.client_name);
          localStorage.setItem('ava_client_id', data.client_id);
          localStorage.setItem('ava_client_name', data.client_name);
          setClientId(data.client_id);
        }
      } catch (err) {
        console.warn('AutoLogin check failed:', err);
      }
    };
    checkAutoLoginByHardwareId();
  }, []);

  // Cargar Ajustes desde el almacenamiento local persistente (localStorage) del celular
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('neonSettings');
    const defaultSettings: AppSettings = {
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
      systemInstructions: '',
      systemMemory: '',
      memorySaveDate: new Date().toDateString(),
      memoryDays: 2,
      syncMemoryEnabled: true,
      voiceMaleEnabled: false
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const todayStr = new Date().toDateString();
        const maxDays = parsed.memoryDays !== undefined ? parsed.memoryDays : 2;

        // Si la fecha guardada es diferente a hoy y no estamos en modo autónomo (-1), filtrar días
        if (maxDays !== -1 && parsed.memorySaveDate && parsed.memorySaveDate !== todayStr) {
          if (maxDays > 0 && parsed.systemMemory) {
            const lines = parsed.systemMemory.split('\n');
            const filteredLines = lines.filter((line: string) => {
              const match = line.match(/^\[([^\]]+)\]/);
              if (match) {
                const lineDateStr = match[1];
                try {
                  const lineDate = new Date(lineDateStr);
                  const todayDate = new Date(todayStr);
                  const diffTime = todayDate.getTime() - lineDate.getTime();
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays < maxDays;
                } catch (err) {
                  return true;
                }
              }
              return true;
            });
            parsed.systemMemory = filteredLines.join('\n');
            parsed.memorySaveDate = todayStr;
          }
        }
        return { ...defaultSettings, ...parsed };
      } catch (e) {
        console.error(e);
      }
    }
    return defaultSettings;
  });

  // Cargar instrucciones y validar vigencia de licencia desde Supabase al abrir la app y cada 5 segundos
  useEffect(() => {
    const loadConfig = async () => {
      // Si no hay clientId o es el cliente maestro offline, no validar
      if (!clientId || clientId === 'cliente_maestro') return;

      try {
        console.log('[Supabase] Intentando cargar configuración y validar licencia...');
        const { data, error } = await supabase
          .from('asistente_config')
          .select('system_instructions, is_active, memory_days, daily_memory, system_memory')
          .eq('client_id', clientId)
          .single();

        // Si el registro fue eliminado (PGRST116 = no rows returned) -> DESTRUCCIÓN Y VACIADO TOTAL
        if (error && error.code === 'PGRST116') {
          console.warn('[Seguridad] El cliente ha sido eliminado permanentemente del servidor. Ejecutando sanitización total...');
          
          // 1. Limpiar memoria React
          setSettings((prev) => ({
            ...prev,
            systemInstructions: '',
            systemMemory: '',
          }));

          // 2. Destruir baúl local y activar sello permanente de despedida
          localStorage.removeItem('ava_client_id');
          localStorage.removeItem('ava_client_name');
          localStorage.removeItem('neonSettings');
          localStorage.setItem('google_logged_in', 'false');
          localStorage.setItem('ava_destroyed', 'true');
          setClientId(null);
          setIsGoogleLinked(false);
          setIsAppDestroyed(true);

          // 3. Ejecutar sanitización nativa oficial de Google en Android
          if ((window as any).AndroidInterface) {
            try {
              if ((window as any).AndroidInterface.purgeUserSessionAndReset) {
                (window as any).AndroidInterface.purgeUserSessionAndReset();
              } else if ((window as any).AndroidInterface.logoutGoogle) {
                (window as any).AndroidInterface.logoutGoogle();
              }
              if ((window as any).AndroidInterface.updateSystemInstructions) {
                (window as any).AndroidInterface.updateSystemInstructions('');
              }
            } catch (e) {
              console.error('Error al ejecutar sanitización nativa:', e);
            }
          }
          return;
        }

        if (error) throw error;

        if (data) {
          // Si la licencia fue pausada -> BLOQUEAR PERO NO BORRAR LOCAL
          if (data.is_active === false) {
            console.warn('[Licencia] La licencia está desactivada/pausada. Bloqueando acceso temporalmente...');
            setIsLicensePaused(true);

            // Intentar recuperar el número de soporte de la cuenta admin
            try {
              const { data: adminData } = await supabase
                .from('asistente_config')
                .select('client_phone')
                .eq('client_id', 'admin')
                .single();
              if (adminData && adminData.client_phone) {
                setSupportPhone(adminData.client_phone.trim().replace(/[^0-9]/g, ''));
              }
            } catch (e) {
              console.warn('Error al cargar número de soporte de la nube:', e);
            }
            return;
          }

          // Si la licencia es válida y activa
          setIsLicensePaused(false);

          // Configuración básica
          const cloudMemoryDays = data.memory_days !== null && data.memory_days !== undefined ? data.memory_days : 2;
          const isAutonomous = cloudMemoryDays === -1;

          // Órdenes específicas de sincronización
          const isClearOrder = data.system_memory === 'CLEAR' || data.system_memory === 'UPDATE_AND_CLEAR';
          const isUpdateOrder = data.system_memory === 'UPDATE_INSTRUCTIONS' || data.system_memory === 'UPDATE_AND_CLEAR';

          // Detectar si la nube especifica género (Voz de Mujer o Voz de Hombre)
          const cloudInstructions = data.system_instructions || '';
          let nextVoiceMale: boolean | undefined = undefined;
          if (cloudInstructions.includes('asistente femenina (mujer)')) {
            nextVoiceMale = false;
          } else if (cloudInstructions.includes('asistente masculino (hombre)')) {
            nextVoiceMale = true;
          }

          setSettings((prev) => {
            const nextDays = cloudMemoryDays;
            const nextSyncEnabled = !isAutonomous;
            const nextMemory = isClearOrder ? '' : (prev.systemMemory || '');
            const targetVoiceMale = nextVoiceMale !== undefined ? nextVoiceMale : prev.voiceMaleEnabled;
            
            // Sincronizar siempre las instrucciones más recientes desde la nube si están disponibles
            const nextInstructions = data.system_instructions !== undefined && data.system_instructions !== null
              ? data.system_instructions
              : (prev.systemInstructions || '');

            // Evitar ciclos de render innecesarios
            if (prev.systemInstructions === nextInstructions && 
                prev.systemMemory === nextMemory &&
                prev.memoryDays === nextDays &&
                prev.syncMemoryEnabled === nextSyncEnabled &&
                prev.voiceMaleEnabled === targetVoiceMale) {
              return prev;
            }

            return {
              ...prev,
              systemInstructions: nextInstructions,
              systemMemory: nextMemory,
              memoryDays: nextDays,
              syncMemoryEnabled: nextSyncEnabled,
              voiceMaleEnabled: targetVoiceMale
            };
          });

          // 1. Inyectar primero en Android las instrucciones limpias/actualizadas para que Java lo guarde en memoria
          const rawIncomingInstructions = isUpdateOrder ? (data.system_instructions || '') : (settings.systemInstructions || '');
          const currentMemory = isClearOrder ? '' : (settings.systemMemory || '');
          const cleanMemory = currentMemory.replace(/^\[[^\]]+\]\s*/gm, '');

          // Limpiar de forma blindada cualquier bloque de identidad duplicado que ya viniera en el texto
          const baseInstructions = rawIncomingInstructions.replace(/^\[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE\]:[\s\S]*?\n\n/gm, '');

          // Extraer personalización elegida por el cliente (Nombre, Género y Personalidad)
          const customName = localStorage.getItem('ava_custom_assistant_name') || 'Asistente';
          const customPersonalityPrompt = localStorage.getItem('ava_custom_personality_prompt') || 'Habla de forma muy culta, distinguida, educada y profesional. Usa un vocabulario refinado y respetuoso.';
          const genderDirective = settings.voiceMaleEnabled
            ? 'GÉNERO E IDENTIDAD: Eres un asistente masculino (hombre). Expresate, habla y reconócete siempre como hombre en todas tus respuestas.'
            : 'GÉNERO E IDENTIDAD: Eres una asistente femenina (mujer). Expresate, habla y reconócete siempre como mujer en todas tus respuestas.';

          const identityHeader = `[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE]:\nTu nombre oficial es: "${customName}". Cuando el usuario te pregunte cómo te llamas o se dirija a ti, responde y reconócete siempre con este nombre.\n${genderDirective}\nESTILO DE COMUNICACIÓN: ${customPersonalityPrompt}\n\n`;

          const fullInstructionsWithIdentity = `${identityHeader}${baseInstructions}`;

          const mergedText = cleanMemory.trim()
            ? `${fullInstructionsWithIdentity}\n\n[MEMORIA DE CONVERSACIONES ANTERIORES CON EL USUARIO (Esta es tu memoria de lo que platicaste anteriormente con la persona con la que estás hablando. No repitas nada de lo que está aquí, son solo tus recuerdos de hoy. Es información confidencial de tu pasado inmediato, úsala solo como referencia para responder)]: \n${cleanMemory}`
            : fullInstructionsWithIdentity;

          if ((window as any).AndroidInterface && (window as any).AndroidInterface.updateSystemInstructions) {
            try {
              (window as any).AndroidInterface.updateSystemInstructions(mergedText);
              console.log('[Sincronización] Instrucciones con identidad y memoria limpia enviadas a Java exitosamente.');
            } catch (e) {
              console.error('Error inyectando instrucciones a Java:', e);
            }
          }

          // 2. Si hubo orden de sincronización o borrado, recargar Google Studio y luego confirmar a Supabase
          const shouldTriggerSync = isClearOrder || isUpdateOrder;
          if (shouldTriggerSync && clientId) {
            // Dar un margen seguro de 300ms para asegurar que Java asignó la variable en memoria
            setTimeout(async () => {
              if ((window as any).AndroidInterface && (window as any).AndroidInterface.reloadStudio) {
                try {
                  (window as any).AndroidInterface.reloadStudio();
                  console.log('[Sincronización] Google AI Studio recargado con la nueva configuración.');
                } catch (e) {
                  console.error('Error reloading Studio:', e);
                }
              }

              // 3. Confirmar a Supabase que la orden fue consumida e instalada en el dispositivo
              try {
                const updatePayload: any = { system_memory: '' };
                if (isClearOrder) {
                  updatePayload.daily_memory = '';
                }
                await supabase
                  .from('asistente_config')
                  .update(updatePayload)
                  .eq('client_id', clientId);
                console.log('[Sincronización] Orden consumida y bandera reseteada en Supabase (Foquito verde confirmado al 100%).');
              } catch (errSupabase) {
                console.error('Error confirmando orden en Supabase:', errSupabase);
              }
            }, 300);
          }
          return; // Salir con éxito
        }
      } catch (err: any) {
        console.warn('[Supabase] Falló validación remota. Manteniendo sesión offline para evitar bloqueos por red:', err);
      }

      // Fallback: Si no hay instrucciones previas en el teléfono, cargar configuración base
      try {
        const res = await fetch(`/asistente_config.json?v=${new Date().getTime()}`);
        if (res.ok) {
          const localData = await res.json();
          if (localData && localData.systemInstructions) {
            setSettings((prev) => {
              if (prev.systemInstructions && prev.systemInstructions.trim().length > 0) return prev;
              if ((window as any).AndroidInterface && (window as any).AndroidInterface.updateSystemInstructions) {
                (window as any).AndroidInterface.updateSystemInstructions(localData.systemInstructions);
              }
              return {
                ...prev,
                systemInstructions: localData.systemInstructions,
              };
            });
          }
        }
      } catch (err) {
        console.error('[Fallback] Error al cargar archivo local:', err);
      }
    };

    loadConfig();

    // ⚡ Escuchar cambios en tiempo real por WebSocket desde Supabase
    const channel = supabase
      .channel(`mobile_realtime_${clientId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'asistente_config', filter: `client_id=eq.${clientId}` },
        (payload) => {
          console.log('[MobileRealtime] Cambio detectado desde la web:', payload);
          loadConfig();
        }
      )
      .subscribe();

    // Polling de respaldo cada 4 segundos
    const interval = setInterval(() => {
      loadConfig();
    }, 4000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  // Guardar Ajustes en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem('neonSettings', JSON.stringify(settings));
  }, [settings]);

  // Sincronizar el estado del botón de voz de hombre con Android
  useEffect(() => {
    if ((window as any).AndroidInterface && (window as any).AndroidInterface.updateVoiceOption) {
      try {
        (window as any).AndroidInterface.updateVoiceOption(!!settings.voiceMaleEnabled);
      } catch (e) {
        console.error('Error al sincronizar opción de voz:', e);
      }
    }
  }, [settings.voiceMaleEnabled]);

  // Escuchar transcripciones extraídas de Google y guardarlas en la memoria diaria
  useEffect(() => {
    (window as any).onGoogleTranscriptExtracted = (text: string) => {
      if (text && text.trim()) {
        setSettings((prev) => {
          const currentMemory = prev.systemMemory || '';
          const cleanText = text.trim();
          // Evitar duplicar el mismo bloque de conversación
          if (currentMemory.includes(cleanText)) return prev;

          const now = new Date();
          const formattedDate = now.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const formattedTime = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
          const todayPrefix = `[${formattedDate} ${formattedTime}]`;

          const newMemory = currentMemory.trim()
            ? `${currentMemory}\n${todayPrefix} ${cleanText}`
            : `${todayPrefix} ${cleanText}`;
          return {
            ...prev,
            systemMemory: newMemory,
            memorySaveDate: now.toDateString(),
            memorySaveTimestamp: now.getTime(),
          };
        });
      }
    };

    // Escuchar avisos de corte o falla de conexión desde el motor nativo o Google Studio
    let lastHandledErrorTimestamp = 0;
    (window as any).onGoogleStreamError = (errorDetail?: string) => {
      const nowMs = Date.now();
      // Debounce de 3 segundos para evitar registrar la misma falla dos veces
      if (nowMs - lastHandledErrorTimestamp < 3000) {
        return;
      }
      lastHandledErrorTimestamp = nowMs;

      console.warn('[FallaConexión] Detectada desconexión en vivo:', errorDetail);
      setConnectionErrorVisible(true);
      setConnectionErrorMessage('FALLA DE CONEXIÓN');

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const dateFormatted = `${pad(now.getDate())}/${months[now.getMonth()]}/${now.getFullYear()}`;
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const timeFormatted = `${pad(hours)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${ampm}`;
      const newLine = `[${dateFormatted} ${timeFormatted}] ${errorDetail || 'Connection failed'}`;

      const previousLogs = localStorage.getItem('ava_last_error_log') || '';
      const logsArray = previousLogs.split('\n').filter(Boolean);
      
      // Evitar duplicar la misma línea exacta si ya estuviera arriba
      if (logsArray.length === 0 || logsArray[0] !== newLine) {
        logsArray.unshift(newLine); // Agregar al inicio (más reciente arriba)
      }
      
      const trimmedLogs = logsArray.slice(0, 100).join('\n'); // Conservar hasta 100 registros
      localStorage.setItem('ava_last_error_log', trimmedLogs);
      setErrorLogs(trimmedLogs);
    };

    return () => {
      delete (window as any).onGoogleTranscriptExtracted;
      delete (window as any).onGoogleStreamError;
    };
  }, []);

  // Sincronizar memoria de hoy (systemMemory) con Supabase en tiempo real (si está en modo vinculado)
  useEffect(() => {
    const syncMemoryToNube = async () => {
      if (!clientId || clientId === 'cliente_maestro') return;
      // Si el celular está en modo Autónomo (-1), no enviar nada a la nube
      if (settings.memoryDays === -1) {
        console.log('[Memoria] Modo Autónomo activo. Bloqueada sincronización de subida a Supabase.');
        return;
      }
      try {
        const memory = settings.systemMemory || '';
        await supabase
          .from('asistente_config')
          .update({ daily_memory: memory })
          .eq('client_id', clientId);
      } catch (e) {
        console.error('[Supabase] Error al sincronizar memoria diaria:', e);
      }
    };

    syncMemoryToNube();
  }, [settings.systemMemory, settings.memoryDays, clientId]);

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
        const cleanMemory = memory.replace(/^\[[^\]]+\]\s*/gm, ''); // Eliminar marcas de fecha para la IA
        const mergedText = cleanMemory.trim()
          ? `${instructions}\n\n[MEMORIA DE CONVERSACIONES ANTERIORES CON EL USUARIO (Esta es tu memoria de lo que platicaste anteriormente con la persona con la que estás hablando. No repitas nada de lo que está aquí, son solo tus recuerdos de hoy. Es información confidencial de tu pasado inmediato, úsala solo como referencia para responder)]: \n${cleanMemory}`
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

  // =========================================================================================
  // 🛑🛑🛑 [ZONA SAGRADA DE MÁXIMA SEGURIDAD - DISPARADORES DE LLAMADA Y VIDEOLLAMADA] 🛑🛑🛑
  // ⚠️⚠️⚠️ ¡ESTRICTAMENTE PROHIBIDO MODIFICAR O REFACTORIZAR ESTAS DOS FUNCIONES! ⚠️⚠️⚠️
  // handleToggleCall (Videollamada con flag nativo) y handleToggleAudioCall (Llamada de voz).
  // Ambos están 100% probados y funcionando idénticos a la copia de seguridad 1-1.
  // =========================================================================================
  const handleToggleCall = useCallback(async () => {
    // 1. Toggle call locally in UI
    await voiceEngine.toggleCall();

    const willBeActive = !voiceEngine.isCallActive;

    // 2. Tell the native Android app directly (if running inside APK)
    if ((window as any).AndroidInterface) {
      try {
        if (willBeActive) {
          // Asegurar sincronización de instrucciones previa al inicio de llamada
          if ((window as any).AndroidInterface.updateSystemInstructions) {
            try {
              const instructions = settings.systemInstructions || '';
              const memory = settings.systemMemory || '';
              const cleanMemory = memory.replace(/^\[[^\]]+\]\s*/gm, '');
              const mergedText = cleanMemory.trim()
                ? `${instructions}\n\n[MEMORIA DE CONVERSACIONES ANTERIORES CON EL USUARIO (Esta es tu memoria de lo que platicaste anteriormente con la persona con la que estás hablando. No repitas nada de lo que está aquí, son solo tus recuerdos de hoy. Es información confidencial de tu pasado inmediato, úsala solo como referencia para responder)]: \n${cleanMemory}`
                : instructions;
              (window as any).AndroidInterface.updateSystemInstructions(mergedText);
            } catch (e) {
              console.error(e);
            }
          }
          (window as any).AndroidInterface.startVoiceCall();
        } else {
          setIsSystemLoading(true); // <── ¡Activa la línea de protección al instante!
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
  }, [voiceEngine, settings.systemInstructions, settings.systemMemory]);

  const handleToggleAudioCall = useCallback(async () => {
    await voiceEngine.toggleCall();
    const willBeActive = !voiceEngine.isCallActive;

    if ((window as any).AndroidInterface) {
      try {
        if (willBeActive) {
          // Asegurar sincronización de instrucciones previa al inicio de llamada
          if ((window as any).AndroidInterface.updateSystemInstructions) {
            try {
              const instructions = settings.systemInstructions || '';
              const memory = settings.systemMemory || '';
              const cleanMemory = memory.replace(/^\[[^\]]+\]\s*/gm, '');
              const mergedText = cleanMemory.trim()
                ? `${instructions}\n\n[MEMORIA DE CONVERSACIONES ANTERIORES CON EL USUARIO (Esta es tu memoria de lo que platicaste anteriormente con la persona con la que estás hablando. No repitas nada de lo que está aquí, son solo tus recuerdos de hoy. Es información confidencial de tu pasado inmediato, úsala solo como referencia para responder)]: \n${cleanMemory}`
                : instructions;
              (window as any).AndroidInterface.updateSystemInstructions(mergedText);
            } catch (e) {
              console.error(e);
            }
          }
          (window as any).AndroidInterface.startVoiceCall(false); // Llamada de audio (con el flag false)
        } else {
          setIsSystemLoading(true); // <── ¡Activa la línea de protección al instante!
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
  // =========================================================================================
  // 🛑🛑🛑 [FIN DE ZONA SAGRADA DE LLAMADAS Y VIDEOLLAMADAS] 🛑🛑🛑
  // =========================================================================================

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
  }, [clientId]);

  if (mode === 'admin') {
    return <AdminPanel />;
  }

  // Si la aplicación fue destruida/finalizada por el administrador
  if (isAppDestroyed) {
    return <DestroyedScreen />;
  }

  // Si la licencia está temporalmente pausada
  if (isLicensePaused) {
    const displayPhone = formatPhoneForDisplay(supportPhone);

    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center p-4 font-sans text-white select-none">
        <div 
          style={goldBorderGradient}
          className="w-full max-w-sm bg-[#050508] rounded-[2rem] p-8 shadow-[0_0_80px_rgba(191,149,63,0.3)] text-center space-y-8"
        >
          <div className="space-y-4">
            <span className="text-5xl block animate-pulse">🔒</span>
            <h1 className="text-xl font-black uppercase tracking-widest text-red-500">
              ACCESO DESACTIVADO
            </h1>
            <div className="w-20 h-[2px] mx-auto bg-gradient-to-r from-transparent via-[#BF953F] to-transparent" />
            <p className="text-[11px] sm:text-xs text-white leading-relaxed font-extrabold uppercase tracking-wide">
              PARA ACTIVAR SU ASISTENTE (POR DÍA, SEMANA O MES), SOLICITAR UNA PRUEBA GRATIS, O HABLAR CON VENTAS Y SOPORTE, COMUNÍQUESE A:
            </p>
            <p className="text-xl sm:text-2xl font-mono font-black text-[#FCF6BA] tracking-wider mt-2 select-text">
              {displayPhone}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCopySupportPhone}
              style={phoneCopied ? { backgroundColor: '#15803d', color: '#ffffff' } : { backgroundColor: '#25D366', color: '#000000' }}
              className="w-full py-4 text-black font-extrabold rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-95 hover:brightness-110 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{phoneCopied ? '✅ ¡NÚMERO COPIADO AL PORTAPAPELES!' : '📋 COPIAR NÚMERO DE SOPORTE'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if ((window as any).AndroidInterface && (window as any).AndroidInterface.closeApp) {
                  (window as any).AndroidInterface.closeApp();
                } else {
                  window.close();
                }
              }}
              className="w-full py-3 bg-zinc-900/80 border border-zinc-800 text-zinc-500 font-semibold rounded-2xl text-[10px] uppercase tracking-widest hover:text-white transition duration-200 cursor-pointer"
            >
              Cerrar Aplicación
            </button>
          </div>
        </div>
      </div>
    );
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

          {/* BOTON DE ACTIVAR LICENCIA - Subido justo debajo de la clave */}
          <button
            type="submit"
            disabled={isLicensingLoading}
            style={goldMetallicBg}
            className="w-full py-4 text-black font-extrabold rounded-2xl text-xs uppercase tracking-widest transition duration-300 transform active:scale-95 disabled:opacity-50 hover:brightness-110 shadow-lg cursor-pointer"
          >
            {isLicensingLoading ? 'Verificando...' : 'Activar Licencia'}
          </button>

          {/* MENSAJES DE ERROR Y BLOQUEO POR DUPLICADO */}
          {licensingError && (
            licensingError.includes('VINCULADA') ? (
              <div className="space-y-4 text-left border border-zinc-800/80 bg-zinc-950/40 p-4 rounded-2xl">
                <p className="text-[11px] sm:text-xs text-white leading-relaxed font-extrabold uppercase tracking-wide">
                  ESTA CLAVE YA ESTÁ VINCULADA A OTRO DISPOSITIVO. PARA USARLA AQUÍ, NECESITA QUE NUESTRO EQUIPO LA ACTIVE EN ESTE CELULAR, POR FAVOR CONTACTE A SERVICIO AL CLIENTE.
                </p>
                <p className="text-[11px] sm:text-xs text-white leading-relaxed font-extrabold uppercase tracking-wide">
                  SI DESEA COMPRAR UN ASISTENTE PERSONALIZADO PARA USTED, REQUIERE UNA CLAVE NUEVA (POR DÍA, SEMANA O MES), PEDIR UNA PRUEBA O MUESTRA GRATIS, CONTACTE A SERVICIO AL CLIENTE, POR FAVOR COMUNÍQUESE A:
                </p>
                <p className="text-lg sm:text-xl font-mono font-black text-[#FCF6BA] tracking-wider text-center select-text mt-1">
                  {formatPhoneForDisplay(supportPhone)}
                </p>
                <button
                  type="button"
                  onClick={handleCopySupportPhone}
                  style={phoneCopied ? { backgroundColor: '#15803d', color: '#ffffff' } : { backgroundColor: '#25D366', color: '#000000' }}
                  className="w-full py-3 text-black font-extrabold rounded-xl text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-95 hover:brightness-110 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{phoneCopied ? '✅ ¡NÚMERO COPIADO!' : '📋 COPIAR NÚMERO'}</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-red-500 font-bold leading-relaxed text-center">{licensingError}</p>
            )
          )}

        </form>
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
            onOpenAppsHub={() => setIsAppsHubOpen(true)}
            updateAvailable={updateAvailable}
            connectionErrorVisible={connectionErrorVisible}
            connectionErrorMessage={connectionErrorMessage}
            onDismissConnectionError={() => setConnectionErrorVisible(false)}
          />
        </div>
      </main>

      {/* Modal de Ajustes del Cliente (Público) */}
      <ClientSettingsModal
        isOpen={isClientSettingsOpen}
        onClose={() => {
          setIsClientSettingsOpen(false);
          setIsSystemLoading(true); // Activar línea de carga de seguridad de 4s
        }}
        isGoogleLinked={isGoogleLinked}
        setIsGoogleLinked={setIsGoogleLinked}
        settings={settings}
        setSettings={setSettings}
        onTriggerSecurityLoading={() => setIsSystemLoading(true)}
      />

      {/* Settings Modal (Administrador) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        settings={settings}
        setSettings={setSettings}
        errorLogs={errorLogs}
      />

      {/* Modal NEOAVANIA MULTIAPP Hub */}
      <AppsHubModal
        isOpen={isAppsHubOpen}
        onClose={() => setIsAppsHubOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenClientSettings={() => setIsClientSettingsOpen(true)}
      />
    </div>
  );
}