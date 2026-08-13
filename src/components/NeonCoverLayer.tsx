import React, { useState, useEffect } from 'react';
import { Settings, Video, Phone, Eye, MicOff, Sliders } from 'lucide-react';
import avaLogo from '../assets/images/ava_logo.png';

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
  isSystemLoading?: boolean;
  isGoogleLinked: boolean;
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
  onOpenSettings?: () => void; // Abre administrador (Engrane original)
  onOpenClientSettings?: () => void; // Abre cliente (Sliders nuevo)
}

export const NeonCoverLayer: React.FC<NeonCoverLayerProps> = ({
  isSystemLoading = false,
  isGoogleLinked,
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
  onOpenClientSettings,
}) => {

  const [activeCallType, setActiveCallType] = useState<'video' | 'audio' | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Sincronizar estado de luz local cuando termine la llamada
  useEffect(() => {
    if (!isCallActive) {
      setActiveCallType(null);
      setIsMuted(false);
      // Asegurar que el hardware se des-silencie al colgar
      if ((window as any).AndroidInterface && (window as any).AndroidInterface.toggleMute) {
        try {
          (window as any).AndroidInterface.toggleMute(false);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isCallActive]);

  // Manejar el encendido/apagado del silencio a nivel de hardware
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if ((window as any).AndroidInterface && (window as any).AndroidInterface.toggleMute) {
      try {
        (window as any).AndroidInterface.toggleMute(nextMute);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Formato MM:SS para el cronómetro
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Consultar el estado real de la sesión (cookies o estado reactivo)
  const activeLinkedState = (window as any).AndroidInterface && (window as any).AndroidInterface.isGoogleSessionActive
    ? (window as any).AndroidInterface.isGoogleSessionActive()
    : isGoogleLinked;

  return (
    <div
      className="w-full h-full bg-black overflow-hidden relative select-none"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Fuente premium */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');`}</style>

      {/* Fondo negro puro absoluto (#000000) */}
      <div className="absolute inset-0 w-full h-full bg-black" />

      {/* Nuevo Logotipo AVA ASISTENTE flotante en el centro superior (PNG Transparente, más arriba y tamaño extra grande) */}
      <div className="absolute top-[7%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <img
          src={avaLogo}
          alt="AVA Asistente"
          className="w-[clamp(280px,75vw,390px)] h-auto object-contain"
          style={{
            filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.15))'
          }}
        />
      </div>

      {/* ── BOTÓN: MOSTRAR INTERFAZ (arriba izquierda) ── */}
      {SHOW_MOSTRAR_INTERFAZ && onShowStudio && (
        <button
          type="button"
          onClick={onShowStudio}
          className="absolute top-[5%] left-[5%] z-30 flex items-center justify-center p-2.5 rounded-xl
                     bg-black/70 border border-[#d4af37]/40 text-[#d4af37]
                     shadow-[0_0_12px_rgba(212,175,55,0.15)]
                     active:scale-95 transition-all duration-150 focus:outline-none
                     hover:bg-[#d4af37]/10"
          title="Mostrar interfaz"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}

      {/* ── BOTÓN: AJUSTES CLIENTE (arriba derecha, al lado del administrador) ── */}
      {SHOW_SETTINGS_BUTTON && onOpenClientSettings && (
        <button
          type="button"
          onClick={onOpenClientSettings}
          className="absolute top-[5%] right-[16%] z-30 p-2.5 rounded-xl
                     bg-black/70 border border-[#d4af37]/40 text-[#d4af37]
                     shadow-[0_0_12px_rgba(212,175,55,0.15)]
                     active:scale-95 transition-all duration-150 focus:outline-none
                     hover:bg-[#d4af37]/10"
          title="Ajustes de Usuario"
        >
          <Sliders className="w-4 h-4" />
        </button>
      )}

      {/* ── BOTÓN: CONFIGURACIÓN ADMINISTRADOR (arriba derecha, posición original) ── */}
      {SHOW_SETTINGS_BUTTON && onOpenSettings && (
        <button
          type="button"
          onClick={onOpenSettings}
          className="absolute top-[5%] right-[5%] z-30 p-2.5 rounded-xl
                     bg-black/70 border border-[#d4af37]/40 text-[#d4af37]
                     shadow-[0_0_12px_rgba(212,175,55,0.15)]
                     active:scale-95 transition-all duration-150 focus:outline-none
                     hover:bg-[#d4af37]/10"
          title="Configuración Avanzada"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}


      {/* ── BOTÓN FLOTANTE: INGRESA CUENTA DE GMAIL (Solo si no está vinculada) ── */}
      {!activeLinkedState && (
        <div className="absolute bottom-[31%] left-1/2 -translate-x-1/2 z-30">
          <button
            type="button"
            onClick={() => {
              if ((window as any).AndroidInterface && (window as any).AndroidInterface.showStudio) {
                try {
                  (window as any).AndroidInterface.showStudio(true);
                } catch (e) {
                  console.error(e);
                }
              } else {
                alert("Esta opción solo está disponible dentro de la aplicación de celular.");
              }
            }}
            className="py-2.5 px-6 rounded-full font-bold text-xs tracking-wider uppercase transition duration-200 flex items-center justify-center focus:outline-none active:scale-95 whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #fff5c0 0%, #f0d060 20%, #d4af37 45%, #b8860b 70%, #f0d060 85%, #fff5c0 100%)',
              color: '#000000',
              border: 'none',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.45)'
            }}
          >
            INGRESA CUENTA DE GMAIL
          </button>
        </div>
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
        style={{ 
          gap: 'clamp(16px, 5vw, 32px)',
          opacity: isSystemLoading ? 0.2 : 1,
          pointerEvents: isSystemLoading ? 'none' : 'auto',
          transition: 'opacity 0.5s ease'
        }}
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
            style={{ width: 'clamp(82px, 23vw, 110px)', height: 'clamp(82px, 23vw, 110px)' }}
            title="Iniciar / detener videollamada"
          >
            <Video style={{ width: 'clamp(31px, 9.3vw, 45px)', height: 'clamp(31px, 9.3vw, 45px)' }} />
          </button>
        </div>

        {/* BOTÓN CENTRO: Silencio (Mute) */}
        {SHOW_MUTE_BUTTON && (
          <button
            type="button"
            onClick={handleToggleMute}
            className={`rounded-full border-2 flex items-center justify-center transition-all duration-150 ease-out focus:outline-none active:scale-90
                       ${isMuted
                         ? 'border-red-500 text-red-500 bg-black shadow-[0_0_22px_rgba(239,68,68,0.45)]'
                         : 'border-[#d4af37] text-[#d4af37] bg-black shadow-[0_0_22px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]'
                       }`}
            style={{ width: 'clamp(68px, 19vw, 88px)', height: 'clamp(68px, 19vw, 88px)' }}
            title={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
          >
            <MicOff style={{ width: 'clamp(26px, 7.2vw, 37px)', height: 'clamp(26px, 7.2vw, 37px)' }} />
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
            style={{ width: 'clamp(82px, 23vw, 110px)', height: 'clamp(82px, 23vw, 110px)' }}
            title="Llamada de audio (solo voz)"
          >
            <Phone
              style={{ 
                width: 'clamp(31px, 9.3vw, 45px)', 
                height: 'clamp(31px, 9.3vw, 45px)', 
                transform: isCallActive && activeCallType === 'audio' ? 'rotate(135deg)' : 'none' 
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
