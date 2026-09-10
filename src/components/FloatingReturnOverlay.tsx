import React from 'react';

interface FloatingReturnOverlayProps {
  visible: boolean;
  onReturn: () => void;
}

export const FloatingReturnOverlay: React.FC<FloatingReturnOverlayProps> = ({
  visible,
  onReturn,
}) => {
  if (!visible) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onReturn();
      }}
      title="Regresar a Carátula Principal"
      className="fixed right-3 top-1/2 -translate-y-1/2 z-[60] w-12 h-12 rounded-full bg-black flex items-center justify-center transition-transform active:scale-90 cursor-pointer select-none shadow-2xl focus:outline-none border-0 outline-none p-0"
      style={{
        backgroundColor: '#000000',
        borderRadius: '9999px',
        border: 'none',
        outline: 'none',
      }}
    >
      {/* Flecha Oro Ultra Real Metálico en Círculo Negro sin marco */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
      >
        <defs>
          <linearGradient id="goldMetallicArrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff5c0" />
            <stop offset="25%" stopColor="#f0d060" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="75%" stopColor="#b8860b" />
            <stop offset="100%" stopColor="#f0d060" />
          </linearGradient>
        </defs>
        <path
          d="M19 12H5M5 12L12 19M5 12L12 5"
          stroke="url(#goldMetallicArrowGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};