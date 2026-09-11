import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, LogOut, Loader2, Sparkles, Move, Edit3, RotateCcw, Check, Trash2, AlertTriangle } from 'lucide-react';
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

interface ClientConfigRow {
  client_id: string;
  system_instructions: string;
  system_memory: string;
  client_name: string;
  is_active: boolean;
  activation_key: string | null;
  hardware_id: string | null;
  client_phone?: string | null;
}

interface ClientPhoneSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientConfigRow | null;
  onSaveInstructions: (clientId: string, text: string) => Promise<void>;
  onSaveVoice?: (clientId: string, voice: string) => Promise<void>;
  supportPhone?: string;
}

export const ClientPhoneSimulatorModal: React.FC<ClientPhoneSimulatorModalProps> = ({
  isOpen,
  onClose,
  client,
  onSaveInstructions,
  onSaveVoice,
  supportPhone = '5575165733'
}) => {
  if (!isOpen || !client) return null;

  // 1. Estados de edición básica
  const [assistantName, setAssistantName] = useState('');
  const [userName, setUserName] = useState('');
  const [currentVoice, setCurrentVoice] = useState<'male' | 'female'>('female');

  // 2. Presets (6 estilos + 4 asistentes exclusivos = 10 botones)
  const [businessStyles, setBusinessStyles] = useState<PersonalityPreset[]>(DEFAULT_BUSINESS_STYLES);
  const [exclusiveAssistants, setExclusiveAssistants] = useState<PersonalityPreset[]>(DEFAULT_EXCLUSIVE_ASSISTANTS);

  const [selectedStyleId, setSelectedStyleId] = useState('elegante');
  const [selectedAssistantId, setSelectedAssistantId] = useState('asistente_personal');

  // 3. Edición de presets individuales con lápiz ✏️
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editPrompt, setEditPrompt] = useState('');

  // 4. Estados de guardado
  const [isApplyingAgent, setIsApplyingAgent] = useState(false);
  const [agentSuccess, setAgentSuccess] = useState(false);

  const [isApplyingStyle, setIsApplyingStyle] = useState(false);
  const [styleSuccess, setStyleSuccess] = useState(false);

  const [showStyleWarning, setShowStyleWarning] = useState(false);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  // 5. Posición arrastrable en PC
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const startX = Math.max(20, window.innerWidth - 490);
      const startY = Math.max(20, 50);
      return { x: startX, y: startY };
    }
    return { x: 800, y: 50 };
  });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Inicialización
  useEffect(() => {
    if (!client) return;
    const instructions = client.system_instructions || '';

    // Cargar nombres
    const matchName = instructions.match(/Tu nombre oficial es:\s*"([^"]+)"/i);
    setAssistantName(matchName && matchName[1] ? matchName[1] : 'AVA');

    const matchUserName = instructions.match(/El usuario se llama:\s*"([^"]+)"/i);
    setUserName(matchUserName && matchUserName[1] ? matchUserName[1] : client.client_name || '');

    // Cargar voz
    if (instructions.includes('asistente masculino (hombre)')) {
      setCurrentVoice('male');
    } else {
      setCurrentVoice('female');
    }

    // Cargar presets guardados desde instrucciones o defaults
    const matchPresets = instructions.match(/\[BOTONES_PERSONALIDADES\]:\s*(\[\{.*?\}\])/);
    if (matchPresets && matchPresets[1]) {
      try {
        const parsed = JSON.parse(matchPresets[1]);
        if (Array.isArray(parsed)) {
          if (parsed.length === 6) setBusinessStyles(parsed);
          else if (parsed.length === 10) {
            setBusinessStyles(parsed.slice(0, 6));
            setExclusiveAssistants(parsed.slice(6, 10));
          }
        }
      } catch (e) {
        console.error('Error parseando presets:', e);
      }
    } else {
      setBusinessStyles(DEFAULT_BUSINESS_STYLES);
      setExclusiveAssistants(DEFAULT_EXCLUSIVE_ASSISTANTS);
    }

    // Detectar selecciones
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
    setEditingPresetId(null);
  }, [client?.client_id]);

  // Arrastre con mouse en PC
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const nextX = Math.max(10, Math.min(window.innerWidth - 440, ev.clientX - dragStart.current.x));
      const nextY = Math.max(10, Math.min(window.innerHeight - 200, ev.clientY - dragStart.current.y));
      setPosition({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Alternar voz instantánea
  const handleToggleVoice = async () => {
    const nextVoice = currentVoice === 'male' ? 'female' : 'male';
    setCurrentVoice(nextVoice);

    const genderDirective = nextVoice === 'male'
      ? 'GÉNERO E IDENTIDAD: Eres un asistente masculino (hombre). Expresate, habla y reconócete siempre como hombre en todas tus respuestas.'
      : 'GÉNERO E IDENTIDAD: Eres una asistente femenina (mujer). Expresate, habla y reconócete siempre como mujer en todas tus respuestas.';

    let updated = client.system_instructions || '';
    if (updated.includes('GÉNERO E IDENTIDAD:')) {
      updated = updated.replace(/GÉNERO E IDENTIDAD:.*$/m, genderDirective);
    } else {
      updated = `${genderDirective}\n\n${updated}`;
    }

    try {
      await onSaveInstructions(client.client_id, updated);
    } catch (e) {
      console.error('Error cambiando voz:', e);
    }
  };

  // Abrir editor de preset
  const handleOpenEditor = (preset: PersonalityPreset, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingPresetId === preset.id) {
      setEditingPresetId(null);
    } else {
      setEditingPresetId(preset.id);
      setEditLabel(preset.label);
      setEditPrompt(preset.prompt);
    }
  };

  // Guardar preset editado
  const handleSavePreset = (id: string) => {
    const updateList = (list: PersonalityPreset[]) =>
      list.map(p => p.id === id ? { ...p, label: editLabel.trim().toUpperCase() || p.label, prompt: editPrompt.trim() || p.prompt } : p);

    setBusinessStyles(prev => updateList(prev));
    setExclusiveAssistants(prev => updateList(prev));
    setEditingPresetId(null);
  };

  // Fábrica
  const handleResetPreset = (id: string) => {
    const allDefs = [...DEFAULT_BUSINESS_STYLES, ...DEFAULT_EXCLUSIVE_ASSISTANTS];
    const def = allDefs.find(d => d.id === id);
    if (!def) return;
    setEditLabel(def.label);
    setEditPrompt(def.prompt);
  };

  // 📦 GUARDAR CUADRO 1: ASISTENTE Y NOMBRES (NO BORRA MEMORIA)
  const handleSaveAgentAndNames = async () => {
    setIsApplyingAgent(true);
    setAgentSuccess(false);

    try {
      const finalName = assistantName.trim() || 'AVA';
      const finalUserName = userName.trim();
      const activeAgent = exclusiveAssistants.find(a => a.id === selectedAssistantId) || exclusiveAssistants[0];
      const activeStyle = businessStyles.find(b => b.id === selectedStyleId) || businessStyles[0];

      const genderDirective = currentVoice === 'male'
        ? 'GÉNERO E IDENTIDAD: Eres un asistente masculino (hombre). Expresate, habla y reconócete siempre como hombre en todas tus respuestas.'
        : 'GÉNERO E IDENTIDAD: Eres una asistente femenina (mujer). Expresate, habla y reconócete siempre como mujer en todas tus respuestas.';

      const userDirective = finalUserName
        ? `El usuario se llama: "${finalUserName}". Dirígete siempre a él con este nombre cuando hables con él.\n`
        : '';

      const allPresets = [...businessStyles, ...exclusiveAssistants];
      const presetsMeta = `[BOTONES_PERSONALIDADES]: ${JSON.stringify(allPresets)}\n`;

      const identityHeader = `[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE]:\nTu nombre oficial es: "${finalName}". Cuando el usuario te pregunte cómo te llamas o se dirija a ti, responde y reconócete siempre con este nombre.\n${userDirective}${genderDirective}\n${presetsMeta}ROL DE ASISTENTE: ${activeAgent.prompt}\nESTILO DE COMUNICACIÓN: ${activeStyle.prompt}\n\n`;

      const rawBase = (client.system_instructions || '')
        .replace(/^\[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE\]:[\s\S]*?\n\n/gm, '')
        .replace(/GÉNERO E IDENTIDAD:.*$/gm, '')
        .replace(/\[BOTONES_PERSONALIDADES\]:.*$/gm, '')
        .trim();

      const fullInstructions = `${identityHeader}${rawBase}`;

      await onSaveInstructions(client.client_id, fullInstructions);

      await supabase
        .from('asistente_config')
        .update({
          client_name: finalUserName || client.client_name
        })
        .eq('client_id', client.client_id);

      setAgentSuccess(true);
      setTimeout(() => setAgentSuccess(false), 2000);
    } catch (err) {
      console.error('Error guardando asistente:', err);
    } finally {
      setIsApplyingAgent(false);
    }
  };

  // 🎭 CONFIRMAR CAMBIO DE COMPORTAMIENTO (BORRA MEMORIA)
  const confirmApplyStyle = async () => {
    setShowStyleWarning(false);
    setIsApplyingStyle(true);
    setStyleSuccess(false);

    try {
      const activeStyle = businessStyles.find(b => b.id === selectedStyleId) || businessStyles[0];
      const activeAgent = exclusiveAssistants.find(a => a.id === selectedAssistantId) || exclusiveAssistants[0];

      const finalName = assistantName.trim() || 'AVA';
      const finalUserName = userName.trim();

      const genderDirective = currentVoice === 'male'
        ? 'GÉNERO E IDENTIDAD: Eres un asistente masculino (hombre). Expresate, habla y reconócete siempre como hombre en todas tus respuestas.'
        : 'GÉNERO E IDENTIDAD: Eres una asistente femenina (mujer). Expresate, habla y reconócete siempre como mujer en todas tus respuestas.';

      const userDirective = finalUserName
        ? `El usuario se llama: "${finalUserName}". Dirígete siempre a él con este nombre cuando hables con él.\n`
        : '';

      const allPresets = [...businessStyles, ...exclusiveAssistants];
      const presetsMeta = `[BOTONES_PERSONALIDADES]: ${JSON.stringify(allPresets)}\n`;

      const identityHeader = `[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE]:\nTu nombre oficial es: "${finalName}". Cuando el usuario te pregunte cómo te llamas o se dirija a ti, responde y reconócete siempre con este nombre.\n${userDirective}${genderDirective}\n${presetsMeta}ROL DE ASISTENTE: ${activeAgent.prompt}\nESTILO DE COMUNICACIÓN: ${activeStyle.prompt}\n\n`;

      const rawBase = (client.system_instructions || '')
        .replace(/^\[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE\]:[\s\S]*?\n\n/gm, '')
        .replace(/GÉNERO E IDENTIDAD:.*$/gm, '')
        .replace(/\[BOTONES_PERSONALIDADES\]:.*$/gm, '')
        .trim();

      const fullInstructions = `${identityHeader}${rawBase}`;

      await onSaveInstructions(client.client_id, fullInstructions);

      // BORRADO TOTAL DE RECUERDOS (FRESCO Y LIMPIO)
      await supabase
        .from('asistente_config')
        .update({
          daily_memory: '',
          system_memory: 'CLEAR'
        })
        .eq('client_id', client.client_id);

      setStyleSuccess(true);
      setTimeout(() => setStyleSuccess(false), 2000);
    } catch (err) {
      console.error('Error aplicando comportamiento:', err);
    } finally {
      setIsApplyingStyle(false);
    }
  };

  // 🗑️ BORRADO VOLUNTARIO DE CONVERSACIONES
  const handleClearConversations = async () => {
    setShowClearConfirm(false);
    try {
      await supabase
        .from('asistente_config')
        .update({ daily_memory: '', system_memory: 'CLEAR' })
        .eq('client_id', client.client_id);

      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 2500);
    } catch (err) {
      console.error('Error borrando conversaciones:', err);
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div
      className="fixed z-50 select-none font-sans text-white"
      style={
        isMobile
          ? { inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', padding: '10px' }
          : { left: `${position.x}px`, top: `${position.y}px`, width: '420px', maxWidth: '96vw' }
      }
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap');`}</style>

      <div
        className="w-full bg-[#0a0a0f] border-2 border-[#d4af37]/60 rounded-3xl p-3.5 sm:p-4 shadow-[0_0_60px_rgba(212,175,55,0.3)] space-y-3 relative max-h-[94vh] overflow-y-auto flex flex-col"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Barra Superior */}
        <div
          onMouseDown={isMobile ? undefined : handleMouseDown}
          className={`flex items-center justify-between border-b border-[#d4af37]/30 pb-2 ${isMobile ? '' : 'cursor-move'}`}
        >
          <div className="flex items-center gap-2">
            {!isMobile && <Move className="w-4 h-4 text-[#d4af37]/70" />}
            <span className="font-extrabold text-xs sm:text-sm tracking-widest uppercase text-[#d4af37]">
              SIMULADOR CELULAR: {client.client_name || client.client_id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-white/10 text-[#d4af37] hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bloque Superior de Sesión y Voz */}
        <div className="space-y-2">
          <div className="w-full py-2 px-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 font-extrabold text-[11px] tracking-wider uppercase flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>GMAIL VINCULADO AL DISPOSITIVO</span>
          </div>

          <button
            type="button"
            onClick={() => alert("En el celular real, este botón borra la sesión de Google para permitir ingresar una cuenta diferente.")}
            className="w-full py-1.5 px-4 rounded-2xl bg-red-600 hover:bg-red-500 border-2 border-red-400 text-white transition flex flex-col items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.4)] leading-tight active:scale-98"
          >
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
              <LogOut className="w-3.5 h-3.5 text-white" />
              <span>CERRAR SESIÓN DE GMAIL</span>
            </div>
            <span className="text-[9px] font-bold text-red-100 uppercase tracking-wide mt-0.5">
              (PRESIONA PARA CAMBIAR TU CORREO)
            </span>
          </button>

          <button
            type="button"
            onClick={handleToggleVoice}
            className={`w-full py-2 px-4 rounded-2xl transition duration-200 flex flex-col items-center justify-center border shadow-lg cursor-pointer leading-tight active:scale-98 ${
              currentVoice === 'male'
                ? 'bg-green-950/30 text-green-400 border-green-500/40 hover:bg-green-950/50 shadow-green-950/20'
                : 'bg-pink-950/30 text-pink-300 border-pink-400/50 hover:bg-pink-950/50 shadow-pink-950/20'
            }`}
          >
            <span className="font-black text-xs uppercase tracking-wider">
              {currentVoice === 'male' ? 'VOZ DE HOMBRE DE TU ASISTENTE' : 'VOZ DE MUJER DE TU ASISTENTE'}
            </span>
            <span className="text-[9px] font-bold opacity-90 uppercase tracking-wide mt-0.5">
              {currentVoice === 'male' ? '(PRESIONA PARA CAMBIAR A VOZ DE MUJER)' : '(PRESIONA PARA CAMBIAR A VOZ DE HOMBRE)'}
            </span>
          </button>
        </div>

        {/* ── CUADRO 1: ASISTENTES EXCLUSIVOS Y NOMBRES (MARCO DORADO GRUESO - NO BORRA MEMORIA) ── */}
        <div className="rounded-2xl border-2 border-[#d4af37] bg-black/60 p-3 space-y-2.5 shadow-[0_0_25px_rgba(212,175,55,0.2)]">
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
                placeholder="Ej. AVA"
                className="w-full bg-[#14141a] border border-[#d4af37]/60 rounded-xl px-2.5 py-1.5 text-white placeholder-zinc-500 text-xs outline-none focus:border-[#d4af37] font-semibold transition"
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
                placeholder="Ej. Alberto"
                className="w-full bg-[#14141a] border border-[#d4af37]/60 rounded-xl px-2.5 py-1.5 text-white placeholder-zinc-500 text-xs outline-none focus:border-[#d4af37] font-semibold transition"
              />
            </div>
          </div>

          {/* 4 Asistentes Exclusivos */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black tracking-wider text-[#d4af37] uppercase block">
                ASISTENTES EXCLUSIVOS:
              </label>
              <span className="text-[8px] text-zinc-400 uppercase font-bold">✏️ Edición en web</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {exclusiveAssistants.map((preset) => {
                const isSelected = selectedAssistantId === preset.id;
                return (
                  <div key={preset.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => setSelectedAssistantId(preset.id)}
                      className={`w-full py-2 px-2 pr-6 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all duration-200 border cursor-pointer text-center leading-tight active:scale-95 truncate ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#d4af37]/40 via-[#f0d060]/30 to-[#d4af37]/40 text-white border-[#f0d060] shadow-[0_0_15px_rgba(212,175,55,0.5)] scale-[1.02]'
                          : 'bg-black/80 text-zinc-300 border-[#d4af37]/30 hover:border-[#d4af37]/70 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                    <button
                      type="button"
                      title="Editar título y prompt"
                      onClick={(e) => handleOpenEditor(preset, e)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md bg-black/60 hover:bg-[#d4af37] hover:text-black text-zinc-400 transition"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botón de Guardar Agente */}
          <button
            type="button"
            disabled={isApplyingAgent}
            onClick={handleSaveAgentAndNames}
            className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-98 border mt-1 ${
              agentSuccess
                ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse'
                : isApplyingAgent
                  ? 'bg-amber-600/80 text-white border-amber-400 cursor-wait'
                  : 'bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#f0d060] text-black hover:brightness-110 border-[#ffe57f] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
            }`}
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
                <Sparkles className="w-4 h-4 fill-black" />
                <span>GUARDAR Y APLICAR ASISTENTE</span>
              </>
            )}
          </button>
        </div>

        {/* ── BOTÓN INTERMEDIO: BORRADO VOLUNTARIO DE CONVERSACIONES ── */}
        <div className="py-0.5">
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-2 px-3 bg-red-950/40 hover:bg-red-900/60 border border-red-500/50 text-red-300 rounded-xl font-black text-[9.5px] uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md active:scale-98 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>PRESIONA AQUÍ PARA BORRAR TUS CONVERSACIONES CON EL ASISTENTE</span>
          </button>
          {clearSuccess && (
            <p className="text-center text-[10px] text-emerald-400 font-bold mt-1 animate-pulse">
              ✓ Conversaciones borradas. Pizarra 100% limpia.
            </p>
          )}
        </div>

        {/* ── CUADRO 2: ¿CÓMO QUIERES QUE SE COMPORTE TU ASISTENTE? (MARCO DORADO GRUESO - SÍ BORRA MEMORIA) ── */}
        <div className="rounded-2xl border-2 border-[#d4af37] bg-black/60 p-3 space-y-2.5 shadow-[0_0_25px_rgba(212,175,55,0.2)]">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black tracking-wider text-[#d4af37] uppercase block">
                ¿CÓMO QUIERES QUE SE COMPORTE TU ASISTENTE?
              </label>
              <span className="text-[8px] text-zinc-400 uppercase font-bold">✏️ Edición en web</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {businessStyles.map((preset) => {
                const isSelected = selectedStyleId === preset.id;
                return (
                  <div key={preset.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => setSelectedStyleId(preset.id)}
                      className={`w-full py-2 px-2 pr-6 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all duration-200 border cursor-pointer text-center leading-tight active:scale-95 truncate ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#d4af37]/40 via-[#f0d060]/30 to-[#d4af37]/40 text-white border-[#f0d060] shadow-[0_0_15px_rgba(212,175,55,0.5)] scale-[1.02]'
                          : 'bg-black/80 text-zinc-300 border-[#d4af37]/30 hover:border-[#d4af37]/70 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                    <button
                      type="button"
                      title="Editar título y prompt"
                      onClick={(e) => handleOpenEditor(preset, e)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md bg-black/60 hover:bg-[#d4af37] hover:text-black text-zinc-400 transition"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botón de Guardar Comportamiento */}
          <button
            type="button"
            disabled={isApplyingStyle}
            onClick={() => setShowStyleWarning(true)}
            className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-98 border mt-1 ${
              styleSuccess
                ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse'
                : isApplyingStyle
                  ? 'bg-amber-600/80 text-white border-amber-400 cursor-wait'
                  : 'bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#f0d060] text-black hover:brightness-110 border-[#ffe57f] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
            }`}
          >
            {isApplyingStyle ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>GUARDANDO COMPORTAMIENTO...</span>
              </>
            ) : styleSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>¡COMPORTAMIENTO APLICADO!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-black" />
                <span>GUARDAR Y APLICAR COMPORTAMIENTO</span>
              </>
            )}
          </button>
        </div>

        {/* Editor Flotante Inline de Botón */}
        {editingPresetId && (
          <div className="rounded-2xl border-2 border-cyan-400/80 bg-[#0f172a] p-3 space-y-2 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-cyan-400 border-b border-cyan-400/30 pb-1.5">
              <span className="font-extrabold text-xs uppercase tracking-wider">
                EDITAR BOTÓN ({editingPresetId.toUpperCase()})
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Restaurar a valores originales"
                  onClick={() => handleResetPreset(editingPresetId)}
                  className="p-1 hover:bg-cyan-950 rounded text-cyan-300 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPresetId(null)}
                  className="p-1 hover:bg-cyan-950 rounded text-cyan-300 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-cyan-200 uppercase">
                Texto del Botón:
              </label>
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value.toUpperCase())}
                className="w-full bg-black/60 border border-cyan-400/40 rounded-lg px-2 py-1 text-white text-xs font-bold outline-none focus:border-cyan-400 uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-cyan-200 uppercase">
                Instrucción (Prompt) para la IA:
              </label>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                rows={3}
                className="w-full bg-black/60 border border-cyan-400/40 rounded-lg p-2 text-white text-xs outline-none focus:border-cyan-400 resize-none font-medium"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSavePreset(editingPresetId)}
              className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 shadow cursor-pointer active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Cambios del Botón</span>
            </button>
          </div>
        )}

        {/* ── CUADRO 3: SOPORTE Y ASISTENCIA COMPACTO ── */}
        <div className="rounded-2xl border-2 border-[#25D366] bg-[#0b141a] p-3 space-y-2 shadow-[0_0_25px_rgba(37,211,102,0.2)] font-sans">
          <p className="text-xs font-black text-white uppercase tracking-wider">
            SOPORTE Y ASISTENCIA
          </p>
          <p className="text-[10px] text-zinc-300 leading-tight">
            Presiona el botón para recibir ayuda o soporte técnico para tu asistente.
          </p>
          <button
            type="button"
            onClick={() => {
              const clean = supportPhone.replace(/[^0-9]/g, '');
              const msg = "HOLA NECESITO SOPORTE PARA ASISTENTE UNIVERSAL MI PREGUNTA ES ";
              window.open(`https://wa.me/52${clean}?text=${encodeURIComponent(msg)}`, '_blank');
            }}
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
