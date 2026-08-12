import React from 'react';
import { X, Sliders, CheckCircle2, LogOut } from 'lucide-react';

interface ClientSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGoogleLinked: boolean;
  setIsGoogleLinked: (value: boolean) => void;
}

export const ClientSettingsModal: React.FC<ClientSettingsModalProps> = ({
  isOpen,
  onClose,
  isGoogleLinked,
  setIsGoogleLinked,
}) => {
  if (!isOpen) return null;

  const handleLinkGoogle = () => {
    // Si ya está vinculada, no hacer nada
    if (isGoogleLinked) return;

    if ((window as any).AndroidInterface && (window as any).AndroidInterface.showStudio) {
      try {
        (window as any).AndroidInterface.showStudio(true);
        onClose();
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("Esta opción solo está disponible dentro de la aplicación de celular.");
    }
  };

  const handleLogoutGoogle = () => {
    if ((window as any).AndroidInterface && (window as any).AndroidInterface.logoutGoogle) {
      try {
        (window as any).AndroidInterface.logoutGoogle();
        // Sincronizar el estado en caliente para que el botón de arriba cambie de inmediato
        setIsGoogleLinked(false);
        localStorage.setItem('google_logged_in', 'false');
        onClose();
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("Esta opción solo está disponible dentro de la aplicación de celular.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020205]/95 backdrop-blur-2xl flex items-center justify-center p-4 font-sans text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');`}</style>
      
      <div 
        className="w-full max-w-sm bg-[#0a0a0f] border border-[#d4af37]/35 rounded-3xl p-6 shadow-[0_0_40px_rgba(212,175,55,0.15)] space-y-6 relative"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4">
          <div className="flex items-center gap-2.5 text-[#d4af37]">
            <div className="p-1.5 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30">
              <Sliders className="w-4 h-4 text-[#d4af37]" />
            </div>
            <h2 className="font-bold text-sm tracking-widest uppercase">
              Ajustes del Asistente
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/5 text-[#d4af37]/75 hover:text-white transition focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Buttons List */}
        <div className="space-y-4">
          {/* Botón 1: Vincular Cuenta de Google */}
          <button
            onClick={handleLinkGoogle}
            disabled={isGoogleLinked}
            className={`w-full py-3.5 px-4 rounded-xl border font-bold text-xs tracking-wider uppercase transition duration-200 flex items-center justify-center gap-2.5 focus:outline-none
              ${isGoogleLinked 
                ? 'border-emerald-500/30 bg-emerald-950/10 text-emerald-400 cursor-default' 
                : 'border-[#d4af37]/45 bg-[#d4af37]/5 hover:bg-[#d4af37]/15 text-[#d4af37] active:scale-98'
              }`}
          >
            {isGoogleLinked ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Cuenta Vinculada Correctamente
              </>
            ) : (
              <>
                <span className="text-sm">🔑</span>
                Vincular Cuenta de Google
              </>
            )}
          </button>

          {/* Botón 2: Cerrar Sesión de Google */}
          <button
            onClick={handleLogoutGoogle}
            className="w-full py-3.5 px-4 rounded-xl border border-rose-500/30 bg-rose-950/10 hover:bg-rose-950/20 text-rose-300 font-bold text-xs tracking-wider uppercase transition duration-200 flex items-center justify-center gap-2.5 active:scale-98 focus:outline-none"
          >
            <LogOut className="w-4 h-4 text-rose-300" />
            Cerrar Sesión de Google (Cambiar Correo)
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center">
          <p className="text-[9px] text-zinc-500 uppercase tracking-widest leading-normal">
            Neon Studio Corp — Asistente Inteligente
          </p>
        </div>
      </div>
    </div>
  );
};
