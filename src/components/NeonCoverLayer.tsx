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
        {/* Screen contents positioned inside the physical phone chassis boundaries */}
        <div className="absolute inset-0 top-[2.2%] bottom-[2.2%] left-[2.6%] right-[2.6%] rounded-[40px] overflow-hidden flex flex-col justify-between p-6 pb-12 pt-14 pointer-events-none z-20">
          
          {/* Top Control Bar */}
          <div className="flex items-center justify-between w-full mt-4 px-2">
            {/* Button: MOSTRAR INTERFAZ */}
            {onShowStudio ? (
              <button
                type="button"
                onClick={onShowStudio}
                className="px-4 py-2 rounded-xl border border-[#d4af37]/45 bg-black/40 backdrop-blur-md text-[#d4af37] text-xs font-bold tracking-wider hover:bg-[#d4af37]/15 active:scale-95 transition-all duration-200 ease-out focus:outline-none shadow-[0_0_15px_rgba(212,175,55,0.1)] pointer-events-auto flex items-center gap-2"
                title="Mostrar interfaz de chat y logs"
              >
                <Eye className="w-3.5 h-3.5" />
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
                className="p-2.5 rounded-xl border border-[#d4af37]/45 bg-black/40 backdrop-blur-md text-[#d4af37] hover:bg-[#d4af37]/15 active:scale-95 transition-all duration-200 ease-out focus:outline-none shadow-[0_0_15px_rgba(212,175,55,0.1)] pointer-events-auto"
                title="Configuración"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Texts Section (NEON AVANTAR in polished gold with AVANTAR smaller) */}
          <div className="w-full flex flex-col items-center justify-center mt-12 select-none">
            {/* NEON */}
            <h1 
              className="text-4xl sm:text-5xl font-bold tracking-[0.25em] text-center uppercase"
              style={{
                background: 'linear-gradient(135deg, #fffae0 0%, #d4af37 40%, #b38600 70%, #f3e5ab 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                fontFamily: 'Outfit, sans-serif'
              }}
            >
              NEON
            </h1>
            {/* AVANTAR */}
            <h2 
              className="text-[17px] sm:text-[19px] font-semibold tracking-[0.35em] text-center uppercase mt-2.5"
              style={{
                background: 'linear-gradient(135deg, #fffae0 0%, #d4af37 40%, #b38600 70%, #f3e5ab 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))',
                fontFamily: 'Outfit, sans-serif'
              }}
            >
              AVANTAR
            </h2>
          </div>

          {/* Empty flex area to separate content */}
          <div className="flex-1" />

          {/* Bottom Interactive Area */}
          <div className="w-full flex flex-col items-center gap-6 pb-6">
            {/* Call Duration Timer in polished gold digits */}
            <div className="text-center">
              <span 
                className={`text-[34px] font-bold tracking-[0.25em] font-mono transition-all duration-300 select-none ${
                  isCallActive 
                    ? 'animate-pulse' 
                    : 'opacity-40'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #fffae0 0%, #d4af37 40%, #b38600 70%, #f3e5ab 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
                }}
              >
                {formatTimer(isCallActive ? callDuration : 0)}
              </span>
            </div>

            {/* Dynamic Buttons Layout */}
            <div className="flex items-center justify-center gap-12 w-full max-w-xs px-4">
              {/* Left Button: Video Call (Active & functional) */}
              <div className="relative">
                {isCallActive && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-ping pointer-events-none" />
                )}
                <button
                  id="boton_llamar_falso"
                  type="button"
                  onClick={onToggleVoice}
                  className={`w-20 h-20 rounded-full border-2 flex items-center justify-center pointer-events-auto transition-all duration-200 ease-out focus:outline-none shadow-lg active:scale-90 ${
                    isCallActive 
                      ? 'border-emerald-500 text-emerald-400 bg-black/60 shadow-[0_0_25px_rgba(16,185,129,0.4)] active:shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                      : 'border-[#d4af37] text-[#d4af37] bg-black/40 backdrop-blur-md shadow-[0_0_25px_rgba(212,175,55,0.2)] hover:bg-[#d4af37]/15 active:shadow-[0_0_10px_rgba(212,175,55,0.1)]'
                  }`}
                  title="Activar o desactivar videollamada"
                >
                  <Video className="w-8 h-8" />
                </button>
              </div>

              {/* Right Button: Audio Call (Disconnected / Disabled) */}
              <button
                type="button"
                disabled
                className="w-20 h-20 rounded-full border-2 border-[#d4af37]/15 bg-black/20 backdrop-blur-sm flex items-center justify-center text-[#d4af37]/20 cursor-not-allowed focus:outline-none pointer-events-auto shadow-inner"
                title="Llamada de audio no disponible en este momento"
              >
                <Phone className="w-8 h-8 rotate-[135deg]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
