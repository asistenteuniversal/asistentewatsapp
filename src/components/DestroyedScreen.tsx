import React from 'react';

interface DestroyedScreenProps {
  onReactivate?: () => void;
}

export const DestroyedScreen: React.FC<DestroyedScreenProps> = () => {
  const supportPhone = '525575165733';

  const handleWhatsAppRedirect = () => {
    const text = encodeURIComponent('Hola, deseo volver a contratar el servicio de Asistente Universal y solicitar una nueva clave de activación.');
    window.location.href = 'https://api.whatsapp.com/send?phone=' + supportPhone + '&text=' + text;
  };

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Fondo estético con sutil degradado oscuro */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-black to-black pointer-events-none" />

      {/* Tarjeta Central Elegante */}
      <div className="w-full max-w-sm bg-black/90 border border-[#BF953F]/40 rounded-3xl p-7 flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.9)] relative z-10 space-y-6">
        
        {/* Cabecera */}
        <div className="space-y-1">
          <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-[#FCF6BA] font-mono">
            ASISTENTE INTELIGENTE UNIVERSAL
          </h1>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-2" />
        </div>

        {/* Estado */}
        <div className="space-y-3">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-full bg-black/60">
            SERVICIO FINALIZADO
          </span>
          <p className="text-xs text-gray-300 leading-relaxed font-medium mt-3">
            Tu suscripción y servicio con este asistente han concluido.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Ha sido un verdadero placer haberte acompañado. Si deseas volver a contratar, renovar tu plan o solicitar una nueva clave de acceso, será un gusto atenderte de inmediato.
          </p>
        </div>

        {/* Botón de WhatsApp Estilo Llamada (Negro, Borde Oro, Letras Oro/Blancas) */}
        <div className="w-full pt-2">
          <button
            type="button"
            onClick={handleWhatsAppRedirect}
            className="w-full py-3.5 bg-black hover:bg-zinc-950 active:scale-95 text-white font-extrabold rounded-2xl text-xs uppercase tracking-widest transition-all duration-300 border border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="text-[#FCF6BA]">SOLICITAR POR WHATSAPP</span>
          </button>
        </div>

        {/* Pie de Página */}
        <div className="pt-2 border-t border-zinc-900 w-full">
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-mono font-bold">
            © 2026
          </p>
        </div>

      </div>
    </div>
  );
};
