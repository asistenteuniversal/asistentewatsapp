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
    <div className="w-full h-full bg-[#020205] flex items-center justify-center p-2 sm:p-4 select-none overflow-hidden relative font-sans">
      {/* Background Cyber Glow & Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#020205_100%)] z-0" />

      {/* Subtle Grid Pattern overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 243, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Ambient Data Stream Decorative Lines (from theme) */}
      <div className="absolute top-12 right-12 w-48 space-y-1 opacity-20 pointer-events-none hidden md:block">
        <div className="h-[1px] w-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
        <div className="h-[1px] w-3/4 bg-cyan-500 ml-auto"></div>
        <div className="h-[1px] w-1/2 bg-cyan-500 ml-auto"></div>
      </div>
      
      <div className="absolute bottom-12 left-12 w-48 space-y-1 opacity-20 rotate-180 pointer-events-none hidden md:block">
        <div className="h-[1px] w-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
        <div className="h-[1px] w-3/4 bg-cyan-500 ml-auto"></div>
        <div className="h-[1px] w-1/2 bg-cyan-500 ml-auto"></div>
      </div>

      {/* Smartphone Chassis using the clean gold image cover as background directly */}
      <div 
        className="relative z-10 w-full max-w-[420px] h-[92vh] max-h-[850px] shadow-[0_0_100px_rgba(0,243,255,0.18)] flex flex-col justify-between overflow-hidden rounded-[50px] border-[6px] border-[#1a1a24]"
        style={{
          backgroundImage: `url(${neonPhoneCover})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Invisible notch/top layout spacer to keep alignment */}
        <div className="h-16 w-full pointer-events-none" />

        {/* Center spacing with code rain layer overlay */}
        <div className="flex-1 w-full my-2 relative flex items-center justify-center overflow-hidden pointer-events-none">
          <div className="absolute inset-0 pointer-events-none opacity-10 flex justify-between text-[9px] font-mono text-cyan-400 overflow-hidden leading-tight p-4">
            <div className="animate-pulse">SYSTEM.CORE.LIVE<br/>01010101<br/>10101010</div>
            <div className="animate-pulse delay-100">AES-256<br/>00011100<br/>10101010</div>
            <div className="animate-pulse delay-200">LAYER_1_ACTIVE<br/>11110000<br/>01011010</div>
          </div>
        </div>

        {/* Call Status & Timer Readout (Dynamic Overlay on top of background) */}
        <div className="px-6 text-center z-20 my-1">
          <div className="p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-1">
            <div className="flex items-center justify-center gap-2 text-cyan-300 font-mono text-xs tracking-wider">
              <span className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-cyan-400 animate-ping shadow-[0_0_10px_#22d3ee]' : 'bg-zinc-600'}`} />
              <span className="font-sans font-medium uppercase tracking-wider text-[11px] text-zinc-300">
                {isCallActive ? 'Llamada activa...' : 'Esperando interacción'}
              </span>
              <span className="ml-2 font-bold text-cyan-200 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                {formatTimer(callDuration > 0 ? callDuration : 45)}
              </span>
            </div>

            {/* Live Transcript / Mic Activity Display */}
            <div className="h-5 flex items-center justify-center">
              {isSpeaking ? (
                <p className="text-[11px] text-cyan-300 font-mono animate-pulse truncate max-w-[260px]">
                  [Voz IA Inteligente hablando...]
                </p>
              ) : isListening ? (
                <p className="text-[11px] text-emerald-400 font-mono animate-pulse truncate max-w-[260px]">
                  {transcript ? `"${transcript}"` : '[Escuchando tu voz...]'}
                </p>
              ) : (
                <p className="text-[10px] text-zinc-400 font-mono">
                  Toca el botón central para conectar voz
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Call Button Area with Frosted Rings and invisible trigger */}
        <div className="pb-16 pt-2 flex flex-col items-center justify-center relative z-20">
          <div className="relative flex items-center justify-center">
            {/* Pulsing Ring effect when active */}
            {isCallActive && (
              <div className="absolute w-32 h-32 rounded-full border border-cyan-400/50 animate-ping pointer-events-none shadow-[0_0_30px_rgba(6,182,212,0.4)]" />
            )}
            
            {/* CAPA 3: boton_llamar_falso (invisible overlay button aligned over the cover's button) */}
            <button
              id="boton_llamar_falso"
              type="button"
              onClick={onToggleVoice}
              className="w-32 h-32 rounded-full bg-transparent border-none cursor-pointer z-30 focus:outline-none"
              title="Tocar para iniciar/detener llamada con Google AI Studio"
            />
          </div>

          <span className="mt-3 text-[10px] font-mono text-zinc-400 tracking-[0.2em] uppercase font-bold">
            {isCallActive ? 'DESCONECTAR' : 'INICIAR VOZ OCULTA'}
          </span>
        </div>

        {/* Bottom Home Line Bar */}
        <div className="mb-2 mx-auto w-32 h-1 bg-white/20 rounded-full" />
      </div>
    </div>
  );
};
