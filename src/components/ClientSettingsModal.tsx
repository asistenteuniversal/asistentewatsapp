import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, LogOut, Send, Loader2, Sparkles } from 'lucide-react';
import { AppSettings } from '../types';
import { supabase } from '../supabaseClient';

interface ClientSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGoogleLinked: boolean;
  setIsGoogleLinked: (value: boolean) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const PERSONALITY_PRESETS = [
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
}) => {
  const [assistantName, setAssistantName] = useState(() => {
    return localStorage.getItem('ava_custom_assistant_name') || '';
  });
  const [selectedPersonality, setSelectedPersonality] = useState(() => {
    return localStorage.getItem('ava_custom_personality_id') || 'elegante';
  });
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('ava_custom_assistant_name') || '';
    const savedId = localStorage.getItem('ava_custom_personality_id') || 'elegante';
    setAssistantName(savedName);
    setSelectedPersonality(savedId);
    setIsApplyingChanges(false);
    setApplySuccess(false);
  }, [isOpen]);

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

  // 🎙️ CAMBIO INSTANTÁNEO DE VOZ Y GÉNERO (IDÉNTICO AL BOTÓN DE GUARDAR NOMBRES)
  const handleToggleVoiceInstant = async () => {
    const nextVoiceMale = !settings.voiceMaleEnabled;
    const clientId = localStorage.getItem('ava_client_id') || 'al_pachus_9468';
    const finalName = assistantName.trim() || localStorage.getItem('ava_custom_assistant_name') || 'Asistente';
    const activePreset = PERSONALITY_PRESETS.find(p => p.id === selectedPersonality) || PERSONALITY_PRESETS[0];

    const genderDirective = nextVoiceMale
      ? 'GÉNERO E IDENTIDAD: Eres un asistente masculino (hombre). Expresate, habla y reconócete siempre como hombre en todas tus respuestas.'
      : 'GÉNERO E IDENTIDAD: Eres una asistente femenina (mujer). Expresate, habla y reconócete siempre como mujer en todas tus respuestas.';

    const identityHeader = `[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE]:\nTu nombre oficial es: "${finalName}". Cuando el usuario te pregunte cómo te llamas o se dirija a ti, responde y reconócete siempre con este nombre.\n${genderDirective}\nESTILO DE COMUNICACIÓN: ${activePreset.prompt}\n\n`;
    
    const rawBaseInstructions = (settings.systemInstructions || '')
      .replace(/\[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE\]:[\s\S]*?(?=\n\n|$)/gi, '')
      .replace(/GÉNERO E IDENTIDAD:.*$/gm, '')
      .trim();
    const fullInstructionsWithIdentity = rawBaseInstructions
      ? `${identityHeader}${rawBaseInstructions}`
      : identityHeader.trim();

    // 1. Actualizar React localmente al instante (cambia el cuadro de comportamiento)
    setSettings((prev) => ({
      ...prev,
      voiceMaleEnabled: nextVoiceMale,
      systemInstructions: fullInstructionsWithIdentity
    }));

    // 2. Inyectar a Android / Java
    if ((window as any).AndroidInterface) {
      try {
        if ((window as any).AndroidInterface.updateVoiceOption) {
          (window as any).AndroidInterface.updateVoiceOption(nextVoiceMale);
        }
        if ((window as any).AndroidInterface.updateSystemInstructions) {
          (window as any).AndroidInterface.updateSystemInstructions(fullInstructionsWithIdentity);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Sincronizar con Supabase
    try {
      await supabase
        .from('asistente_config')
        .update({ system_instructions: fullInstructionsWithIdentity })
        .eq('client_id', clientId);
      console.log('[Supabase] Voz y género actualizados instantáneamente en la nube.');
    } catch (errSupabase) {
      console.warn('[Supabase] Error actualizando voz en Supabase:', errSupabase);
    }
  };

  const handleSelectPersonality = (preset: typeof PERSONALITY_PRESETS[0]) => {
    setSelectedPersonality(preset.id);
  };

  // 🚀 FUNCIÓN MAESTRA: GUARDAR Y APLICAR NOMBRE Y PERSONALIDAD EN VIVO
  const handleSaveAndApplyAll = async () => {
    setIsApplyingChanges(true);
    setApplySuccess(false);

    const finalName = assistantName.trim() || 'Asistente';
    localStorage.setItem('ava_custom_assistant_name', finalName);
    setAssistantName(finalName);

    const activePreset = PERSONALITY_PRESETS.find(p => p.id === selectedPersonality) || PERSONALITY_PRESETS[0];
    localStorage.setItem('ava_custom_personality_id', activePreset.id);
    localStorage.setItem('ava_custom_personality_label', activePreset.label);
    localStorage.setItem('ava_custom_personality_prompt', activePreset.prompt);

    const clientId = localStorage.getItem('ava_client_id') || 'al_pachus_9468';

    const genderDirective = settings.voiceMaleEnabled
      ? 'GÉNERO E IDENTIDAD: Eres un asistente masculino (hombre). Expresate, habla y reconócete siempre como hombre en todas tus respuestas.'
      : 'GÉNERO E IDENTIDAD: Eres una asistente femenina (mujer). Expresate, habla y reconócete siempre como mujer en todas tus respuestas.';

    const identityHeader = `[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE]:\nTu nombre oficial es: "${finalName}". Cuando el usuario te pregunte cómo te llamas o se dirija a ti, responde y reconócete siempre con este nombre.\n${genderDirective}\nESTILO DE COMUNICACIÓN: ${activePreset.prompt}\n\n`;
    
    const rawBaseInstructions = (settings.systemInstructions || '').replace(/^\[IDENTIDAD Y PERSONALIDAD DEL ASISTENTE\]:[\s\S]*?\n\n/gm, '');
    const fullInstructionsWithIdentity = `${identityHeader}${rawBaseInstructions}`;

    try {
      await supabase
        .from('asistente_config')
        .update({
          system_instructions: fullInstructionsWithIdentity
        })
        .eq('client_id', clientId);
      console.log('[Supabase] Instrucciones y personalidad sincronizadas con éxito a Supabase.');
    } catch (errSupabase) {
      console.warn('[Supabase] Advertencia al sincronizar con la nube:', errSupabase);
    }

    // 🧠 REGLA DE ORO: Al cambiar de comportamiento, resetear la memoria del celular para evitar contaminación de estilos
    setSettings((prev) => ({
      ...prev,
      systemInstructions: fullInstructionsWithIdentity,
      systemMemory: '' // Memoria limpia y fresca
    }));

    // Inyectar a Google Studio / Android únicamente las nuevas instrucciones limpias
    const mergedText = fullInstructionsWithIdentity;

    if ((window as any).AndroidInterface) {
      try {
        if ((window as any).AndroidInterface.updateSystemInstructions) {
          (window as any).AndroidInterface.updateSystemInstructions(mergedText);
        }
        if ((window as any).AndroidInterface.updateVoiceOption) {
          (window as any).AndroidInterface.updateVoiceOption(settings.voiceMaleEnabled);
        }
        if ((window as any).AndroidInterface.reloadStudio) {
          (window as any).AndroidInterface.reloadStudio();
        }
      } catch (e) {
        console.error('Error aplicando cambios a Java:', e);
      }
    }

    setTimeout(() => {
      setIsApplyingChanges(false);
      setApplySuccess(true);
      setTimeout(() => {
        onClose();
        if (onTriggerSecurityLoading) {
          onTriggerSecurityLoading();
        }
      }, 700);
    }, 600);
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    try {
      const existing = JSON.parse(localStorage.getItem('pending_support_tickets') || '[]');
      existing.push({
        date: new Date().toISOString(),
        text: supportMessage.trim()
      });
      localStorage.setItem('pending_support_tickets', JSON.stringify(existing));
    } catch (err) {
      console.error(err);
    }

    setIsSent(true);
    setTimeout(() => {
      setSupportMessage('');
      setIsSent(false);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020205]/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 font-sans text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');`}</style>
      
      <div 
        className="w-full max-w-md bg-[#0a0a0f] border border-[#d4af37]/40 rounded-3xl p-4 sm:p-5 shadow-[0_0_50px_rgba(212,175,55,0.2)] space-y-3 relative max-h-[96vh] overflow-y-auto select-none"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/25 pb-2">
          <h2 className="font-extrabold text-sm sm:text-base tracking-widest uppercase text-[#d4af37]">
            Ajustes y Asistencia
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-[#d4af37] hover:text-white transition focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bloque Superior de Botones de Cuenta y Voz */}
        <div className="space-y-2">
          {/* 1. Botón: Estado de Cuenta Google */}
          {activeLinkedState ? (
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 font-extrabold text-xs sm:text-[13px] tracking-wider uppercase flex items-center justify-center gap-2 focus:outline-none cursor-default shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Cuenta Vinculada Correctamente
            </button>
          ) : (
            <button
              onClick={handleLinkGoogle}
              className="w-full py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition duration-200 flex items-center justify-center focus:outline-none active:scale-98 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              style={{
                background: 'linear-gradient(135deg, #fff5c0 0%, #f0d060 20%, #d4af37 45%, #b8860b 70%, #f0d060 85%, #fff5c0 100%)',
                color: '#000000',
                border: 'none',
              }}
            >
              INGRESA CUENTA DE GMAIL
            </button>
          )}

          {/* 2. Botón: Cerrar Sesión de Gmail en 2 LÍNEAS */}
          <button
            onClick={handleLogoutGoogle}
            className="w-full py-2 px-4 rounded-2xl bg-red-600 hover:bg-red-500 border-2 border-red-400 text-white transition duration-200 flex flex-col items-center justify-center active:scale-98 focus:outline-none cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.4)] leading-tight"
          >
            <div className="flex items-center gap-1.5 font-black text-xs sm:text-[12px] uppercase tracking-wider">
              <LogOut className="w-3.5 h-3.5 text-white" />
              <span>CERRAR SESIÓN DE GMAIL</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold text-red-100 uppercase tracking-wide mt-0.5">
              (PRESIONA PARA CAMBIAR TU CORREO)
            </span>
          </button>

          {/* 3. Botón: Selector de Voz INSTANTÁNEO en 2 LÍNEAS */}
          <button
            type="button"
            onClick={handleToggleVoiceInstant}
            className={`w-full py-2 px-4 rounded-2xl transition duration-200 flex flex-col items-center justify-center border shadow-lg cursor-pointer leading-tight active:scale-98 ${
              settings.voiceMaleEnabled
                ? 'bg-green-950/30 text-green-400 border-green-500/40 hover:bg-green-950/50 shadow-green-950/20'
                : 'bg-pink-950/30 text-pink-300 border-pink-400/50 hover:bg-pink-950/50 shadow-pink-950/20'
            }`}
          >
            <span className="font-black text-xs sm:text-[12px] uppercase tracking-wider">
              {settings.voiceMaleEnabled ? '🟢 VOZ DE HOMBRE' : '🌸 VOZ DE MUJER'}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold opacity-90 uppercase tracking-wide mt-0.5">
              {settings.voiceMaleEnabled ? '(PRESIONA PARA CAMBIAR A VOZ DE MUJER)' : '(PRESIONA PARA CAMBIAR A VOZ DE HOMBRE)'}
            </span>
          </button>
        </div>

        {/* ── CUADRO INTEGRADO: PERSONALIZACIÓN DEL ASISTENTE Y BOTÓN DE APLICAR ── */}
        <div className="rounded-2xl border border-[#d4af37]/40 bg-black/40 p-3 sm:p-3.5 space-y-2.5 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
          {/* SECCIÓN: NOMBRE DEL ASISTENTE */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-black tracking-wider text-[#d4af37] uppercase block">
              NOMBRE DE TU ASISTENTE:
            </label>
            <input
              type="text"
              value={assistantName}
              onChange={(e) => setAssistantName(e.target.value)}
              placeholder="Escribe el nombre de tu asistente aquí... (Ej: Asistente)"
              className="w-full bg-[#14141a] border border-[#d4af37]/50 rounded-xl px-3 py-2 text-white placeholder-zinc-500 text-xs sm:text-[13px] outline-none focus:border-[#d4af37] font-semibold transition"
            />
          </div>

          {/* SECCIÓN: PERSONALIDADES (6 BOTONES DORADOS ELEGANTES) */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-black tracking-wider text-[#d4af37] uppercase block">
              ¿CÓMO QUIERES QUE SE COMPORTE TU ASISTENTE?
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PERSONALITY_PRESETS.map((preset) => {
                const isSelected = selectedPersonality === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPersonality(preset)}
                    className={`py-2 px-2 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-wider transition-all duration-200 border cursor-pointer text-center leading-tight active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#d4af37]/30 via-[#f0d060]/20 to-[#d4af37]/30 text-white border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-[1.02]'
                        : 'bg-black/60 text-zinc-300 border-[#d4af37]/30 hover:border-[#d4af37]/70 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 🚀 BOTÓN MAESTRO DENTRO DEL CUADRO: GUARDAR Y APLICAR CAMBIOS EN VIVO */}
          <button
            type="button"
            disabled={isApplyingChanges}
            onClick={handleSaveAndApplyAll}
            className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-[12px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-98 border mt-1 ${
              applySuccess
                ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.6)] animate-pulse'
                : isApplyingChanges
                  ? 'bg-amber-600/80 text-white border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-wait'
                  : 'bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#f0d060] text-black hover:brightness-110 border-[#ffe57f] shadow-[0_0_25px_rgba(212,175,55,0.5)]'
            }`}
          >
            {isApplyingChanges ? (
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

        {/* ── CUADRO 4: SOPORTE Y ASISTENCIA (ESTILO WHATSAPP DARK PROFESIONAL) ── */}
        <div className="rounded-3xl border-2 border-[#25D366] bg-[#0b141a] overflow-hidden shadow-[0_0_30px_rgba(37,211,102,0.25)] font-sans mt-1">
          {/* Cabecera WhatsApp */}
          <div className="bg-[#1f2c34] px-4 py-2 flex items-center justify-between border-b border-[#25D366]/30">
            <p className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
              Soporte y Asistencia
            </p>
            
            <div className="bg-red-600 border border-red-400 rounded-full px-3 py-0.5 text-center shadow-[0_0_12px_rgba(239,68,68,0.5)]">
              <span className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-wider block text-center leading-none">
                EN CONSTRUCCIÓN
              </span>
            </div>
          </div>

          {/* Cuerpo del Chat */}
          <div className="p-3 space-y-2 bg-[#0b141a]">
            <div className="flex items-start">
              <div className="bg-[#1f2c34] text-white rounded-2xl rounded-tl-none p-2.5 text-xs sm:text-[13px] leading-relaxed max-w-[92%] border border-white/10 shadow-md">
                <p className="font-normal text-white">
                  Hola 👋 ¿En qué podemos ayudarte? Escribe tu pregunta o mensaje de asistencia:
                </p>
                <span className="text-[9px] text-zinc-400 block text-right mt-1 font-mono">Hoy</span>
              </div>
            </div>

            {isSent && (
              <div className="bg-[#005c4b] text-white rounded-2xl rounded-tr-none p-2.5 text-xs sm:text-[13px] leading-relaxed max-w-[92%] ml-auto border border-[#25D366]/40 shadow-lg animate-pulse">
                <p className="font-semibold">✅ ¡Mensaje recibido! Te responderemos a la brevedad.</p>
                <span className="text-[9px] text-emerald-200 block text-right mt-1 font-mono">Enviado ✓✓</span>
              </div>
            )}

            <form onSubmit={handleSendSupport} className="pt-1 flex items-center gap-2">
              <input
                type="text"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="flex-1 bg-[#2a3942] border border-white/15 rounded-2xl px-3 py-1.5 text-white placeholder-zinc-400 text-xs sm:text-[12px] outline-none focus:border-[#25D366] transition font-sans shadow-inner"
              />
              <button
                type="submit"
                disabled={!supportMessage.trim()}
                className="p-2 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-black disabled:opacity-40 disabled:pointer-events-none transition shadow-[0_0_15px_rgba(37,211,102,0.4)] cursor-pointer flex items-center justify-center"
              >
                <Send className="w-4 h-4 fill-black" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
