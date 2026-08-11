import React from 'react';
import { Settings, Video, Phone, Eye } from 'lucide-react';
import neonPhoneCover from '../assets/images/neon_phone_cover_1785688045682.jpg';

interface NeonCoverLayerProps {
  isCallActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  callDuration: number;
  onToggleVoice: () => void;
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
  transcript,
  pulseSpeed,
  onShowStudio,
  onOpenSettings,
}) => {
  // Format seconds into MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="w-full h-full bg-[#020205] flex items-center justify-center select-none overflow-hidden relative font-sans">
      {/* Import Premium Outfit Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap');
      `}</style>

      {/* Smartphone Chassis using the clean gold cover as background directly, spanning 100% of screen */}
      <div 
        className="relative z-10 w-full h-full overflow-hidden"
        style={{
          backgroundImage: `url(${neonPhoneCover})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* HTML BUTTONS AND TEXTS ALIGNED EXACTLY TO THE GOLD PHONE FRAME GRAPHICS */}

        {/* 1. Top Button: MOSTRAR INTERFAZ (Positioned at top-left: 6.8% top, 8.5% left, 32% width, 5% height) */}
        {onShowStudio && (
          <button
            type="button"
            onClick={onShowStudio}
            className="absolute top-[6.8%] left-[8.5%] w-[32%] h-[5%] rounded-xl border border-[#d4af37]/45 bg-black/85 backdrop-blur-md text-[#d4af37] text-[10px] font-bold tracking-wider hover:bg-[#d4af37]/15 active:scale-95 transition-all duration-200 ease-out focus:outline-none shadow-lg ring-4 ring-black pointer-events-auto flex items-center justify-center gap-1.5 z-30"
            title="Mostrar interfaz de chat y logs"
          >
            <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>MOSTRAR INTERFAZ</span>
          </button>
        )}

        {/* 2. Top Button: Settings Gear (Positioned at top-right: 6.8% top, 8.5% right, 12% width, 5% height) */}
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="absolute top-[6.8%] right-[8.5%] w-[12%] h-[5%] rounded-xl border border-[#d4af37]/45 bg-black/85 backdrop-blur-md text-[#d4af37] hover:bg-[#d4af37]/15 active:scale-95 transition-all duration-200 ease-out focus:outline-none shadow-lg ring-4 ring-black pointer-events-auto flex items-center justify-center z-30"
            title="Configuración"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* 3. Text Section (NEON AVANTAR in polished gold: centered horizontally, 26.5% top) */}
        <div className="absolute top-[26.5%] left-1/2 transform -translate-x-1/2 flex flex-col items-center select-none pointer-events-none w-[60%] z-20">
          {/* NEON */}
          <h1 
            className="text-[38px] sm:text-[44px] font-bold tracking-[0.25em] text-center uppercase leading-none"
            style={{
              background: 'linear-gradient(135deg, #fffae0 0%, #d4af37 40%, #b38600 70%, #f3e5ab 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            NEON
          </h1>
          {/* AVANTAR (smaller) */}
          <h2 
            className="text-[14px] sm:text-[16px] font-semibold tracking-[0.35em] text-center uppercase mt-3.5 leading-none"
            style={{
              background: 'linear-gradient(135deg, #fffae0 0%, #d4af37 40%, #b38600 70%, #f3e5ab 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))',
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            AVANTAR
          </h2>
        </div>

        {/* 4. Call Duration Timer (Centered horizontally, 20.8% bottom height) */}
        <div className="absolute bottom-[20.8%] left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-xl bg-black/90 border border-white/5 shadow-md ring-4 ring-black pointer-events-none select-none z-20">
          <span 
            className={`text-[23px] sm:text-[25px] font-bold tracking-[0.2em] font-mono transition-all duration-300 ${
              isCallActive 
                ? 'animate-pulse' 
                : 'opacity-40'
            }`}
            style={{
              background: 'linear-gradient(135deg, #fffae0 0%, #d4af37 40%, #b38600 70%, #f3e5ab 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))'
            }}
          >
            {formatTimer(isCallActive ? callDuration : 0)}
          </span>
        </div>

        {/* 5. Bottom Video Call Button (Active, bottom-left: 10.5% bottom, 23.5% left, 21% width, 9.5% height) */}
        <div className="absolute bottom-[10.5%] left-[23.5%] w-[21%] h-[9.5%] z-30">
          {isCallActive && (
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-ping pointer-events-none" />
          )}
          <button
            id="boton_llamar_falso"
            type="button"
            onClick={onToggleVoice}
            className={`w-full h-full rounded-full border-2 flex items-center justify-center pointer-events-auto transition-all duration-200 ease-out focus:outline-none shadow-lg ring-6 ring-black active:scale-90 ${
              isCallActive 
                ? 'border-emerald-500 text-emerald-400 bg-black/80 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                : 'border-[#d4af37] text-[#d4af37] bg-black/60 shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:bg-[#d4af37]/15'
            }`}
            title="Activar o desactivar videollamada"
          >
            <Video className="w-7 h-7" />
          </button>
        </div>

        {/* 6. Bottom Audio Call Button (Disabled, bottom-right: 10.5% bottom, 23.5% right, 21% width, 9.5% height) */}
        <button
          type="button"
          disabled
          className="absolute bottom-[10.5%] right-[23.5%] w-[21%] h-[9.5%] rounded-full border-2 border-[#d4af37]/15 bg-black/40 flex items-center justify-center text-[#d4af37]/20 cursor-not-allowed focus:outline-none pointer-events-auto shadow-inner ring-6 ring-black/40 z-30"
          title="Llamada de audio no disponible en este momento"
        >
          <Phone className="w-7 h-7 rotate-[135deg]" />
        </button>
      </div>
    </div>
  );
};
