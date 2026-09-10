import React, { useState, useEffect } from 'react';

interface BottomVideoReturnOverlayProps {
  isCallActive: boolean;
  mode?: string;
  onReturn?: () => void;
}

/**
 * MÓDULO LEGO INDEPENDIENTE: BottomVideoReturnOverlay
 * Botón flotante centrado abajo en la franja negra inferior durante la videollamada.
 * - Aparece 2.5 a 3 segundos después de iniciarse la videollamada.
 * - Posición: Centrado horizontalmente en la franja negra inferior (bottom: 20px, left: 50%, transform: translateX(-50%)).
 * - Apariencia: Círculo negro puro (#000000) sin marcos ni bordes, con flecha oro metálico centrada.
 * - Función: Regresa a la carátula sin cortar ni alterar la llamada y se oculta de inmediato.
 */
export const BottomVideoReturnOverlay: React.FC<BottomVideoReturnOverlayProps> = ({
  isCallActive,
  mode = 'neon',
  onReturn,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const isVideoRunning = isCallActive || mode === 'studio';

    if (isVideoRunning) {
      timer = setTimeout(() => {
        setVisible(true);
      }, 2500);
    } else {
      setVisible(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCallActive, mode]);

  const handleReturn = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setVisible(false);

    if ((window as any).AndroidInterface && (window as any).AndroidInterface.showStudio) {
      try {
        (window as any).AndroidInterface.showStudio(false);
      } catch (err) {
        console.error('Error al ocultar video en AndroidInterface:', err);
      }
    }

    if (onReturn) {
      onReturn();
    }
  };

  if (!visible) return null;

  return (
    <div
      className=fixed bottom-5 left-1/2 -translate-x-1/2 z-[999999] flex items-center justify-center pointer-events-auto
      style={{
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
      }}
    >
      <button
        type=button
        onClick={handleReturn}
        title=Regresar a Carátula Principal
        className=w-13 h-13 rounded-full bg-black flex items-center justify-center transition-transform active:scale-90 cursor-pointer select-none focus:outline-none border-0 outline-none p-0
        style={{
          width: '52px',
          height: '52px',
          backgroundColor: '#000000',
          borderRadius: '9999px',
          border: 'none',
          outline: 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.95)',
        }}
      >
        {/* Flecha Oro Ultra Real Metálico en Círculo Negro */}
        <svg
          width=28
          height=28
          viewBox=0 0 24 24
          fill=none
          xmlns=http://www.w3.org/2000/svg
          className=w-7 h-7 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
        >
          <defs>
            <linearGradient id=goldMetallicBottomRet x1=0% y1=0% x2=100% y2=100%>
              <stop offset=0% stopColor=#fff5c0 />
              <stop offset=25% stopColor=#f0d060 />
              <stop offset=50% stopColor=#d4af37 />
              <stop offset=75% stopColor=#b8860b />
              <stop offset=100% stopColor=#f0d060 />
            </linearGradient>
          </defs>
          <path
            d=M19 12H5M5 12L12 19M5 12L12 5
            stroke=url(#goldMetallicBottomRet)
            strokeWidth=3.2
            strokeLinecap=round
            strokeLinejoin=round
          />
        </svg>
      </button>
    </div>
  );
};
