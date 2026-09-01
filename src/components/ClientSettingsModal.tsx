import React from 'react';
import { X, Sliders, CheckCircle2, LogOut, MessageCircle } from 'lucide-react';
import { AppSettings } from '../types';

interface ClientSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGoogleLinked: boolean;
  setIsGoogleLinked: (value: boolean) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const ClientSettingsModal: React.FC<ClientSettingsModalProps> = ({
  isOpen,
  onClose,
  isGoogleLinked,
  setIsGoogleLinked,
  settings,
  setSettings,
}) => {
  if (!isOpen) return null;

  // Consultar directamente a las cookies reales de la APK de Java en caliente al abrir el modal
  const activeLinkedState = (window as any).AndroidInterface && (window as any).AndroidInterface.isGoogleSessionActive
    ? (window as any).AndroidInterface.isGoogleSessionActive()
    : isGoogleLinked;

  const handleLinkGoogle = () => {
    if (activeLinkedState) return;

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

  const handleOpenWhatsApp = () => {
    const phone = '525575165733';
    const message = 'Hola, necesito asistencia con mi Asistente Inteligente.';

    if ((window as any).AndroidInterface && (window as any).AndroidInterface.openWhatsApp) {
      try {
        (window as any).AndroidInterface.openWhatsApp(phone, message);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // Fallback estándar en caso de navegador web
    window.open(https://api.whatsapp.com/send?phone=&text=, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020205]/95 backdrop-blur-2xl flex items-center justify-center p-4 font-sans text-white">
      <style>{@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');}</style>
      
      <div 
        className="w-full max-w-sm bg-[#0a0a0f] border border-[#d4af37]/35 rounded-3xl p-6 shadow-[0_0_40px_rgba(212,175,55,0.15)] space-y-5 relative"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4">
          <div className="flex items-center gap-2.5 text-[#d4af37]">
            <div className="p-1.5 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30">
              <Sliders className="w-4 h-4 text-[#d4af37]" />
            </div>
            <h2 className="font-bold text-sm tracking-widest uppercase">
              Ajustes y Asistencia
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/5 text-[#d4af37]/75 hover:text-white transition focus:outline-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Buttons List */}
        <div className="space-y-3.5">
          {/* Botón 1: Estado de Cuenta Google */}
          {activeLinkedState ? (
            <button
              disabled
              className="w-full py-3.5 px-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 text-emerald-400 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 focus:outline-none cursor-default"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Cuenta Vinculada Correctamente
            </button>
          ) : (
            <button
              onClick={handleLinkGoogle}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition duration-200 flex items-center justify-center focus:outline-none active:scale-98 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #fff5c0 0%, #f0d060 20%, #d4af37 45%, #b8860b 70%, #f0d060 85%, #fff5c0 100%)',
                color: '#000000',
                border: 'none',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)'
              }}
            >
              INGRESA CUENTA DE GMAIL
            </button>
          )}

          {/* Botón 2: Selector de Voz Espejo (Hombre/Mujer) */}
          <button
            type="button"
            onClick={() => {
              const nextVal = !settings.voiceMaleEnabled;
              setSettings((prev) => ({
                ...prev,
                voiceMaleEnabled: nextVal
              }));
              if ((window as any).AndroidInterface && (window as any).AndroidInterface.updateVoiceOption) {
                try {
                  (window as any).AndroidInterface.updateVoiceOption(nextVal);
                } catch (e) {
                  console.error(e);
                }
              }
            }}
            className={w-full py-3 px-3.5 font-black rounded-xl text-[10px] sm:text-[11px] uppercase tracking-wider transition duration-300 border shadow-lg cursor-pointer flex items-center justify-center text-center }
          >
            {settings.voiceMaleEnabled
              ? '🟢 VOZ DE HOMBRE — PRESIONAR PARA CAMBIAR A VOZ DE MUJER'
              : '🌸 VOZ DE MUJER — PRESIONAR PARA CAMBIAR A VOZ DE HOMBRE'}
          </button>

          {/* Botón 3: Cerrar Sesión de Google */}
          <button
            onClick={handleLogoutGoogle}
            className="w-full py-3.5 px-4 rounded-xl border border-rose-500/30 bg-rose-950/10 hover:bg-rose-950/20 text-rose-300 font-bold text-xs tracking-wider uppercase transition duration-200 flex items-center justify-center gap-2.5 active:scale-98 focus:outline-none cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-300" />
            Cerrar Sesión de Google (Cambiar Correo)
          </button>

          {/* Botón 4: WhatsApp al final */}
          <button
            onClick={handleOpenWhatsApp}
            className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-black font-extrabold text-xs tracking-wider uppercase transition duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.35)] cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-black fill-black" />
            Atención por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
