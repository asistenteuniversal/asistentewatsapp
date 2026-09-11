import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, LogOut, Loader2, Sparkles, Move, Edit3, RotateCcw, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';

export interface PersonalityPreset {
  id: string;
  label: string;
  prompt: string;
}

export const DEFAULT_PERSONALITY_PRESETS: PersonalityPreset[] = [
  {
    id: 'elegante',
    label: 'ELEGANTE Y FORMAL',
    prompt: 'Habla de forma muy culta, distinguida, educada y profesional. Usa un vocabulario refinado y respetuoso.'
  },
  {
    id: 'alegre',
    label: 'ALEGRE Y AMIGABLE',
    prompt: 'Sé sumamente entusiasta, alegre, amigable, optimista y cercano en cada una de tus respuestas.'
  },
  {
    id: 'conciso',
    label: 'SABIO Y CONCISO',
    prompt: 'Sé directo, conciso y sabio. Responde sin rodeos, con claridad absoluta y al grano.'
  },
  {
    id: 'barrio',
    label: 'ESTILO DE BARRIO',
    prompt: 'Habla con el estilo y el acento del barrio de Tepito y compórtate como una persona de barrio. IMPORTANTE: Sé simpático pero NUNCA uses groserías, vulgaridades ni albures ofensivos.'
  },
  {
    id: 'agresivo',
    label: 'AGRESIVO Y PELEONERO',
    prompt: 'Sé sumamente rudo, agresivo, retador, peleonero y de pocas pulgas en tus respuestas. IMPORTANTE: Sé muy rudo y contestatario pero NUNCA uses groserías vulgares ni insultos prohibidos.'
  },
  {
    id: 'ejecutivo',
    label: 'EJECUTIVO DE NEGOCIOS',
    prompt: 'Enfócate en resultados, productividad, finanzas, eficiencia ejecutiva y toma de decisiones corporativas.'
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
  assistant_name?: string | null;
  personality_style?: string | null;
  voice_selection?: string | null;
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

  // 1. Estados de edición básica (Carátula)
  const [assistantName, setAssistantName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('elegante');
  const [currentVoice, setCurrentVoice] = useState<'male' | 'female'>('female');

  // 2. Estados para Edición Personalizada de las 6 Personalidades (LEGO)
  const [customPresets, setCustomPresets] = useState<PersonalityPreset[]>(DEFAULT_PERSONALITY_PRESETS);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editPrompt, setEditPrompt] = useState('');

  // 3. Estados de UI y Feedback
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // 4. Posición arrastrable en PC
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const startX = Math.max(30, window.innerWidth - 490);
      const startY = Math.max(20, 60);
      return { x: startX, y: startY };
    }
    return { x: 800, y: 60 };
  });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Inicializar datos al abrir o cambiar de cliente
  useEffect(() => {
    if (!client) return;

    const instructions = client.system_instructions || '';

    // Cargar o restaurar personalidades guardadas en localStorage para este cliente
    const storageKey = `ava_custom_presets_${client.client_id}`;
    const savedPresetsJson = localStorage.getItem(storageKey);
    if (savedPresetsJson) {
      try {
        const parsed = JSON.parse(savedPresetsJson);
        if (Array.isArray(parsed) && parsed.length === 6) {
          setCustomPresets(parsed);
        }
      } catch (e) {
        console.error('Error leyendo presets guardados:', e);
      }
    } else {
      setCustomPresets(DEFAULT_PERSONALITY_PRESETS);
    }

    // Detectar Nombre del Asistente
    const matchName = instructions.match(/Tu nombre oficial es:\s*"([^"]+)"/i);
    if (matchName && matchName[1]) {
      setAssistantName(matchName[1]);
    } else if (client.assistant_name) {
      setAssistantName(client.assistant_name);
    } else {
      setAssistantName('AVA');
    }

    // Detectar Voz
    if (client.voice_selection) {
      setCurrentVoice(client.voice_selection.toLowerCase().includes('male') || client.voice_selection.toLowerCase().includes('algieba') ? 'male' : 'female');
    } else if (instructions.includes('asistente masculino (hombre)') || instructions.includes('GÉNERO E IDENTIDAD: Eres un asistente masculino')) {
      setCurrentVoice('male');
    } else {
      setCurrentVoice('female');
    }

    // Detectar Personalidad Activa
    let foundPreset = 'elegante';
    for (const p of DEFAULT_PERSONALITY_PRESETS) {
      if (instructions.includes(p.prompt)) {
        foundPreset = p.id;
        break;
      }
    }
    setSelectedPresetId(foundPreset);
    setEditingPresetId(null);
  }, [client?.client_id]);

  // Arrastrar ventana con el mouse (PC)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };

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

  // Alternar voz instantáneamente (Espejo Idéntico)
  const handleToggleVoice = async () => {
    const nextVoice = currentVoice === 'male' ? 'female' : 'male';
    setCurrentVoice(nextVoice);

    const genderDirective = nextVoice === 'male'
      ? 'GÉNERO E IDENTIDAD: Eres un asistente masculino (hombre). Expresate, habla y reconócete siempre como hombre en todas tus respuestas.'
      : 'GÉNERO E IDENTIDAD: Eres una asistente femenina (mujer). Expresate, habla y reconócete siempre como mujer en todas tus respuestas.';

    let updatedInstructions = client.system_instructions || '';
    if (updatedInstructions.includes('GÉNERO E IDENTIDAD:')) {
      updatedInstructions = updatedInstructions.replace(/GÉNERO E IDENTIDAD:.*$/m, genderDirective);
    } else {
      updatedInstructions = `${genderDirective}\n\n${updatedInstructions}`;
    }

    try {
      await onSaveInstructions(client.client_id, updatedInstructions);
      if (onSaveVoice) {
        await onSaveVoice(client.client_id, nextVoice);
      }
    } catch (e) {
      console.error('Error toggling voice in simulator:', e);
    }
  };

  // Abrir editor para un preset específico
  const handleOpenPresetEditor = (preset: PersonalityPreset, e: React.MouseEvent) => {
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
  const handleSaveEditedPreset = (presetId: string) => {
    const updated = customPresets.map(p => {
      if (p.id === presetId) {
        return {
          ...p,
          label: editLabel.trim().toUpperCase() || p.label,
          prompt: editPrompt.trim() || p.prompt
        };
      }
      return p;
    });

    setCustomPresets(updated);
    localStorage.setItem(`ava_custom_presets_${client.client_id}`, JSON.stringify(updated));
    setEditingPresetId(null);
  };

  // Restablecer preset a fábrica
  const handleResetPreset = (presetId: string) => {
    const defaultOne = DEFAULT_PERSONALITY_PRESETS.find(d => d.id === presetId);
    if (!defaultOne) return;

    const updated = customPresets.map(p => p.id === presetId ? defaultOne : p);
    setCustomPresets(updated);
    localStorage.setItem(`ava_custom_presets_${client.client_id}`, JSON.stringify(updated));
    setEditLabel(defaultOne.label);
    setEditPrompt(defaultOne.prompt);
  };

  // 🚀 GUARDAR Y APLICAR CAMBIOS EN VIVO
  const handleSaveAndApply = async () => {
    setIsApplying(true);
    setApplySuccess(false);

    try {
      const finalName = assistantName.trim() || 'AVA';
      const activePreset = customPresets.find(p => p.id === selectedPresetId) || customPresets[0];

      const genderDirective = currentVoice === 'male'
        ? 'GÉNERO E IDENTIDAD: Eres un asistente masculino (hombre). Expresate, habla y reconócete siempre como hombre en todas tus respuestas.'
        : 'GÉNERO E IDENTIDAD: Eres una asistente femenina (mujer). Expresate, habla y reconócete siempre como mujer en todas tus respuestas.';

      const identityHeader = `[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE]:\nTu nombre oficial es: "${finalName}". Cuando el usuario te pregunte cómo te llamas o se dirija a ti, responde y reconócete siempre con este nombre.\n${genderDirective}\nESTILO DE COMUNICACIÓN: ${activePreset.prompt}\n\n`;

      const rawBase = (client.system_instructions || '')
        .replace(/\[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE\]:[\s\S]*?(?=\n\n|$)/gi, '')
        .replace(/GÉNERO E IDENTIDAD:.*$/gm, '')
        .trim();

      const fullInstructions = rawBase ? `${identityHeader}${rawBase}` : identityHeader.trim();

      // 1. Guardar en Supabase a través del handler principal
      await onSaveInstructions(client.client_id, fullInstructions);

      // 2. Actualizar campos específicos
      await supabase
        .from('asistente_config')
        .update({
          assistant_name: finalName,
          personality_style: activePreset.label,
          voice_selection: currentVoice
        } as any)
        .eq('client_id', client.client_id);

      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 2500);
    } catch (err) {
      console.error('Error aplicando cambios en el simulador:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div
      className={`${
        isMobile
          ? 'fixed inset-0 z-[9999] bg-black/90 p-2 overflow-y-auto flex items-center justify-center'
          : 'fixed z-[9999]'
      }`}
      style={!isMobile ? { left: `${position.x}px`, top: `${position.y}px` } : {}}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap');`}</style>

      {/* Marco de Teléfono Celular - Réplica Exacta */}
      <div 
        className="w-full max-w-[430px] bg-[#0a0a0f] border-2 border-[#d4af37]/60 rounded-[36px] shadow-[0_0_60px_rgba(0,0,0,0.95),0_0_30px_rgba(212,175,55,0.3)] overflow-hidden flex flex-col font-sans text-white select-none"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Barra Superior Arrastrable (Header Móvil) */}
        <div
          onMouseDown={handleMouseDown}
          className="bg-gradient-to-r from-[#14141c] via-[#20202c] to-[#14141c] px-4 py-2.5 border-b border-[#d4af37]/30 flex items-center justify-between cursor-move"
          title="Haz clic y arrastra para mover el celular en tu pantalla"
        >
          <div className="flex items-center gap-2 text-[#f0d060]">
            <Move className="w-3.5 h-3.5 opacity-80" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              CELULAR EN VIVO: {client.client_name.toUpperCase()}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition active:scale-95 border border-white/20 cursor-pointer"
            title="Cerrar Simulador"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── CUERPO DE LA CARÁTULA (PIXEL PERFECT) ── */}
        <div className="p-4 space-y-3 max-h-[85vh] overflow-y-auto custom-scrollbar bg-[#0a0a0f]">
          
          {/* Header Interior de la Carátula */}
          <div className="flex items-center justify-between border-b border-[#d4af37]/25 pb-2">
            <h2 className="font-extrabold text-sm tracking-widest uppercase text-[#d4af37]">
              AJUSTES Y ASISTENCIA
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-[#d4af37] hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bloque Superior de Botones de Cuenta y Voz */}
          <div className="space-y-2">
            {/* 1. Botón: Cuenta Vinculada Correctamente */}
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 focus:outline-none cursor-default shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>CUENTA VINCULADA CORRECTAMENTE</span>
            </button>

            {/* 2. Botón Rojo: Cerrar Sesión de Gmail */}
            <div className="w-full py-2 px-4 rounded-2xl bg-red-600 hover:bg-red-500 border-2 border-red-400 text-white transition flex flex-col items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)] leading-tight cursor-default">
              <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
                <LogOut className="w-3.5 h-3.5 text-white" />
                <span>CERRAR SESIÓN DE GMAIL</span>
              </div>
              <span className="text-[9px] font-bold text-red-100 uppercase tracking-wide mt-0.5">
                (PRESIONA PARA CAMBIAR TU CORREO)
              </span>
            </div>

            {/* 3. Botón: Selector de Voz Instantáneo */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`w-full py-2 px-4 rounded-2xl transition duration-200 flex flex-col items-center justify-center border shadow-lg cursor-pointer leading-tight active:scale-98 ${
                currentVoice === 'male'
                  ? 'bg-green-950/30 text-green-400 border-green-500/40 hover:bg-green-950/50 shadow-green-950/20'
                  : 'bg-pink-950/30 text-pink-300 border-pink-400/50 hover:bg-pink-950/50 shadow-pink-950/20'
              }`}
              title="Presiona para cambiar la voz del asistente"
            >
              <span className="font-black text-xs uppercase tracking-wider">
                {currentVoice === 'male' ? '🟢 VOZ DE HOMBRE' : '🌸 VOZ DE MUJER'}
              </span>
              <span className="text-[9px] font-bold opacity-90 uppercase tracking-wide mt-0.5">
                {currentVoice === 'male'
                  ? '(PRESIONA PARA CAMBIAR A VOZ DE MUJER)'
                  : '(PRESIONA PARA CAMBIAR A VOZ DE HOMBRE)'}
              </span>
            </button>
          </div>

          {/* ── CUADRO INTEGRADO: PERSONALIZACIÓN DEL ASISTENTE Y BOTÓN DE APLICAR ── */}
          <div className="rounded-2xl border border-[#d4af37]/40 bg-black/40 p-3 space-y-2.5 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
            
            {/* SECCIÓN: NOMBRE DEL ASISTENTE */}
            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-wider text-[#d4af37] uppercase block">
                NOMBRE DE TU ASISTENTE:
              </label>
              <input
                type="text"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                placeholder="Escribe el nombre de tu asistente aquí... (Ej: Asistente)"
                className="w-full bg-[#14141a] border border-[#d4af37]/50 rounded-xl px-3 py-2 text-white placeholder-zinc-500 text-xs outline-none focus:border-[#d4af37] font-semibold transition"
              />
            </div>

            {/* SECCIÓN: PERSONALIDADES (6 BOTONES DORADOS CON MODO EDICIÓN) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black tracking-wider text-[#d4af37] uppercase block">
                  ¿CÓMO QUIERES QUE SE COMPORTE TU ASISTENTE?
                </label>
                <span className="text-[9px] text-amber-300/80 font-bold">
                  (✏️ Click para editar)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {customPresets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  const isBeingEdited = editingPresetId === preset.id;
                  return (
                    <div key={preset.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`w-full py-2 px-2 pr-6 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all duration-200 border cursor-pointer text-center leading-tight active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#d4af37]/30 via-[#f0d060]/20 to-[#d4af37]/30 text-white border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-[1.02]'
                            : 'bg-black/60 text-zinc-300 border-[#d4af37]/30 hover:border-[#d4af37]/70 hover:text-white'
                        }`}
                      >
                        <span className="truncate block">{preset.label}</span>
                      </button>

                      {/* Botón Lapicito para editar esta personalidad */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenPresetEditor(preset, e)}
                        className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md transition ${
                          isBeingEdited
                            ? 'bg-[#d4af37] text-black'
                            : 'text-zinc-400 hover:text-[#f0d060] hover:bg-black/80'
                        }`}
                        title={`Editar cómo se llama y cómo se comporta: ${preset.label}`}
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* ── PANEL DESPLEGABLE DE EDICIÓN DE PERSONALIDAD SELECCIONADA ── */}
              {editingPresetId && (
                <div className="mt-2 bg-[#121218] border-2 border-amber-500/60 rounded-xl p-3 space-y-2 shadow-2xl animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-1">
                    <span className="text-[10px] font-black text-amber-300 uppercase tracking-wide flex items-center gap-1">
                      ✏️ EDITANDO: {editLabel || 'PERSONALIDAD'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingPresetId(null)}
                      className="text-zinc-400 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label className="text-[9px] text-zinc-300 font-bold uppercase block mb-0.5">
                      Nombre del Botón en la carátula:
                    </label>
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      placeholder="Ej: ELEGANTE VIP, MI JEFE, ETC."
                      className="w-full bg-black/80 border border-amber-500/40 rounded-lg px-2 py-1 text-white text-[11px] font-bold outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-zinc-300 font-bold uppercase block mb-0.5">
                      Instrucción / Cómo se debe comportar:
                    </label>
                    <textarea
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      rows={3}
                      placeholder="Describe cómo quieres que hable y responda..."
                      className="w-full bg-black/80 border border-amber-500/40 rounded-lg p-2 text-white text-[11px] outline-none focus:border-amber-400 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleResetPreset(editingPresetId)}
                      className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      title="Regresar a los valores originales de fábrica"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Fábrica</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveEditedPreset(editingPresetId)}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1 hover:brightness-110 active:scale-95 shadow cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Aplicar a Este Botón</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 🚀 BOTÓN MAESTRO: GUARDAR Y APLICAR CAMBIOS */}
            <button
              type="button"
              disabled={isApplying}
              onClick={handleSaveAndApply}
              className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-98 border mt-1 ${
                applySuccess
                  ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.6)] animate-pulse'
                  : isApplying
                    ? 'bg-amber-600/80 text-white border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-wait'
                    : 'bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#f0d060] text-black hover:brightness-110 border-[#ffe57f] shadow-[0_0_25px_rgba(212,175,55,0.5)]'
              }`}
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>GUARDANDO Y APLICANDO CAMBIOS...</span>
                </>
              ) : applySuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>¡CAMBIOS APLICADOS CON ÉXITO!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>GUARDAR Y APLICAR CAMBIOS</span>
                </>
              )}
            </button>
          </div>

          {/* ── CUADRO 4: SOPORTE Y ASISTENCIA (WHATSAPP DIRECTO) ── */}
          <div className="rounded-3xl border-2 border-[#25D366] bg-[#0b141a] overflow-hidden shadow-[0_0_30px_rgba(37,211,102,0.25)] font-sans mt-1">
            {/* Cabecera WhatsApp */}
            <div className="bg-[#1f2c34] px-4 py-2 flex items-center justify-between border-b border-[#25D366]/30">
              <p className="text-xs font-extrabold text-white tracking-wide">
                Soporte y Asistencia
              </p>
              
              <div className="bg-emerald-600 border border-emerald-400 rounded-full px-3 py-0.5 text-center shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                <span className="text-[9px] font-black text-white uppercase tracking-wider block text-center leading-none">
                  EN LÍNEA
                </span>
              </div>
            </div>

            {/* Botón Cuadrado Verde de Asistencia Centrado */}
            <div className="p-4 space-y-2.5 bg-[#0b141a] flex flex-col items-center justify-center text-center">
              <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                ¿Necesitas ayuda o soporte técnico para tu Asistente? Presiona el botón para abrir WhatsApp oficial de inmediato:
              </p>

              <button
                type="button"
                onClick={() => {
                  const phone = supportPhone || "5575165733";
                  const msg = "HOLA NECESITO SOPORTE PARA ASISTENTE UNIVERSAL MI PREGUNTA ES ";
                  const cleanPhone = "52" + phone;
                  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-black font-black text-xs tracking-wider uppercase transition shadow-[0_0_20px_rgba(37,211,102,0.5)] cursor-pointer flex items-center justify-center gap-2 border border-white/20"
              >
                <span className="text-lg">💬</span>
                <span>PRESIONA PARA ASISTENCIA</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
