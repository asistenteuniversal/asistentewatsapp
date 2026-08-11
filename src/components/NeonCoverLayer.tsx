import React, { useState, useEffect } from 'react';
import { Settings, Video, Phone, Eye, MicOff } from 'lucide-react';
import neonPhoneCover from '../assets/images/neon_phone_cover_1785688045682.jpg';

// ============================================================
// CONFIGURACIÓN FÁCIL - Para producción cambia true/false aquí
// ============================================================
const SHOW_MOSTRAR_INTERFAZ = true;  // ← false para ocultar en producción
const SHOW_SETTINGS_BUTTON  = true;  // ← false para ocultar en producción
const SHOW_MUTE_BUTTON      = true;  // ← false para quitar botón de silencio
// ============================================================

// Estilos de oro metálico ultra-realista (reutilizable)
const goldGradient = 'linear-gradient(135deg, #fff5c0 0%, #f0d060 20%, #d4af37 45%, #b8860b 70%, #f0d060 85%, #fff5c0 100%)';
const goldTextStyle: React.CSSProperties = {
  background: goldGradient,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))',
  fontFamily: "'Outfit', sans-serif",
};

interface NeonCoverLayerProps {
  isCallActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  callDuration: number;
  onToggleVoice: () => void;
  onToggleAudio?: () => void;
  transcript: string;
  pulseSpeed: number;
  onShowStudio?: () => void;
  onOpenSettings?: () => void;
}

export const NeonCoverLayer: React.FC<NeonCoverLayerProps> = ({
  isCallActive,
  isListening,
  isSpeaking,
  audioLevel,
  callDuration,
  onToggleVoice,
  onToggleAudio,
  transcript,
  pulseSpeed,
  onShowStudio,
  onOpenSettings,
}) => {
  const [activeCallType, setActiveCallType] = useState<'video' | 'audio' | null>(null);

  // Sincronizar estado de luz local cuando termine la llamada
  useEffect(() => {
    if (!isCallActive) {
      setActiveCallType(null);
    }
  }, [isCallActive]);

  // Formato MM:SS para el cronómetro
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div
      className="w-full h-full bg-black overflow-hidden relative select-none"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Fuente premium */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');`}</style>

      {/* Imagen de fondo: logo + NEON AVANTAR, fondo negro puro, 100% pantalla */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${neonPhoneCover})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* ── BOTÓN: MOSTRAR INTERFAZ (arriba izquierda) ── */}
      {SHOW_MOSTRAR_INTERFAZ && onShowStudio && (
        <button
          type="button"
          onClick={onShowStudio}
          className="absolute top-[5%] left-[5%] z-30 flex items-center gap-2 px-3 py-2 rounded-xl
                     bg-black/70 border border-[#d4af37]/40 text-[#d4af37]
                     text-[10px] font-bold tracking-widest uppercase
                     shadow-[0_0_12px_rgba(212,175,55,0.15)]
                     active:scale-95 transition-all duration-150 focus:outline-none
                     hover:bg-[#d4af37]/10"
          title="Mostrar interfaz"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>MOSTRAR INTERFAZ</span>
        </button>
      )}

      {/* ── BOTÓN: CONFIGURACIÓN (arriba derecha) ── */}
      {SHOW_SETTINGS_BUTTON && onOpenSettings && (
        <button
          type="button"
          onClick={onOpenSettings}
          className="absolute top-[5%] right-[5%] z-30 p-2.5 rounded-xl
                     bg-black/70 border border-[#d4af37]/40 text-[#d4af37]
                     shadow-[0_0_12px_rgba(212,175,55,0.15)]
                     active:scale-95 transition-all duration-150 focus:outline-none
                     hover:bg-[#d4af37]/10"
          title="Configuración"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}

      {/* ── CRONÓMETRO: escala con vw para cualquier Android ── */}
      <div className="absolute bottom-[24%] left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
        <span
          className={`font-bold font-mono transition-all duration-300 ${
            isCallActive ? 'opacity-100 animate-pulse' : 'opacity-35'
          }`}
          style={{
            ...goldTextStyle,
            fontSize: 'clamp(18px, 6vw, 30px)',
            letterSpacing: '0.2em',
          }}
        >
          {formatTimer(isCallActive ? callDuration : 0)}
        </span>
      </div>

      {/* ── FILA DE BOTONES DE LLAMADA: escala con vw para cualquier Android ── */}
      <div
        className="absolute bottom-[9%] left-1/2 -translate-x-1/2 z-30 flex items-center"
        style={{ gap: 'clamp(16px, 5vw, 32px)' }}
      >
        {/* BOTÓN IZQUIERDA: Videollamada (ACTIVO y CONECTADO) */}
        <div className="relative">
          {isCallActive && activeCallType === 'video' && (
            <div
              className="absolute inset-0 rounded-full border-2 border-emerald-400/50 animate-ping pointer-events-none"
              style={{ transform: 'scale(1.15)' }}
            />
          )}
          <button
            id="boton_llamar_falso"
            type="button"
            onClick={() => {
              if (isCallActive) {
                onToggleVoice();
                setActiveCallType(null);
              } else {
                onToggleVoice();
                setActiveCallType('video');
              }
            }}
            className={`rounded-full border-2 flex items-center justify-center
                        transition-all duration-150 ease-out focus:outline-none active:scale-90
                        ${isCallActive && activeCallType === 'video'
                          ? 'border-emerald-400 text-emerald-400 bg-black shadow-[0_0_22px_rgba(52,211,153,0.45)]'
                          : 'border-[#d4af37] text-[#d4af37] bg-black shadow-[0_0_22px_rgba(212,175,55,0.3)]'
                        }`}
            style={{ width: 'clamp(56px, 16vw, 76px)', height: 'clamp(56px, 16vw, 76px)' }}
            title="Iniciar / detener videollamada"
          >
            <Video style={{ width: 'clamp(22px, 6.5vw, 32px)', height: 'clamp(22px, 6.5vw, 32px)' }} />
          </button>
        </div>

        {/* BOTÓN CENTRO: Silencio (visible, SIN conectar aún) */}
        {SHOW_MUTE_BUTTON && (
          <button
            type="button"
            disabled
            className="rounded-full border-2 border-[#d4af37]/25 bg-black
                       flex items-center justify-center
                       text-[#d4af37]/30 cursor-not-allowed focus:outline-none"
            style={{ width: 'clamp(46px, 13vw, 62px)', height: 'clamp(46px, 13vw, 62px)' }}
            title="Silencio (próximamente)"
          >
            <MicOff style={{ width: 'clamp(18px, 5vw, 26px)', height: 'clamp(18px, 5vw, 26px)' }} />
          </button>
        )}

        {/* BOTÓN DERECHA: Teléfono (activo para llamadas de audio) */}
        <div className="relative">
          {isCallActive && activeCallType === 'audio' && (
            <div
              className="absolute inset-0 rounded-full border-2 border-red-500/50 animate-ping pointer-events-none"
              style={{ transform: 'scale(1.15)' }}
            />
          )}
          <button
            type="button"
            onClick={() => {
              if (onToggleAudio) {
                if (isCallActive) {
                  onToggleAudio();
                  setActiveCallType(null);
                } else {
                  onToggleAudio();
                  setActiveCallType('audio');
                }
              }
            }}
            className={`rounded-full border-2 flex items-center justify-center
                        transition-all duration-150 ease-out focus:outline-none active:scale-90
                        ${isCallActive && activeCallType === 'audio'
                          ? 'border-red-500 text-red-500 bg-black shadow-[0_0_22px_rgba(239,68,68,0.45)]'
                          : 'border-[#d4af37] text-[#d4af37] bg-black shadow-[0_0_22px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]'
                        }`}
            style={{ width: 'clamp(56px, 16vw, 76px)', height: 'clamp(56px, 16vw, 76px)' }}
            title="Llamada de audio (solo voz)"
          >
            <Phone
              style={{ 
                width: 'clamp(22px, 6.5vw, 32px)', 
                height: 'clamp(22px, 6.5vw, 32px)', 
                transform: isCallActive && activeCallType === 'audio' ? 'rotate(135deg)' : 'none' 
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
