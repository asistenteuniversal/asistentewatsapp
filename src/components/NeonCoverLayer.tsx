import React from 'react';
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
      {/* Smartphone Chassis using the clean gold image cover as background directly, spanning 100% of screen */}
      <div 
        className="relative z-10 w-full h-full flex flex-col justify-between overflow-hidden"
        style={{
          backgroundImage: `url(${neonPhoneCover})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Transparent overlay button for 'MOSTRAR INTERFAZ' (Top-Left of the cover image) */}
        {onShowStudio && (
          <button
            type="button"
            onClick={onShowStudio}
            className="absolute top-[6.5%] left-[8%] w-[32%] h-[5%] bg-transparent border-none cursor-pointer z-30 focus:outline-none"
            title="Mostrar interfaz de Google AI Studio"
          />
        )}

        {/* Transparent overlay button for Settings Gear (Top-Right of the cover image) */}
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="absolute top-[6.5%] right-[8%] w-[12%] h-[5%] bg-transparent border-none cursor-pointer z-30 focus:outline-none"
            title="Abrir Configuración"
          />
        )}

        {/* Gold Monospace Timer overlay positioned exactly over the 00:00 printed on the background image */}
        <div className="absolute bottom-[20.8%] left-1/2 transform -translate-x-1/2 z-20">
          <span className="text-[26px] font-bold tracking-widest text-[#d4af37] font-mono select-none pointer-events-none">
            {formatTimer(isCallActive ? callDuration : 0)}
          </span>
        </div>

        {/* Transparent overlay button for Video Call (Bottom-Left of the cover image) */}
        <button
          id="boton_llamar_falso"
          type="button"
          onClick={onToggleVoice}
          className="absolute bottom-[10.5%] left-[23%] w-[21%] h-[9.5%] rounded-full bg-transparent border-none cursor-pointer z-30 focus:outline-none"
          title="Tocar para iniciar/detener llamada con Google AI Studio"
        />

        {/* Pulsing ring indicator centered on the video button when call is active */}
        {isCallActive && (
          <div className="absolute bottom-[10.5%] left-[23%] w-[21%] h-[9.5%] rounded-full border-2 border-emerald-400 animate-ping pointer-events-none z-20" />
        )}
      </div>
    </div>
  );
};
