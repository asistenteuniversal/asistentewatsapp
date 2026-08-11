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
        className="relative z-10 w-full h-full flex flex-col justify-between overflow-hidden"
        style={{
          backgroundImage: `url(${neonPhoneCover})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Screen contents aligned exactly inside the gold chassis frame boundaries (12.5% padding on sides, 4% vertical) */}
        <div className="absolute top-[4%] bottom-[4%] left-[12.5%] right-[12.5%] rounded-[36px] overflow-hidden flex flex-col justify-between p-5 pb-10 pt-12 pointer-events-none z-20">
          
          {/* Top Control Bar */}
          <div className="flex items-center justify-between w-full mt-4 px-2">
            {/* Button: MOSTRAR INTERFAZ */}
            {onShowStudio ? (
              <button
                type="button"
                onClick={onShowStudio}
                className="px-3.5 py-2 rounded-xl border border-[#d4af37]/45 bg-black/85 backdrop-blur-md text-[#d4af37] text-[10px] font-bold tracking-wider hover:bg-[#d4af37]/15 active:scale-95 transition-all duration-200 ease-out focus:outline-none shadow-lg ring-4 ring-black pointer-events-auto flex items-center gap-1.5"
                title="Mostrar interfaz de chat y logs"
              >
                <Eye className="w-3 h-3 text-[#d4af37]" />
                <span>MOSTRAR INTERFAZ</span>
              </button>
            ) : (
              <div />
            )}

            {/* Button: Settings Config Gear */}
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-2 rounded-xl border border-[#d4af37]/45 bg-black/85 backdrop-blur-md text-[#d4af37] hover:bg-[#d4af37]/15 active:scale-95 transition-all duration-200 ease-out focus:outline-none shadow-lg ring-4 ring-black pointer-events-auto"
                title="Configuración"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Texts Section (NEON AVANTAR in polished gold with AVANTAR smaller) */}
          <div className="w-full flex flex-col items-center justify-center mt-10 select-none">
            {/* NEON */}
            <h1 
              className="text-3.5xl sm:text-4xl font-bold tracking-[0.25em] text-center uppercase"
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
            {/* AVANTAR */}
            <h2 
              className="text-[14px] sm:text-[16px] font-semibold tracking-[0.35em] text-center uppercase mt-2"
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

          {/* Empty flex area to separate content */}
          <div className="flex-1" />

          {/* Bottom Interactive Area */}
          <div className="w-full flex flex-col items-center gap-6 pb-4">
            {/* Call Duration Timer (Smaller, high legibility, wrapped in solid black badge to mask) */}
            <div className="px-4 py-1.5 rounded-xl bg-black/90 border border-white/5 shadow-md ring-4 ring-black pointer-events-none select-none">
              <span 
                className={`text-[24px] sm:text-[26px] font-bold tracking-[0.2em] font-mono transition-all duration-300 ${
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

            {/* Dynamic Buttons Layout */}
            <div className="flex items-center justify-center gap-10 w-full max-w-xs px-4">
              {/* Left Button: Video Call (Active & functional) */}
              <div className="relative">
                {isCallActive && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-ping pointer-events-none" />
                )}
                <button
                  id="boton_llamar_falso"
                  type="button"
                  onClick={onToggleVoice}
                  className={`w-[72px] h-[72px] rounded-full border-2 flex items-center justify-center pointer-events-auto transition-all duration-200 ease-out focus:outline-none shadow-lg ring-6 ring-black active:scale-90 ${
                    isCallActive 
                      ? 'border-emerald-500 text-emerald-400 bg-black/80 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                      : 'border-[#d4af37] text-[#d4af37] bg-black/60 shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:bg-[#d4af37]/15'
                  }`}
                  title="Activar o desactivar videollamada"
                >
                  <Video className="w-7 h-7" />
                </button>
              </div>

              {/* Right Button: Audio Call (Disconnected / Disabled) */}
              <button
                type="button"
                disabled
                className="w-[72px] h-[72px] rounded-full border-2 border-[#d4af37]/15 bg-black/40 flex items-center justify-center text-[#d4af37]/20 cursor-not-allowed focus:outline-none pointer-events-auto shadow-inner ring-6 ring-black/40"
                title="Llamada de audio no disponible en este momento"
              >
                <Phone className="w-7 h-7 rotate-[135deg]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
