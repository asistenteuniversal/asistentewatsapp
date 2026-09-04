import React from 'react';

// =========================================================================
// 🧱 BLOQUE LEGO INDEPENDIENTE: AVISO DE FALLA DE CONEXIÓN
// =========================================================================
// Este componente es 100% autónomo. Se puede retirar o desactivar en cualquier
// momento cambiando la propiedad 'visible' sin afectar la lógica de llamadas.
// =========================================================================

interface ConnectionErrorBannerProps {
  visible?: boolean;
  onDismiss?: () => void;
  errorMessage?: string;
}

export const ConnectionErrorBanner: React.FC<ConnectionErrorBannerProps> = ({
  visible = true,
  onDismiss,
  errorMessage = 'FALLA DE CONEXIÓN'
}) => {
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
        className="py-2.5 px-6 rounded-full font-black text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center focus:outline-none active:scale-95 border cursor-pointer animate-pulse"
        style={{
          backgroundColor: '#000000',
          borderColor: '#ef4444', // Borde rojo brillante estilo botón de llamada
          boxShadow: '0 0 22px rgba(239, 68, 68, 0.7), inset 0 0 10px rgba(239, 68, 68, 0.3)',
          fontFamily: "'Outfit', sans-serif"
        }}
        title="Falla de conexión detectada"
      >
        <span style={goldTextStyle} className="drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
          {errorMessage}
        </span>
      </button>
    </div>
  );
};
