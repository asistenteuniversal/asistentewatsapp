import React, { useState, useEffect } from 'react';
import { X, Eye, Check, Globe, Clock, PhoneCall, Database } from 'lucide-react';
import { AppSettings } from '../types';
import { supabase } from '../supabaseClient';

export const EUROPE_VPN_COUNTRIES = [
  { code: 'GB', name: 'Reino Unido (Londres)', flag: '🇬🇧' },
  { code: 'DE', name: 'Alemania (Frankfurt)', flag: '🇩🇪' },
  { code: 'ES', name: 'España (Madrid)', flag: '🇪🇸' },
  { code: 'FR', name: 'Francia (París)', flag: '🇫🇷' },
  { code: 'NL', name: 'Países Bajos (Ámsterdam)', flag: '🇳🇱' },
  { code: 'CH', name: 'Suiza (Zúrich)', flag: '🇨🇭' },
  { code: 'IT', name: 'Italia (Milán)', flag: '🇮🇹' },
  { code: 'SE', name: 'Suecia (Estocolmo)', flag: '🇸🇪' },
  { code: 'DIRECT', name: 'DIRECTO (Sin VPN)', flag: '🌐' }
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (newInstructions: string) => Promise<void>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  errorLogs?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  settings,
  setSettings,
  errorLogs,
}) => {
  // ── ESTADOS LOCALES PARA LOS 4 BLOQUES LEGO ──
  const [selectedVpn, setSelectedVpn] = useState<string>(() => {
    if ((window as any).AndroidInterface?.getVpnCountry) {
      try { return (window as any).AndroidInterface.getVpnCountry() || 'GB'; } catch (e) {}
    }
    return settings.vpnCountry || localStorage.getItem('ava_vpn_country') || 'GB';
  });

  const [vpnAutoRotate, setVpnAutoRotate] = useState<boolean>(() => {
    if ((window as any).AndroidInterface?.isVpnAutoRotate) {
      try { return (window as any).AndroidInterface.isVpnAutoRotate(); } catch (e) {}
    }
    return settings.vpnAutoRotate !== undefined ? settings.vpnAutoRotate : (localStorage.getItem('ava_vpn_auto_rotate') !== 'false');
  });

  const [vpnSaved, setVpnSaved] = useState(false);

  // Bloque 2: Límite de duración de llamada editable (Predefinido 30)
  const [callDurationInput, setCallDurationInput] = useState<number>(() => {
    return settings.callDurationLimitMinutes || parseInt(localStorage.getItem('ava_call_duration_limit_min') || '30', 10);
  });
  const [durationSaved, setDurationSaved] = useState(false);

  // Bloque 3: Cuota de llamadas por hora editable (Predefinido 5)
  const [hourlyQuotaInput, setHourlyQuotaInput] = useState<number>(() => {
    return settings.hourlyCallQuota || parseInt(localStorage.getItem('ava_hourly_quota') || '5', 10);
  });
  const [quotaSaved, setQuotaSaved] = useState(false);

  // Bloque 4: Frecuencia de sincronización de memoria local (Predefinido 3 minutos)
  const [memoryIntervalInput, setMemoryIntervalInput] = useState<number>(() => {
    return settings.memorySyncIntervalMinutes || parseInt(localStorage.getItem('ava_memory_sync_interval_min') || '3', 10);
  });
  const [memoryIntervalSaved, setMemoryIntervalSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if ((window as any).AndroidInterface?.getVpnCountry) {
        try { setSelectedVpn((window as any).AndroidInterface.getVpnCountry() || 'GB'); } catch (e) {}
      }
      if ((window as any).AndroidInterface?.isVpnAutoRotate) {
        try { setVpnAutoRotate((window as any).AndroidInterface.isVpnAutoRotate()); } catch (e) {}
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handlers para guardar cada bloque de forma independiente
  const handleSaveVpn = () => {
    localStorage.setItem('ava_vpn_country', selectedVpn);
    localStorage.setItem('ava_vpn_auto_rotate', vpnAutoRotate ? 'true' : 'false');
    setSettings((prev) => ({ ...prev, vpnCountry: selectedVpn, vpnAutoRotate }));
    if ((window as any).AndroidInterface) {
      try {
        if ((window as any).AndroidInterface.setVpnCountry) {
          (window as any).AndroidInterface.setVpnCountry(selectedVpn);
        }
        if ((window as any).AndroidInterface.setVpnAutoRotate) {
          (window as any).AndroidInterface.setVpnAutoRotate(vpnAutoRotate);
        }
      } catch (e) {
        console.error('Error enviando VPN a Java:', e);
      }
    }
    setVpnSaved(true);
    setTimeout(() => setVpnSaved(false), 2000);
  };

  const handleSaveDurationLimit = () => {
    const validVal = Math.max(1, callDurationInput || 30);
    localStorage.setItem('ava_call_duration_limit_min', validVal.toString());
    setSettings((prev) => ({ ...prev, callDurationLimitMinutes: validVal }));
    setDurationSaved(true);
    setTimeout(() => setDurationSaved(false), 2000);
  };

  const handleSaveHourlyQuota = () => {
    const validVal = Math.max(1, hourlyQuotaInput || 5);
    localStorage.setItem('ava_hourly_quota', validVal.toString());
    setSettings((prev) => ({ ...prev, hourlyCallQuota: validVal }));
    setQuotaSaved(true);
    setTimeout(() => setQuotaSaved(false), 2000);
  };

  const handleSaveMemoryInterval = () => {
    const validVal = Math.max(1, memoryIntervalInput || 3);
    localStorage.setItem('ava_memory_sync_interval_min', validVal.toString());
    setSettings((prev) => ({ ...prev, memorySyncIntervalMinutes: validVal }));
    if ((window as any).AndroidInterface?.setMemoryInterval) {
      try {
        (window as any).AndroidInterface.setMemoryInterval(validVal * 60);
      } catch (e) {
        console.error('Error enviando intervalo a Java:', e);
      }
    }
    setMemoryIntervalSaved(true);
    setTimeout(() => setMemoryIntervalSaved(false), 2000);
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(settings.systemInstructions || '');
    }
    onClose();
  };

  const handleShowStudio = () => {
    if ((window as any).AndroidInterface && (window as any).AndroidInterface.showStudio) {
      try {
        (window as any).AndroidInterface.showStudio(true);
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("Esta opción solo está disponible dentro de la aplicación de celular.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020205]/85 backdrop-blur-xl flex items-center justify-center p-3 font-sans text-white">
      <div className="w-full max-w-sm bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 sm:p-5 shadow-[0_0_60px_rgba(6,182,212,0.2)] space-y-3.5 relative max-h-[94vh] overflow-y-auto">
        {/* Header - Botón del Ojito a la izquierda y Botón de cierre X a la derecha */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <button
            type="button"
            onClick={handleShowStudio}
            className="p-2 rounded-xl bg-black/70 border border-[#d4af37]/40 text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.15)] active:scale-95 transition hover:bg-[#d4af37]/10 flex items-center justify-center cursor-pointer"
            title="Mostrar Google Studio"
          >
            <Eye className="w-4 h-4" />
          </button>

          <span className="text-[#d4af37] font-black text-xs uppercase tracking-widest">
            ⚙️ AJUSTES ADMINISTRADOR
          </span>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-3 text-xs">

          {/* ========================================================================= */}
          {/* 🧩 [BLOQUE LEGO 1]: CONTROL DE VPN EUROPA (8 POTENCIAS Y AUTO-ROTACIÓN)  */}
          {/* ========================================================================= */}
          <div className="p-3 bg-white/5 rounded-2xl border border-[#d4af37]/40 backdrop-blur-md space-y-2">
            <div className="text-[#d4af37] font-bold font-sans text-[11px] uppercase tracking-wider flex items-center justify-between border-b border-white/10 pb-1">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>VPN EUROPA (8 POTENCIAS):</span>
              </span>
              {vpnSaved && (
                <span className="text-emerald-400 text-[10px] font-black flex items-center gap-0.5 animate-pulse">
                  <Check className="w-3 h-3" /> ¡GUARDADO!
                </span>
              )}
            </div>

            {/* Selector de País */}
            <div className="space-y-1">
              <label className="text-zinc-300 text-[10px] block">País de conexión:</label>
              <select
                value={selectedVpn}
                onChange={(e) => setSelectedVpn(e.target.value)}
                className="w-full bg-black border border-[#d4af37]/60 rounded-xl px-2.5 py-1.5 text-cyan-200 text-xs outline-none focus:border-[#d4af37] font-medium"
              >
                {EUROPE_VPN_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[#0a0a0f] text-cyan-200">
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Modo de rotación (Automático / Manual) */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setVpnAutoRotate(!vpnAutoRotate)}
                className={`w-full py-1.5 px-2.5 rounded-xl font-black text-[9.5px] uppercase tracking-wider transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                  vpnAutoRotate
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50 hover:bg-emerald-950/60'
                    : 'bg-zinc-900/60 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                }`}
              >
                <span>{vpnAutoRotate ? '🟢 AUTO-ROTAR AL ENCENDER (RECOMENDADO)' : '⚪ MODO MANUAL FIJO'}</span>
              </button>
            </div>

            {/* Botón Guardar VPN */}
            <button
              type="button"
              onClick={handleSaveVpn}
              className="w-full py-1.5 px-3 bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#b8860b] text-black font-black rounded-xl text-[10px] uppercase tracking-wider shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-1"
            >
              {vpnSaved ? <Check className="w-3.5 h-3.5 text-black" /> : null}
              <span>{vpnSaved ? '¡VPN APLICADA Y GUARDADA!' : 'GUARDAR AJUSTES VPN'}</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 🧩 [BLOQUE LEGO 2]: LÍMITE DE DURACIÓN POR LLAMADA (MINUTOS)              */}
          {/* ========================================================================= */}
          <div className="p-3 bg-white/5 rounded-2xl border border-cyan-500/30 backdrop-blur-md space-y-2">
            <div className="text-cyan-300 font-bold font-sans text-[11px] uppercase tracking-wider flex items-center justify-between border-b border-white/10 pb-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-300" />
                <span>DURACIÓN MÁXIMA POR LLAMADA:</span>
              </span>
              {durationSaved && (
                <span className="text-emerald-400 text-[10px] font-black flex items-center gap-0.5 animate-pulse">
                  <Check className="w-3 h-3" /> ¡GUARDADO!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={callDurationInput}
                  onChange={(e) => setCallDurationInput(parseInt(e.target.value, 10) || 0)}
                  placeholder="30"
                  className="w-full bg-black border border-cyan-500/50 rounded-xl px-3 py-1.5 text-white font-bold text-xs outline-none focus:border-cyan-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px] font-semibold pointer-events-none">
                  minutos
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveDurationLimit}
                className="py-2 px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl text-[10px] uppercase tracking-wider shadow active:scale-95 transition cursor-pointer shrink-0"
              >
                {durationSaved ? '¡GUARDADO!' : 'GUARDAR'}
              </button>
            </div>
            <p className="text-[9.5px] text-zinc-400 leading-tight">
              Predefinido: 30 minutos. Editable para cualquier cantidad (ej: 42, 50, 70).
            </p>
          </div>

          {/* ========================================================================= */}
          {/* 🧩 [BLOQUE LEGO 3]: CUOTA DE LLAMADAS POR HORA (ANTI-BLOQUEO)            */}
          {/* ========================================================================= */}
          <div className="p-3 bg-white/5 rounded-2xl border border-amber-500/30 backdrop-blur-md space-y-2">
            <div className="text-amber-300 font-bold font-sans text-[11px] uppercase tracking-wider flex items-center justify-between border-b border-white/10 pb-1">
              <span className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
                <span>CUOTA DE LLAMADAS POR HORA:</span>
              </span>
              {quotaSaved && (
                <span className="text-emerald-400 text-[10px] font-black flex items-center gap-0.5 animate-pulse">
                  <Check className="w-3 h-3" /> ¡GUARDADO!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={hourlyQuotaInput}
                  onChange={(e) => setHourlyQuotaInput(parseInt(e.target.value, 10) || 0)}
                  placeholder="5"
                  className="w-full bg-black border border-amber-500/50 rounded-xl px-3 py-1.5 text-white font-bold text-xs outline-none focus:border-amber-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px] font-semibold pointer-events-none">
                  llamadas / h
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveHourlyQuota}
                className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-[10px] uppercase tracking-wider shadow active:scale-95 transition cursor-pointer shrink-0"
              >
                {quotaSaved ? '¡GUARDADO!' : 'GUARDAR'}
              </button>
            </div>
            <p className="text-[9.5px] text-zinc-400 leading-tight">
              Predefinido: 5 llamadas/hora. Al llegar al límite pedirá esperar a la siguiente hora.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* 🧩 [BLOQUE LEGO 4]: FRECUENCIA DE MEMORIA LOCAL (MINUTOS)                 */}
          {/* ========================================================================= */}
          <div className="p-3 bg-white/5 rounded-2xl border border-emerald-500/30 backdrop-blur-md space-y-2">
            <div className="text-emerald-300 font-bold font-sans text-[11px] uppercase tracking-wider flex items-center justify-between border-b border-white/10 pb-1">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-300" />
                <span>FRECUENCIA DE MEMORIA LOCAL:</span>
              </span>
              {memoryIntervalSaved && (
                <span className="text-emerald-400 text-[10px] font-black flex items-center gap-0.5 animate-pulse">
                  <Check className="w-3 h-3" /> ¡GUARDADO!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={memoryIntervalInput}
                  onChange={(e) => setMemoryIntervalInput(parseInt(e.target.value, 10) || 0)}
                  placeholder="3"
                  className="w-full bg-black border border-emerald-500/50 rounded-xl px-3 py-1.5 text-white font-bold text-xs outline-none focus:border-emerald-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px] font-semibold pointer-events-none">
                  minutos
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveMemoryInterval}
                className="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-[10px] uppercase tracking-wider shadow active:scale-95 transition cursor-pointer shrink-0"
              >
                {memoryIntervalSaved ? '¡GUARDADO!' : 'GUARDAR'}
              </button>
            </div>
            <p className="text-[9.5px] text-zinc-400 leading-tight">
              Predefinido: 3 minutos (180s). Auto-guarda la conversación periódicamente en el celular.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* SECCIONES ORIGINALES DE AJUSTES GENERALES DEL ADMINISTRADOR              */}
          {/* ========================================================================= */}

          {/* System Instructions (Prompt) */}
          <div className="space-y-1">
            <label className="text-zinc-200 font-bold font-sans text-[11px] uppercase tracking-wider block">
              COMPORTAMIENTO ASISTENTE:
            </label>
            <textarea
              value={settings.systemInstructions || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, systemInstructions: e.target.value }))
              }
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-cyan-200 outline-none focus:border-cyan-500/80 font-sans text-xs backdrop-blur-md resize-none leading-relaxed"
              placeholder="Ejemplo: Eres un asistente servicial..."
            />
          </div>

          {/* Memoria de Conversacion (Prompt de Recuerdos) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap pb-0.5">
              <label className="text-zinc-200 font-bold text-[11px] uppercase tracking-wider">
                MEMORIA DE CONVERSACION:
              </label>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que deseas borrar toda la memoria de conversación local?')) {
                    setSettings((prev) => ({
                      ...prev,
                      systemMemory: '',
                      memorySaveDate: new Date().toDateString()
                    }));
                  }
                }}
                className="px-2 py-0.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-lg text-[8.5px] uppercase tracking-wider transition duration-300 cursor-pointer"
              >
                BORRADO DE MEMORIA DE CONVERSACION
              </button>
            </div>
            <textarea
              value={settings.systemMemory || ''}
              onChange={(e) => {
                const text = e.target.value;
                setSettings((prev) => ({ 
                  ...prev, 
                  systemMemory: text,
                  memorySaveDate: new Date().toDateString()
                }));
              }}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-cyan-200 outline-none focus:border-cyan-500/80 font-sans text-xs backdrop-blur-md resize-none leading-relaxed"
              placeholder="Escribe recuerdos de la conversación aquí..."
            />
          </div>

          {/* Conexión de Memoria Celular (Vincular / Autónomo) */}
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md font-sans">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-zinc-100 font-sans text-xs">
                Sincronización de Memoria:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    syncMemoryEnabled: prev.syncMemoryEnabled === undefined ? false : !prev.syncMemoryEnabled
                  }));
                }}
                className={`px-2.5 py-1 font-black rounded-xl text-[9px] uppercase tracking-wider transition duration-300 border cursor-pointer ${
                  settings.syncMemoryEnabled === false
                    ? 'bg-red-950/30 text-red-400 border-red-500/40 hover:bg-red-950/40'
                    : 'bg-green-950/30 text-green-300 border-green-500/40 hover:bg-green-950/40'
                }`}
              >
                {settings.syncMemoryEnabled === false ? '🔴 DESCONECTADO' : '🟢 CONECTADO (VINCULADO)'}
              </button>
            </div>
          </div>

          {/* Historial de Fallas */}
          <div className="space-y-1">
            <textarea
              readOnly
              value={errorLogs || localStorage.getItem('ava_last_error_log') || '[04/Sep/2026 02:10:43 AM] Start new stream'}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500/80 font-sans text-xs backdrop-blur-md resize-none leading-relaxed overflow-y-auto whitespace-pre-wrap select-text"
              placeholder="Historial de fallas..."
            />
          </div>

          {/* Voz del Asistente */}
          <div className="space-y-1 font-sans">
            <button
              type="button"
              onClick={async () => {
                const nextVoiceMale = !settings.voiceMaleEnabled;
                setSettings((prev) => ({
                  ...prev,
                  voiceMaleEnabled: nextVoiceMale
                }));

                const clientId = localStorage.getItem('ava_client_id');
                if (clientId) {
                  const genderDirective = nextVoiceMale
                    ? 'GÉNERO E IDENTIDAD: Eres un asistente masculino (hombre). Expresate, habla y reconócete siempre como hombre en todas tus respuestas.'
                    : 'GÉNERO E IDENTIDAD: Eres una asistente femenina (mujer). Expresate, habla y reconócete siempre como mujer en todas tus respuestas.';
                  
                  let updatedInstructions = settings.systemInstructions || '';
                  if (updatedInstructions.includes('GÉNERO E IDENTIDAD:')) {
                    updatedInstructions = updatedInstructions.replace(/GÉNERO E IDENTIDAD:.*$/m, genderDirective);
                  } else {
                    updatedInstructions = `${genderDirective}\n\n${updatedInstructions}`;
                  }

                  try {
                    await supabase
                      .from('asistente_config')
                      .update({ 
                        system_instructions: updatedInstructions 
                      } as any)
                      .eq('client_id', clientId);
                  } catch (e) {
                    console.error('Error sincronizando voz con Supabase:', e);
                  }
                }
              }}
              className={`w-full py-2.5 px-3 font-black rounded-2xl text-[10.5px] uppercase tracking-wider transition duration-300 border shadow-md cursor-pointer flex items-center justify-center text-center ${
                settings.voiceMaleEnabled
                  ? 'bg-green-950/30 text-green-400 border-green-500/40 hover:bg-green-950/50 shadow-green-950/20'
                  : 'bg-pink-950/30 text-pink-300 border-pink-400/50 hover:bg-pink-950/50 shadow-pink-950/20'
              }`}
            >
              {settings.voiceMaleEnabled
                ? '🟢 VOZ DE HOMBRE — CAMBIAR A MUJER'
                : '🌸 VOZ DE MUJER — CAMBIAR A HOMBRE'}
            </button>
          </div>

          {/* Días de Memoria a Conservar */}
          <div className="space-y-1">
            <label className="text-zinc-200 font-bold font-sans text-[11px] uppercase tracking-wider block">
              DÍAS DE MEMORIA DE CONVERSACIÓN A GUARDAR:
            </label>
            <select
              value={
                settings.memoryDays !== undefined &&
                settings.memoryDays !== null &&
                settings.memoryDays >= 0 &&
                settings.memoryDays <= 31
                  ? settings.memoryDays
                  : 2
              }
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setSettings((prev) => ({
                  ...prev,
                  memoryDays: val
                }));
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-cyan-200 outline-none focus:border-cyan-500/80 font-sans text-xs backdrop-blur-md"
            >
              <option value="0" className="bg-[#0a0a0f] text-cyan-200">0 (Infinito)</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num} className="bg-[#0a0a0f] text-cyan-200">
                  {num === 2 ? `${num} días (Predeterminado)` : `${num} días`}
                </option>
              ))}
            </select>
          </div>

          {/* Protección y Límites Anti-Bloqueo de Google */}
          <div className="p-3 bg-white/5 rounded-2xl border border-[#d4af37]/30 backdrop-blur-md space-y-2.5">
            <div className="text-[#d4af37] font-bold font-sans text-[11px] uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-1">
              <span>🛡️ PROTECCIÓN Y LÍMITES ANTI-BLOQUEO:</span>
            </div>

            {/* Máximo de Sesiones Continuas */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-300 text-[10.5px]">Sesiones seguidas permitidas:</span>
              <select
                value={settings.maxContinuousSessions || 3}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSettings((prev) => ({ ...prev, maxContinuousSessions: val }));
                  localStorage.setItem('ava_max_sessions', val.toString());
                }}
                className="bg-black border border-[#d4af37]/50 rounded-lg px-2 py-1 text-cyan-200 text-[10.5px] outline-none"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n === 3 ? `${n} sesiones (Predeterminado)` : `${n} sesiones`}
                  </option>
                ))}
              </select>
            </div>

            {/* Descanso tras límite de sesiones */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-300 text-[10.5px]">Descanso tras límite:</span>
              <select
                value={settings.sessionCooldownMinutes || 60}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSettings((prev) => ({ ...prev, sessionCooldownMinutes: val }));
                  localStorage.setItem('ava_session_cooldown_min', val.toString());
                }}
                className="bg-black border border-[#d4af37]/50 rounded-lg px-2 py-1 text-cyan-200 text-[10.5px] outline-none"
              >
                {[15, 30, 45, 60, 90, 120].map((m) => (
                  <option key={m} value={m}>
                    {m === 60 ? `${m} min (1 Hora - Predeterminado)` : `${m} min`}
                  </option>
                ))}
              </select>
            </div>

            {/* Bloqueo por 2 fallas consecutivas */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-300 text-[10.5px]">Bloqueo por 2 fallas seguidas:</span>
              <select
                value={settings.connectionFailuresLockMinutes || 60}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSettings((prev) => ({ ...prev, connectionFailuresLockMinutes: val }));
                  localStorage.setItem('ava_fail_lock_min', val.toString());
                }}
                className="bg-black border border-[#d4af37]/50 rounded-lg px-2 py-1 text-cyan-200 text-[10.5px] outline-none"
              >
                {[15, 30, 45, 60, 90, 120].map((m) => (
                  <option key={m} value={m}>
                    {m === 60 ? `${m} min (1 Hora)` : `${m} min`}
                  </option>
                ))}
              </select>
            </div>

            {/* Duración de aviso flotante */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-300 text-[10.5px]">Duración letrero flotante:</span>
              <select
                value={settings.bannerDurationSeconds || 15}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSettings((prev) => ({ ...prev, bannerDurationSeconds: val }));
                  localStorage.setItem('ava_banner_duration_sec', val.toString());
                }}
                className="bg-black border border-[#d4af37]/50 rounded-lg px-2 py-1 text-cyan-200 text-[10.5px] outline-none"
              >
                {[5, 10, 15, 20, 30].map((s) => (
                  <option key={s} value={s}>
                    {s === 15 ? `${s} seg (Recomendado)` : `${s} seg`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-1.5">
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-black text-black text-xs transition shadow-[0_0_30px_rgba(6,182,212,0.5)] uppercase tracking-wider cursor-pointer"
          >
            Guardar y Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
