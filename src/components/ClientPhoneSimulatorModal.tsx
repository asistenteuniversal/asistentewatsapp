import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Sparkles, MessageCircle, Move, Volume2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export const PERSONALITY_PRESETS = [
  {
    id: 'elegante',
    label: 'ELEGANTE Y FORMAL',
    prompt: 'Habla de forma muy culta, distinguida, educada y profesional. Usa un vocabulario refinado y respetuoso.'
  },
  {
    id: 'alegre',
    label: 'ALEGRE Y AMIGABLE',
    prompt: 'SÃ© sumamente entusiasta, alegre, amigable, optimista y cercano en cada una de tus respuestas.'
  },
  {
    id: 'conciso',
    label: 'SABIO Y CONCISO',
    prompt: 'SÃ© directo, conciso y sabio. Responde sin rodeos, con claridad absoluta y al grano.'
  },
  {
    id: 'barrio',
    label: 'ESTILO DE BARRIO',
    prompt: 'Habla con el estilo y el acento del barrio de Tepito y compÃ³rtate como una persona de barrio. IMPORTANTE: SÃ© simpÃ¡tico pero NUNCA uses groserÃ­as, vulgaridades ni albures ofensivos.'
  },
  {
    id: 'agresivo',
    label: 'AGRESIVO Y PELEONERO',
    prompt: 'SÃ© sumamente rudo, agresivo, retador, peleonero y de pocas pulgas en tus respuestas. IMPORTANTE: SÃ© muy rudo y contestatario pero NUNCA uses groserÃ­as vulgares ni insultos prohibidos.'
  },
  {
    id: 'ejecutivo',
    label: 'EJECUTIVO DE NEGOCIOS',
    prompt: 'EnfÃ³cate en resultados, productividad, finanzas, eficiencia ejecutiva y toma de decisiones corporativas.'
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
  supportPhone = '527711540637'
}) => {
  if (!isOpen || !client) return null;

  // Estados locales editables en el simulador
  const [assistantName, setAssistantName] = useState<string>(client.assistant_name || 'AVA');
  const [userName, setUserName] = useState<string>(client.client_name || '');
  const [selectedStyleId, setSelectedStyleId] = useState<string>(() => {
    const found = PERSONALITY_PRESETS.find(p => client.system_instructions?.includes(p.prompt.slice(0, 25)));
    return found ? found.id : 'elegante';
  });
  const [currentVoice, setCurrentVoice] = useState<string>(() => client.voice_selection || 'Zephyr');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Arrastre libre (Draggable) en computadora
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const defaultX = typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 520) : 100;
    return { x: defaultX, y: 50 };
  });
  const isDraggingRef = useRef(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) return; // En mÃ³vil no arrastra
    isDraggingRef.current = true;
    dragStartOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const nextX = Math.max(10, Math.min(window.innerWidth - 480, e.clientX - dragStartOffset.current.x));
      const nextY = Math.max(10, Math.min(window.innerHeight - 600, e.clientY - dragStartOffset.current.y));
      setPosition({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Al seleccionar personalidad
  const handleSelectPersonality = (preset: typeof PERSONALITY_PRESETS[0]) => {
    setSelectedStyleId(preset.id);
  };

  // Alternar voz
  const handleToggleVoice = async () => {
    const nextVoice = currentVoice === 'Zephyr' ? 'Algieba' : 'Zephyr';
    setCurrentVoice(nextVoice);
    if (onSaveVoice) {
      await onSaveVoice(client.client_id, nextVoice);
    }
  };

  // Guardar y Aplicar Cambios
  const handleSaveAndApply = async () => {
    setIsSaving(true);
    try {
      const activePreset = PERSONALITY_PRESETS.find(p => p.id === selectedStyleId) || PERSONALITY_PRESETS[0];
      
      // Armar prompt completo respetando nombre de usuario y nombre de asistente
      let promptCompleto = `Eres ${assistantName || 'AVA'}, un asistente de voz inteligente, servicial y amigable. `;
      if (userName.trim()) {
        promptCompleto += `Te estÃ¡s comunicando con ${userName.trim()}, tu usuario y jefe. DirÃ­gete a Ã©l por su nombre siempre que sea apropiado con respeto y aprecio. `;
      }
      promptCompleto += activePreset.prompt;

      // 1. Guardar en base de datos
      await onSaveInstructions(client.client_id, promptCompleto);

      // 2. Guardar nombres y estilo en tabla asistente_config
      await supabase
        .from('asistente_config')
        .update({
          assistant_name: assistantName,
          client_name: userName || client.client_name,
          personality_style: activePreset.label,
          voice_selection: currentVoice
        })
        .eq('client_id', client.client_id);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error al guardar en simulador:', err);
    } finally {
      setIsSaving(false);
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
      {/* Marco de TelÃ©fono Celular Grande y NÃ­tido */}
      <div className="w-full max-w-[460px] bg-[#0c0c10] border-2 border-[#BF953F]/70 rounded-[38px] shadow-[0_0_50px_rgba(0,0,0,0.95),0_0_30px_rgba(191,149,63,0.35)] overflow-hidden flex flex-col font-sans text-white select-none">
        
        {/* Barra Superior Arrastrable (Header tipo TelÃ©fono) */}
        <div
          onMouseDown={handleMouseDown}
          className="bg-gradient-to-r from-[#17171e] via-[#23232c] to-[#17171e] px-5 py-3 border-b border-[#BF953F]/40 flex items-center justify-between cursor-move"
          title="Haz clic y arrastra para mover el simulador"
        >
          <div className="flex items-center gap-2 text-[#FCF6BA]">
            <Move className="w-4 h-4 opacity-70" />
            <span className="text-[11px] font-black uppercase tracking-widest text-shadow-gold">
              SIMULADOR EN VIVO: {client.client_name.toUpperCase()}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/50 hover:bg-red-600/80 text-white flex items-center justify-center transition active:scale-95 border border-white/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pantalla del TelÃ©fono (Copia IdÃ©ntica a la CarÃ¡tula) */}
        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto custom-scrollbar bg-black/60">
          
          {/* TÃ­tulo de la CarÃ¡tula */}
          <div className="flex items-center justify-between border-b border-[#BF953F]/20 pb-2">
            <h2 className="text-sm font-black tracking-widest text-[#FCF6BA] uppercase">
              AJUSTES Y ASISTENCIA
            </h2>
            <span className="text-[10px] text-zinc-400 font-mono">ID: {client.client_id}</span>
          </div>

          {/* Cuenta Vinculada */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-2 rounded-2xl text-[11px] font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="uppercase tracking-wider">CUENTA VINCULADA CORRECTAMENTE</span>
          </div>

          {/* BotÃ³n de Voz */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className="w-full bg-[#18111e] hover:bg-[#251733] border border-[#d946ef]/40 text-[#f5d0fe] py-2.5 px-4 rounded-2xl flex items-center justify-between transition active:scale-98 shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-2 text-left">
              <Volume2 className="w-4 h-4 text-[#d946ef]" />
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider">
                  {currentVoice === 'Zephyr' ? 'ðŸŒ¸ VOZ DE MUJER (ZEPHYR)' : 'ðŸŽ™ï¸ VOZ DE HOMBRE (ALGIEBA)'}
                </div>
                <div className="text-[9px] text-zinc-400">
                  (Presiona para cambiar a voz de {currentVoice === 'Zephyr' ? 'Hombre' : 'Mujer'})
                </div>
              </div>
            </div>
            <span className="text-[9px] bg-[#d946ef]/20 border border-[#d946ef]/40 px-2 py-0.5 rounded-full font-mono text-[#f5d0fe]">
              CAMBIAR
            </span>
          </button>

          {/* Nombre de tu Asistente */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#FCF6BA] font-extrabold uppercase tracking-widest block">
              NOMBRE DE TU ASISTENTE:
            </label>
            <input
              type="text"
              value={assistantName}
              onChange={(e) => setAssistantName(e.target.value)}
              placeholder="Ej: AVA, Asistente..."
              className="w-full bg-[#101014] border border-[#BF953F]/40 rounded-xl px-3.5 py-2 text-sm text-white font-medium focus:outline-none focus:border-[#FCF6BA] transition"
            />
          </div>

          {/* CÃ³mo quieres que te llame a ti (La mejora solicitada por Don Alberto) */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#FCF6BA] font-extrabold uppercase tracking-widest block">
              Â¿CÃ“MO QUIERES QUE TE LLAME EL ASISTENTE?:
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Tu nombre o apodo (Ej: Alberto, Jefe, Licenciado...)"
              className="w-full bg-[#101014] border border-[#BF953F]/40 rounded-xl px-3.5 py-2 text-sm text-white font-medium focus:outline-none focus:border-[#FCF6BA] transition"
            />
          </div>

          {/* Â¿CÃ³mo quieres que se comporte tu asistente? (Los 6 Botones) */}
          <div className="space-y-2">
            <label className="text-[10px] text-[#FCF6BA] font-extrabold uppercase tracking-widest block">
              Â¿CÃ“MO QUIERES QUE SE COMPORTE TU ASISTENTE?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PERSONALITY_PRESETS.map((preset) => {
                const isSelected = selectedStyleId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPersonality(preset)}
                    className={`py-2 px-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-center transition active:scale-95 border cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#BF953F]/30 via-[#FCF6BA]/20 to-[#BF953F]/30 border-[#FCF6BA] text-[#FCF6BA] shadow-[0_0_12px_rgba(252,246,186,0.3)]'
                        : 'bg-[#101014] border-[#BF953F]/20 text-zinc-300 hover:border-[#BF953F]/50'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BotÃ³n Guardar y Aplicar Cambios */}
          <button
            type="button"
            onClick={handleSaveAndApply}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#AA771C] hover:opacity-95 text-black font-black text-xs py-3 px-4 rounded-xl uppercase tracking-wider shadow-[0_0_20px_rgba(191,149,63,0.4)] flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer mt-2"
          >
            <Sparkles className="w-4 h-4 text-black fill-black" />
            <span>{isSaving ? 'GUARDANDO CAMBIOS...' : 'âœ¨ GUARDAR Y APLICAR CAMBIOS'}</span>
          </button>

          {/* Mensaje de ConfirmaciÃ³n */}
          {saveSuccess && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold p-2 rounded-xl text-center animate-bounce">
              âœ“ Â¡Cambios guardados y aplicados al celular en vivo!
            </div>
          )}

          {/* Soporte y Asistencia */}
          <div className="bg-[#0e1612] border border-emerald-500/30 rounded-2xl p-3.5 space-y-2 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#FCF6BA] uppercase tracking-wider">
                SOPORTE Y ASISTENCIA
              </span>
              <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                EN LÃNEA
              </span>
            </div>
            <p className="text-[9px] text-zinc-300 leading-relaxed">
              Â¿Necesitas ayuda o soporte tÃ©cnico para tu Asistente? Presiona el botÃ³n para abrir WhatsApp oficial:
            </p>
            <a
              href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}?text=Hola,%20necesito%20asistencia%20con%20mi%20Asistente%20Universal`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-black text-[11px] py-2 px-3 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-98 shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>PRESIONA PARA ASISTENCIA</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};