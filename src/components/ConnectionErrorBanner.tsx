import React, { useEffect } from 'react';

// =========================================================================
// 🧱 BLOQUE LEGO INDEPENDIENTE: AVISO DE FALLA DE CONEXIÓN
// =========================================================================
// Este componente es 100% autónomo. Se auto-apaga a los 5 segundos.
// No tiene iconos invasivos y posee el diseño fino estilo botón de llamadas.
// =========================================================================

interface ConnectionErrorBannerProps {
  visible?: boolean;
  onDismiss?: () => void;
  errorMessage?: string;
}

export const ConnectionErrorBanner: React.FC<ConnectionErrorBannerProps> = ({
  visible = true,
  onDismiss,
  errorMessage = 'FALLÓ CONEXIÓN, VUÉLVELO A INTENTAR'
}) => {
  // Auto-apagado exacto a los 5 segundos de activarse
  useEffect(() => {
    if (visible && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  if (!visible) return null;

  const goldGradient = 'linear-gradient(135deg, #fff5c0 0%, #f0d060 20%, #d4af37 45%, #b8860b 70%, #f0d060 85%, #fff5c0 100%)';
  const goldTextStyle: React.CSSProperties = {
    background: goldGradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))',
    fontFamily: "'Outfit', sans-serif",
  };

  return (
    <div className="absolute bottom-[31%] left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      <button
        type="button"
        onClick={onDismiss}
        className="py-2.5 px-6 rounded-full font-black text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center focus:outline-none active:scale-95 border cursor-pointer backdrop-blur-md whitespace-nowrap shadow-lg hover:bg-black/90 animate-pulse"
        style={{
          backgroundColor: 'rgba(5, 5, 8, 0.9)',
          borderColor: 'rgba(212, 175, 55, 0.55)', // Contorno fino oro metálico pulido estilo botones de llamada
          boxShadow: '0 0 16px rgba(212, 175, 55, 0.25), inset 0 0 10px rgba(0, 0, 0, 0.8)',
          fontFamily: "'Outfit', sans-serif"
        }}
        title="Toca para cerrar"
      >
        <span style={goldTextStyle} className="drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
          {errorMessage}
        </span>
      </button>
    </div>
  );
};
