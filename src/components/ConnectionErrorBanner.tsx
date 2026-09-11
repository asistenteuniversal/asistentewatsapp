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
  // Auto-apagado inteligente:
  // - Límite de sesión ("30 MIN"): 30 segundos.
  // - Intento 1 y 2 ("VUÉLVELO A INTENTAR"): 5 segundos.
  // - Intento 3+ ("INTÉNTALO MÁS TARDE"): 1 minuto (60 segundos).
  // En cualquier momento, si el usuario lo presiona con el dedo, se apaga de inmediato.
  useEffect(() => {
    if (visible && onDismiss) {
      const is30MinLimit = errorMessage.includes('30 MIN');
      const isThirdAttempt = errorMessage.includes('INTÉNTALO MÁS TARDE');
      const duration = is30MinLimit ? 30000 : (isThirdAttempt ? 60000 : 5000);
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss, errorMessage]);

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
        className="py-3 px-6 sm:px-8 rounded-full font-black text-[11px] sm:text-xs md:text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center focus:outline-none active:scale-95 border cursor-pointer backdrop-blur-md whitespace-nowrap shadow-2xl hover:bg-black/95 max-w-[94vw] text-center"
        style={{
          backgroundColor: 'rgba(5, 5, 8, 0.95)',
          borderColor: 'rgba(212, 175, 55, 0.7)', // Contorno fino oro metálico pulido estilo botones de llamada
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.35), inset 0 0 12px rgba(0, 0, 0, 0.9)',
          fontFamily: "'Outfit', sans-serif"
        }}
        title="Toca para cerrar"
      >
        <span style={goldTextStyle} className="drop-shadow-[0_0_10px_rgba(212,175,55,0.6)] select-none">
          {errorMessage}
        </span>
      </button>
    </div>
  );
};
