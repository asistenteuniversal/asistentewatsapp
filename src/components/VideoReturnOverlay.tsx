import React, { useState, useEffect } from 'react';

interface VideoReturnOverlayProps {
  isCallActive: boolean;
  activeCallType?: 'video' | 'audio' | null;
  mode?: string;
  onReturn?: () => void;
}

/**
 * MÓDULO LEGO INDEPENDIENTE: VideoReturnOverlay
 * Botón flotante para regresar a la carátula durante la videollamada.
 * - Aparece automáticamente de 2 a 3 segundos después de encender la videollamada.
 * - Posición: Mitad derecha de la pantalla (top: 50%, right: 12px), alineado con ajustes.
 * - Apariencia: Círculo negro puro (#000000) sin marcos ni bordes, flecha oro metálico centrada.
 * - Al presionar: NO cuelga la llamada ni altera el botón de llamada. Regresa a la carátula y se oculta.
 */
export const VideoReturnOverlay: React.FC<VideoReturnOverlayProps> = ({
  isCallActive,
  activeCallType = 'video',
  mode = 'neon',
  onReturn,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    // Detectar si la videollamada está activa o si la interfaz de video/studio está encendida
    const isVideoRunning = (isCallActive && activeCallType === 'video') || mode === 'studio';

    if (isVideoRunning) {
      // Aparece 2.5 a 3 segundos después de que enciende el video
      timer = setTimeout(() => {
        setVisible(true);
      }, 2500);
    } else {
      setVisible(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCallActive, activeCallType, mode]);

  const handleReturn = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // 1. Ocultar el botón de inmediato
    setVisible(false);

    // 2. Comunicar a Android para regresar la carátula al frente sin colgar la llamada
    if ((window as any).AndroidInterface && (window as any).AndroidInterface.showStudio) {
      try {
        (window as any).AndroidInterface.showStudio(false);
      } catch (err) {
        console.error('Error al solicitar retorno en AndroidInterface:', err);
      }
    }

    // 3. Callback opcional de retorno en React
    if (onReturn) {
      onReturn();
    }
  };

  if (!visible) return null;

  return (
    <button
      type=button
      onClick={handleReturn}
      title=Regresar a Carátula Principal
      className=fixed right-3 top-1/2 -translate-y-1/2 z-[999999] w-12 h-12 rounded-full bg-black flex items-center justify-center transition-transform active:scale-90 cursor-pointer select-none shadow-2xl focus:outline-none border-0 outline-none p-0
      style={{
        backgroundColor: '#000000',
        borderRadius: '9999px',
        border: 'none',
        outline: 'none',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.9)',
      }}
    >
      {/* Flecha Oro Ultra Real Metálico en Círculo Negro sin marco */}
      <svg
        width=28
        height=28
        viewBox=0 0 24 24
        fill=none
        xmlns=http://www.w3.org/2000/svg
        className=w-7 h-7 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
      >
        <defs>
          <linearGradient id=goldMetallicArrowVideo x1=0% y1=0% x2=100% y2=100%>
            <stop offset=0% stopColor=#fff5c0 />
            <stop offset=25% stopColor=#f0d060 />
            <stop offset=50% stopColor=#d4af37 />
            <stop offset=75% stopColor=#b8860b />
            <stop offset=100% stopColor=#f0d060 />
          </linearGradient>
        </defs>
        <path
          d=M19 12H5M5 12L12 19M5 12L12 5
          stroke=url(#goldMetallicArrowVideo)
          strokeWidth=3.2
          strokeLinecap=round
          strokeLinejoin=round
        />
      </svg>
    </button>
  );
};
