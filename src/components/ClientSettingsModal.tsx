import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, LogOut, Loader2, Sparkles, AlertTriangle, Trash2 } from 'lucide-react';
import { AppSettings } from '../types';
import { supabase } from '../supabaseClient';

export interface PersonalityPreset {
  id: string;
  label: string;
  prompt: string;
}

// 6 Estilos de Negocio y Carácter (Elegantes, sin emojis)
export const DEFAULT_BUSINESS_STYLES: PersonalityPreset[] = [
  {
    id: 'elegante',
    label: 'ELEGANTE Y FORMAL',
    prompt: 'Habla de forma muy culta, distinguida, educada y profesional. Usa un vocabulario refinado y respetuoso.'
  },
  {
    id: 'negociador',
    label: 'NEGOCIADOR',
    prompt: 'Sé un negociador implacable, persuasivo, orientado a acuerdos comerciales, estrategia de negocios y cierre de tratos firmes.'
  },
  {
    id: 'ventas',
    label: 'ASESOR DE VENTAS',
    prompt: 'Sé un asesor de ventas de alto nivel. Enfócate en identificar necesidades, convencer, superar objeciones y cerrar ventas exitosas.'
  },
  {
    id: 'cobranza',
    label: 'COBRANZA Y SEGUIMIENTO',
    prompt: 'Enfócate en cobranza efectiva, seguimiento a pagos pendientes, acuerdos financieros y comunicación firme y profesional.'
  },
  {
    id: 'administrador',
    label: 'ADMINISTRADOR',
    prompt: 'Enfócate en administración, finanzas, control de gastos, organización operativa y eficiencia de recursos.'
  },
  {
    id: 'barrio',
    label: 'ESTILO DE BARRIO',
    prompt: 'Habla con el estilo y el acento del barrio de Tepito y compórtate como una persona de barrio. IMPORTANTE: Sé simpático pero NUNCA uses groserías, vulgaridades ni albures ofensivos.'
  }
];

// 4 Asistentes Exclusivos (Elegantes, sin emojis)
export const DEFAULT_EXCLUSIVE_ASSISTANTS: PersonalityPreset[] = [
  {
    id: 'asistente_personal',
    label: 'ASISTENTE PERSONAL',
    prompt: 'Eres el Asistente Personal exclusivo del usuario. Administra su agenda, sus prioridades, sus recordatorios y apóyalo en su vida diaria con absoluta lealtad y eficiencia.'
  },
  {
    id: 'asistente_trabajo',
    label: 'ASISTENTE DE TRABAJO',
    prompt: 'Eres el Asistente de Trabajo especializado del usuario. Enfócate al 100% en su oficio, sus tareas laborales, clientes y proyectos profesionales.'
  },
  {
    id: 'amigo',
    label: 'AMIGO',
    prompt: 'Eres el mejor amigo y confidente del usuario. Habla con total confianza, lealtad, calidez, cercanía y apoyo incondicional.'
  },
  {
    id: 'alguien_especial',
    label: 'ALGUIEN ESPECIAL',
    prompt: 'Eres una compañía muy especial, afectuosa, cariñosa, tierna y atenta. Exprésate con cariño sincero y compañía íntima en cada respuesta.'
  }
];

interface ClientSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGoogleLinked: boolean;
  setIsGoogleLinked: (value: boolean) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onTriggerSecurityLoading?: () => void;
}

export const ClientSettingsModal: React.FC<ClientSettingsModalProps> = ({
  isOpen,
  onClose,
  isGoogleLinked,
  setIsGoogleLinked,
  settings,
  setSettings,
  onTriggerSecurityLoading
}) => {
  const [assistantName, setAssistantName] = useState(() => {
    const raw = localStorage.getItem('ava_custom_assistant_name') || '';
    return raw === '.' ? 'AVA' : raw;
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('ava_custom_user_name') || '';
  });

  // Presets activos
  const [businessStyles, setBusinessStyles] = useState(DEFAULT_BUSINESS_STYLES);
  const [exclusiveAssistants, setExclusiveAssistants] = useState(DEFAULT_EXCLUSIVE_ASSISTANTS);

  // Selección actual
  const [selectedStyleId, setSelectedStyleId] = useState('elegante');
  const [selectedAssistantId, setSelectedAssistantId] = useState('asistente_personal');

  // Estados de guardado
  const [isApplyingAgent, setIsApplyingAgent] = useState(false);
  const [agentSuccess, setAgentSuccess] = useState(false);

  const [isApplyingStyle, setIsApplyingStyle] = useState(false);
  const [styleSuccess, setStyleSuccess] = useState(false);

  // Modal de advertencia de borrado de memoria al guardar comportamiento
  const [showStyleWarning, setShowStyleWarning] = useState(false);

  // Modal de confirmación para borrar conversaciones voluntariamente
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('ava_custom_assistant_name') || '';
    const savedUserName = localStorage.getItem('ava_custom_user_name') || '';
    setAssistantName(savedName === '.' ? 'AVA' : savedName);
    setUserName(savedUserName);

    // Leer presets enviados desde la web si existen
    const instructions = settings.systemInstructions || '';
    const matchPresets = instructions.match(/\[BOTONES_PERSONALIDADES\]:\s*(\[\{.*?\}\])/);
    if (matchPresets && matchPresets[1]) {
      try {
        const parsed = JSON.parse(matchPresets[1]);
        if (Array.isArray(parsed)) {
          // Si contiene viejos presets como 'alegre' o 'conciso', mapear a los nuevos estilos por defecto
          const hasLegacy = parsed.some((p: any) => p.id === 'alegre' || p.id === 'conciso' || p.id === 'agresivo' || p.id === 'ejecutivo');
          if (!hasLegacy) {
            if (parsed.length === 6) setBusinessStyles(parsed);
            else if (parsed.length === 10) {
              setBusinessStyles(parsed.slice(0, 6));
              setExclusiveAssistants(parsed.slice(6, 10));
            }
          } else {
            setBusinessStyles(DEFAULT_BUSINESS_STYLES);
            setExclusiveAssistants(DEFAULT_EXCLUSIVE_ASSISTANTS);
          }
        }
      } catch (e) {
        console.error('Error parseando presets:', e);
      }
    } else {
      setBusinessStyles(DEFAULT_BUSINESS_STYLES);
      setExclusiveAssistants(DEFAULT_EXCLUSIVE_ASSISTANTS);
    }

    // Detectar estilo activo
    for (const b of DEFAULT_BUSINESS_STYLES) {
      if (instructions.includes(b.prompt)) {
        setSelectedStyleId(b.id);
        break;
      }
    }
    for (const a of DEFAULT_EXCLUSIVE_ASSISTANTS) {
      if (instructions.includes(a.prompt)) {
        setSelectedAssistantId(a.id);
        break;
      }
    }

    setIsApplyingAgent(false);
    setAgentSuccess(false);
    setIsApplyingStyle(false);
    setStyleSuccess(false);
  }, [isOpen, settings.systemInstructions]);

  if (!isOpen) return null;

  const activeLinkedState = (window as any).AndroidInterface && (window as any).AndroidInterface.isGoogleSessionActive
    ? (window as any).AndroidInterface.isGoogleSessionActive()
    : isGoogleLinked;

  const handleLinkGoogle = () => {
    if (activeLinkedState) return;
    if ((window as any).AndroidInterface && (window as any).AndroidInterface.showStudio) {
      try {
        (window as any).AndroidInterface.showStudio(true);
        onClose();
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("Esta opción solo está disponible dentro de la aplicación de celular.");
    }
  };

  const handleLogoutGoogle = () => {
    if ((window as any).AndroidInterface && (window as any).AndroidInterface.logoutGoogle) {
      try {
        (window as any).AndroidInterface.logoutGoogle();
        setIsGoogleLinked(false);
        localStorage.setItem('google_logged_in', 'false');
        onClose();
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("Esta opción solo está disponible dentro de la aplicación de celular.");
    }
  };

  // 🎙️ CAMBIO INSTANTÁNEO DE VOZ Y GÉNERO
  const handleToggleVoiceInstant = async () => {
    const nextVoiceMale = !settings.voiceMaleEnabled;
    const clientId = localStorage.getItem('ava_client_id') || 'al_pachus_9468';
    let finalName = assistantName.trim() || localStorage.getItem('ava_custom_assistant_name') || 'AVA';
    if (finalName === '.') finalName = 'AVA';
    const finalUserName = userName.trim() || localStorage.getItem('ava_custom_user_name') || '';

    const activeStyle = businessStyles.find(b => b.id === selectedStyleId) || businessStyles[0];
    const activeAgent = exclusiveAssistants.find(a => a.id === selectedAssistantId) || exclusiveAssistants[0];

    const genderDirective = nextVoiceMale
      ? 'GÉNERO E IDENTIDAD: Eres un asistente masculino (hombre). Expresate, habla y reconócete siempre como hombre en todas tus respuestas.'
      : 'GÉNERO E IDENTIDAD: Eres una asistente femenina (mujer). Expresate, habla y reconócete siempre como mujer en todas tus respuestas.';

    const userDirective = finalUserName
      ? `El usuario se llama: "${finalUserName}". Dirígete siempre a él con este nombre cuando hables con él.\n`
      : '';

    const allPresets = [...businessStyles, ...exclusiveAssistants];
    const presetsMeta = `[BOTONES_PERSONALIDADES]: ${JSON.stringify(allPresets)}\n`;

    const identityHeader = `[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE]:\nTu nombre oficial es: "${finalName}". Cuando el usuario te pregunte cómo te llamas o se dirija a ti, responde y reconócete siempre con este nombre.\n${userDirective}${genderDirective}\n${presetsMeta}ROL DE ASISTENTE: ${activeAgent.prompt}\nESTILO DE COMUNICACIÓN: ${activeStyle.prompt}\n\n`;

    const rawBase = (settings.systemInstructions || '')
      .replace(/^\[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE\]:[\s\S]*?\n\n/gm, '')
      .replace(/\[BOTONES_PERSONALIDADES\]:.*$/gm, '')
      .replace(/GÉNERO E IDENTIDAD:.*$/gm, '')
      .trim();
    const fullInstructions = `${identityHeader}${rawBase}`;

    // 1. Actualizar React localmente
    setSettings((prev) => ({
      ...prev,
      voiceMaleEnabled: nextVoiceMale,
      systemInstructions: fullInstructions
    }));

    // 2. Inyectar a Android nativo
    if ((window as any).AndroidInterface) {
      try {
        if ((window as any).AndroidInterface.updateVoiceOption) {
          (window as any).AndroidInterface.updateVoiceOption(nextVoiceMale);
        }
        if ((window as any).AndroidInterface.updateSystemInstructions) {
          (window as any).AndroidInterface.updateSystemInstructions(fullInstructions);
        }
        if ((window as any).AndroidInterface.reloadStudio) {
          (window as any).AndroidInterface.reloadStudio();
        }
      } catch (e) {
        console.error('Error inyectando voz a Java:', e);
      }
    }

    // 3. Sincronizar con Supabase
    try {
      await supabase
        .from('asistente_config')
        .update({ system_instructions: fullInstructions })
        .eq('client_id', clientId);
      console.log('[Supabase] Voz y género actualizados exitosamente.');
    } catch (errSupabase) {
      console.warn('[Supabase] Error actualizando voz en Supabase:', errSupabase);
    }
  };

  // 📦 GUARDADO DEL CUADRO 1: GUARDAR ASISTENTE (NO BORRA MEMORIA)
  const handleSaveAgentAndNames = async () => {
    setIsApplyingAgent(true);
    setAgentSuccess(false);

    let finalName = assistantName.trim() || 'AVA';
    if (finalName === '.') finalName = 'AVA';
    const finalUserName = userName.trim();
    localStorage.setItem('ava_custom_assistant_name', finalName);
    localStorage.setItem('ava_custom_user_name', finalUserName);
    setAssistantName(finalName);
    setUserName(finalUserName);

    const activeAgent = exclusiveAssistants.find(a => a.id === selectedAssistantId) || exclusiveAssistants[0];
    localStorage.setItem('ava_custom_agent_id', activeAgent.id);

    const activeStyle = businessStyles.find(b => b.id === selectedStyleId) || businessStyles[0];
    const clientId = localStorage.getItem('ava_client_id') || 'al_pachus_9468';

    const genderDirective = settings.voiceMaleEnabled
      ? 'GÉNERO E IDENTIDAD: Eres un asistente masculino (hombre). Expresate, habla y reconócete siempre como hombre en todas tus respuestas.'
      : 'GÉNERO E IDENTIDAD: Eres una asistente femenina (mujer). Expresate, habla y reconócete siempre como mujer en todas tus respuestas.';

    const userDirective = finalUserName
      ? `El usuario se llama: "${finalUserName}". Dirígete siempre a él con este nombre cuando hables con él.\n`
      : '';

    const allPresets = [...businessStyles, ...exclusiveAssistants];
    const presetsMeta = `[BOTONES_PERSONALIDADES]: ${JSON.stringify(allPresets)}\n`;

    const identityHeader = `[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE]:\nTu nombre oficial es: "${finalName}". Cuando el usuario te pregunte cómo te llamas o se dirija a ti, responde y reconócete siempre con este nombre.\n${userDirective}${genderDirective}\n${presetsMeta}ROL DE ASISTENTE: ${activeAgent.prompt}\nESTILO DE COMUNICACIÓN: ${activeStyle.prompt}\n\n`;

    const rawBase = (settings.systemInstructions || '')
      .replace(/^\[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE\]:[\s\S]*?\n\n/gm, '')
      .replace(/\[BOTONES_PERSONALIDADES\]:.*$/gm, '')
      .replace(/GÉNERO E IDENTIDAD:.*$/gm, '')
      .trim();
    const fullInstructions = `${identityHeader}${rawBase}`;

    try {
      await supabase
        .from('asistente_config')
        .update({
          system_instructions: fullInstructions,
          client_name: finalUserName || undefined
        })
        .eq('client_id', clientId);
    } catch (err) {
      console.warn('Error guardando asistente en Supabase:', err);
    }

    // Actualizar instrucciones en React SIN BORRAR memoria
    setSettings((prev) => ({
      ...prev,
      systemInstructions: fullInstructions
    }));

    if ((window as any).AndroidInterface) {
      try {
        if ((window as any).AndroidInterface.updateSystemInstructions) {
          (window as any).AndroidInterface.updateSystemInstructions(fullInstructions);
        }
        if ((window as any).AndroidInterface.reloadStudio) {
          (window as any).AndroidInterface.reloadStudio();
        }
      } catch (e) {
        console.error('Error aplicando a Java:', e);
      }
    }

    setTimeout(() => {
      setIsApplyingAgent(false);
      setAgentSuccess(true);
      setTimeout(() => setAgentSuccess(false), 2000);
    }, 500);
  };

  // 🎭 CUADRO 2: GUARDAR COMPORTAMIENTO (BORRA MEMORIA DE CONVERSACIONES)
  const confirmApplyStyle = async () => {
    setShowStyleWarning(false);
    setIsApplyingStyle(true);
    setStyleSuccess(false);

    const activeStyle = businessStyles.find(b => b.id === selectedStyleId) || businessStyles[0];
    localStorage.setItem('ava_custom_personality_id', activeStyle.id);
    localStorage.setItem('ava_custom_personality_prompt', activeStyle.prompt);

    const activeAgent = exclusiveAssistants.find(a => a.id === selectedAssistantId) || exclusiveAssistants[0];

    let finalName = assistantName.trim() || 'AVA';
    if (finalName === '.') finalName = 'AVA';
    const finalUserName = userName.trim();
    const clientId = localStorage.getItem('ava_client_id') || 'al_pachus_9468';

    const genderDirective = settings.voiceMaleEnabled
      ? 'GÉNERO E IDENTIDAD: Eres un asistente masculino (hombre). Expresate, habla y reconócete siempre como hombre en todas tus respuestas.'
      : 'GÉNERO E IDENTIDAD: Eres una asistente femenina (mujer). Expresate, habla y reconócete siempre como mujer en todas tus respuestas.';

    const userDirective = finalUserName
      ? `El usuario se llama: "${finalUserName}". Dirígete siempre a él con este nombre cuando hables con él.\n`
      : '';

    const allPresets = [...businessStyles, ...exclusiveAssistants];
    const presetsMeta = `[BOTONES_PERSONALIDADES]: ${JSON.stringify(allPresets)}\n`;

    const identityHeader = `[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE]:\nTu nombre oficial es: "${finalName}". Cuando el usuario te pregunte cómo te llamas o se dirija a ti, responde y reconócete siempre con este nombre.\n${userDirective}${genderDirective}\n${presetsMeta}ROL DE ASISTENTE: ${activeAgent.prompt}\nESTILO DE COMUNICACIÓN: ${activeStyle.prompt}\n\n`;

    const rawBase = (settings.systemInstructions || '')
      .replace(/^\[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE\]:[\s\S]*?\n\n/gm, '')
      .replace(/\[BOTONES_PERSONALIDADES\]:.*$/gm, '')
      .replace(/GÉNERO E IDENTIDAD:.*$/gm, '')
      .trim();
    const fullInstructions = `${identityHeader}${rawBase}`;

    try {
      await supabase
        .from('asistente_config')
        .update({
          system_instructions: fullInstructions,
          daily_memory: '',
          system_memory: 'CLEAR'
        })
        .eq('client_id', clientId);
    } catch (err) {
      console.warn('Error aplicando comportamiento en Supabase:', err);
    }

    // 🧠 BORRADO TOTAL DE RECUERDOS (FRESCO Y LIMPIO)
    setSettings((prev) => ({
      ...prev,
      systemInstructions: fullInstructions,
      systemMemory: ''
    }));

    if ((window as any).AndroidInterface) {
      try {
        if ((window as any).AndroidInterface.updateSystemInstructions) {
          (window as any).AndroidInterface.updateSystemInstructions(fullInstructions);
        }
        if ((window as any).AndroidInterface.reloadStudio) {
          (window as any).AndroidInterface.reloadStudio();
        }
      } catch (e) {
        console.error('Error aplicando a Java:', e);
      }
    }

    setTimeout(() => {
      setIsApplyingStyle(false);
      setStyleSuccess(true);
      setTimeout(() => setStyleSuccess(false), 2000);
    }, 600);
  };

  // 🗑️ BORRADO VOLUNTARIO DE CONVERSACIONES
  const handleClearConversations = async () => {
    setShowClearConfirm(false);
    const clientId = localStorage.getItem('ava_client_id') || 'al_pachus_9468';

    setSettings((prev) => ({
      ...prev,
      systemMemory: ''
    }));

    try {
      await supabase
        .from('asistente_config')
        .update({ daily_memory: '', system_memory: 'CLEAR' })
        .eq('client_id', clientId);
    } catch (err) {
      console.warn('Error borrando memoria en Supabase:', err);
    }

    if ((window as any).AndroidInterface?.reloadStudio) {
      (window as any).AndroidInterface.reloadStudio();
    }

    setClearSuccess(true);
    setTimeout(() => setClearSuccess(false), 2500);
  };

  // Soporte WhatsApp Compacto
  const handleSupportWhatsApp = () => {
    const phone = "5575165733";
    const msg = "HOLA NECESITO SOPORTE PARA ASISTENTE UNIVERSAL MI PREGUNTA ES ";
    if ((window as any).AndroidInterface && (window as any).AndroidInterface.openWhatsApp) {
      (window as any).AndroidInterface.openWhatsApp(phone, msg);
    } else {
      window.open(`https://wa.me/52${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 font-sans text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap');`}</style>
      
      <div 
        className="w-full max-w-md bg-[#000000] border-2 border-[#d4af37] rounded-3xl p-3.5 sm:p-4 shadow-[0_0_60px_rgba(212,175,55,0.25)] space-y-3 relative max-h-[96vh] overflow-y-auto select-none"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
          <h2 className="font-extrabold text-sm sm:text-base tracking-widest uppercase text-[#d4af37]">
            AJUSTES Y ASISTENCIA
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-[#d4af37] hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bloque Superior de Sesión y Voz */}
        <div className="space-y-2">
          {activeLinkedState ? (
            <button
              disabled
              className="w-full py-2 px-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-default"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>CUENTA VINCULADA CORRECTAMENTE</span>
            </button>
          ) : (
            <button
              onClick={handleLinkGoogle}
              className="w-full py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              style={{
                background: 'linear-gradient(135deg, #fff5c0 0%, #f0d060 20%, #d4af37 45%, #b8860b 70%, #f0d060 85%, #fff5c0 100%)',
                color: '#000000',
                border: 'none',
              }}
            >
              INGRESA CUENTA DE GMAIL
            </button>
          )}

          {/* Botón: Cerrar Sesión de Gmail */}
          <button
            onClick={handleLogoutGoogle}
            className="w-full py-1.5 px-4 rounded-2xl bg-red-600 hover:bg-red-500 border-2 border-red-400 text-white transition flex flex-col items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.4)] leading-tight"
          >
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
              <LogOut className="w-3.5 h-3.5 text-white" />
              <span>CERRAR SESIÓN DE GMAIL</span>
            </div>
            <span className="text-[9px] font-bold text-red-100 uppercase tracking-wide mt-0.5">
              (PRESIONA PARA CAMBIAR TU CORREO)
            </span>
          </button>

          {/* Botón: Voz de tu Asistente (Rosa fuerte / Azul fuerte con figuritas de mujer y hombre) */}
          <button
            type="button"
            onClick={handleToggleVoiceInstant}
            className={`w-full py-2 px-4 rounded-2xl transition duration-200 flex flex-col items-center justify-center border-2 shadow-lg cursor-pointer leading-tight active:scale-98 ${
              settings.voiceMaleEnabled
                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:bg-blue-500'
                : 'bg-pink-600 border-pink-400 text-white shadow-[0_0_20px_rgba(219,39,119,0.5)] hover:bg-pink-500'
            }`}
          >
            <div className="flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider text-white">
              <span className="text-sm">{settings.voiceMaleEnabled ? '👨' : '👩'}</span>
              <span>{settings.voiceMaleEnabled ? 'VOZ DE HOMBRE DE TU ASISTENTE' : 'VOZ DE MUJER DE TU ASISTENTE'}</span>
              <span className="text-sm">{settings.voiceMaleEnabled ? '👨' : '👩'}</span>
            </div>
            <span className="text-[9.5px] font-extrabold text-white/95 uppercase tracking-wide mt-0.5">
              {settings.voiceMaleEnabled ? '(PRESIONA PARA CAMBIAR A VOZ DE MUJER)' : '(PRESIONA PARA CAMBIAR A VOZ DE HOMBRE)'}
            </span>
          </button>
        </div>

        {/* ── CUADRO 1: ASISTENTES EXCLUSIVOS Y NOMBRES (MARCO ORO METÁLICO) ── */}
        <div className="rounded-2xl border-2 border-[#d4af37] bg-black/90 p-3 space-y-2.5 shadow-[0_0_25px_rgba(212,175,55,0.25)]">
          {/* Nombres en 2 Columnas Simétricas */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-wider text-[#d4af37] uppercase block truncate">
                NOMBRE DE TU ASISTENTE:
              </label>
              <input
                type="text"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                placeholder="Escribe aquí el nombre"
                className="w-full bg-[#111118] border border-[#d4af37]/60 rounded-xl px-2.5 py-1.5 text-white placeholder-zinc-500 text-xs outline-none focus:border-[#d4af37] font-semibold transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-wider text-[#d4af37] uppercase block truncate">
                ¿CÓMO QUIERES QUE TE LLAME?:
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Escribe aquí tu nombre"
                className="w-full bg-[#111118] border border-[#d4af37]/60 rounded-xl px-2.5 py-1.5 text-white placeholder-zinc-500 text-xs outline-none focus:border-[#d4af37] font-semibold transition"
              />
            </div>
          </div>

          {/* 4 Asistentes Exclusivos */}
          <div className="space-y-1 pt-1">
            <label className="text-[10px] font-black tracking-wider text-[#d4af37] uppercase block">
              ASISTENTES EXCLUSIVOS:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {exclusiveAssistants.map((preset) => {
                const isSelected = selectedAssistantId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedAssistantId(preset.id)}
                    className={`py-2 px-2 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all duration-200 border cursor-pointer text-center leading-tight active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#d4af37]/40 via-[#f0d060]/30 to-[#d4af37]/40 text-white border-[#f0d060] shadow-[0_0_15px_rgba(212,175,55,0.5)] scale-[1.02]'
                        : 'bg-black/90 text-zinc-300 border-[#d4af37]/30 hover:border-[#d4af37]/70 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botón: GUARDAR ASISTENTE (Placa de Oro Metálico Puro) */}
          <button
            type="button"
            disabled={isApplyingAgent}
            onClick={handleSaveAgentAndNames}
            className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-98 border mt-1 ${
              agentSuccess
                ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse'
                : isApplyingAgent
                  ? 'bg-amber-600/80 text-white border-amber-400 cursor-wait'
                  : 'text-black hover:brightness-110 border-[#fff5c0] shadow-[0_0_25px_rgba(212,175,55,0.5)]'
            }`}
            style={!agentSuccess && !isApplyingAgent ? {
              background: 'linear-gradient(135deg, #fff5c0 0%, #f0d060 20%, #d4af37 45%, #b8860b 70%, #f0d060 85%, #fff5c0 100%)',
              color: '#000000'
            } : undefined}
          >
            {isApplyingAgent ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>GUARDANDO ASISTENTE...</span>
              </>
            ) : agentSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>¡ASISTENTE GUARDADO CON ÉXITO!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-black text-black" />
                <span className="font-black text-black">GUARDAR ASISTENTE</span>
              </>
            )}
          </button>
        </div>

        {/* ── BOTÓN INTERMEDIO: BORRADO VOLUNTARIO DE CONVERSACIONES (ROJO FONDO, LETRA BLANCA EN 2 LÍNEAS) ── */}
        <div className="py-0.5">
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-2 px-3 bg-red-600 hover:bg-red-500 border-2 border-red-400 text-white rounded-xl font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] active:scale-98 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-white shrink-0" />
            <div className="flex flex-col items-center leading-tight">
              <span className="text-[11px] font-black text-white">PRESIONA AQUÍ PARA BORRAR</span>
              <span className="text-[10px] font-extrabold text-red-100">TUS CONVERSACIONES CON EL ASISTENTE</span>
            </div>
          </button>
          {clearSuccess && (
            <p className="text-center text-[10px] text-emerald-400 font-bold mt-1 animate-pulse">
              ✓ Conversaciones borradas. Pizarra 100% limpia.
            </p>
          )}
        </div>

        {/* ── CUADRO 2: ¿CÓMO QUIERES QUE SE COMPORTE TU ASISTENTE? (MARCO ORO METÁLICO) ── */}
        <div className="rounded-2xl border-2 border-[#d4af37] bg-black/90 p-3 space-y-2.5 shadow-[0_0_25px_rgba(212,175,55,0.25)]">
          <div className="space-y-1">
            <label className="text-[10px] font-black tracking-wider text-[#d4af37] uppercase block">
              ¿CÓMO QUIERES QUE SE COMPORTE TU ASISTENTE?
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {businessStyles.map((preset) => {
                const isSelected = selectedStyleId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedStyleId(preset.id)}
                    className={`py-2 px-2 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all duration-200 border cursor-pointer text-center leading-tight active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#d4af37]/40 via-[#f0d060]/30 to-[#d4af37]/40 text-white border-[#f0d060] shadow-[0_0_15px_rgba(212,175,55,0.5)] scale-[1.02]'
                        : 'bg-black/90 text-zinc-300 border-[#d4af37]/30 hover:border-[#d4af37]/70 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botón: GUARDAR COMPORTAMIENTO (Placa de Oro Metálico Puro, mismo tamaño que arriba) */}
          <button
            type="button"
            disabled={isApplyingStyle}
            onClick={() => setShowStyleWarning(true)}
            className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-98 border mt-1 ${
              styleSuccess
                ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse'
                : isApplyingStyle
                  ? 'bg-amber-600/80 text-white border-amber-400 cursor-wait'
                  : 'text-black hover:brightness-110 border-[#fff5c0] shadow-[0_0_25px_rgba(212,175,55,0.5)]'
            }`}
            style={!styleSuccess && !isApplyingStyle ? {
              background: 'linear-gradient(135deg, #fff5c0 0%, #f0d060 20%, #d4af37 45%, #b8860b 70%, #f0d060 85%, #fff5c0 100%)',
              color: '#000000'
            } : undefined}
          >
            {isApplyingStyle ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>GUARDANDO COMPORTAMIENTO...</span>
              </>
            ) : styleSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>¡COMPORTAMIENTO GUARDADO!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-black text-black" />
                <span className="font-black text-black">GUARDAR COMPORTAMIENTO</span>
              </>
            )}
          </button>
        </div>

        {/* ── CUADRO 3: SOPORTE Y ASISTENCIA COMPACTO (LETRA MÁS GRANDE Y CLARA EN BLANCO) ── */}
        <div className="rounded-2xl border-2 border-[#25D366] bg-black/90 p-3 space-y-2 shadow-[0_0_25px_rgba(37,211,102,0.25)] font-sans">
          <p className="text-xs font-black text-white uppercase tracking-wider">
            SOPORTE Y ASISTENCIA
          </p>
          <p className="text-xs text-white font-bold leading-snug">
            Presiona el botón para recibir ayuda o soporte técnico para tu asistente.
          </p>
          <button
            type="button"
            onClick={handleSupportWhatsApp}
            className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-black font-black text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(37,211,102,0.4)] cursor-pointer flex items-center justify-center gap-2 border border-white/20"
          >
            <span className="text-base">💬</span>
            <span>PRESIONA PARA ASISTENCIA</span>
          </button>
        </div>
      </div>

      {/* ── MODAL DE ADVERTENCIA DE BORRADO DE CONVERSACIONES AL GUARDAR COMPORTAMIENTO ── */}
      {showStyleWarning && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans">
          <div className="max-w-sm w-full bg-[#121218] border-2 border-amber-500 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-black text-xs uppercase tracking-wider">
                AVISO DE CONVERSACIONES
              </span>
            </div>
            <p className="text-[11px] text-zinc-200 leading-relaxed font-semibold">
              Si cambias el comportamiento de tu asistente, se borrarán todas tus conversaciones anteriores para que empiece de forma 100% limpia.
            </p>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Si no cambias el comportamiento de tu asistente, se mantendrán tus conversaciones.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowStyleWarning(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmApplyStyle}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider shadow cursor-pointer active:scale-95"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DE CONFIRMACIÓN PARA BORRADO VOLUNTARIO ── */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans">
          <div className="max-w-sm w-full bg-[#121218] border-2 border-red-500 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <Trash2 className="w-5 h-5" />
              <span className="font-black text-xs uppercase tracking-wider">
                CONFIRMAR BORRADO
              </span>
            </div>
            <p className="text-[11px] text-zinc-200 leading-relaxed">
              ¿Estás seguro de que deseas borrar todas tus conversaciones con el asistente? Tu memoria quedará 100% limpia.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClearConversations}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow cursor-pointer active:scale-95"
              >
                Sí, Borrar Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
