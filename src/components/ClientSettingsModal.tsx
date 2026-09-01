import React, { useState } from 'react';
import { X, CheckCircle2, LogOut, Send, Bot } from 'lucide-react';
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
  const [supportMessage, setSupportMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

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

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    try {
      const existing = JSON.parse(localStorage.getItem('pending_support_tickets') || '[]');
      existing.push({
        date: new Date().toISOString(),
        text: supportMessage.trim()
      });
      localStorage.setItem('pending_support_tickets', JSON.stringify(existing));
    } catch (err) {
      console.error(err);
    }

    setIsSent(true);
    setTimeout(() => {
      setSupportMessage('');
      setIsSent(false);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020205]/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 font-sans text-white">
      <style>{@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');}</style>
      
      <div 
        className="w-full max-w-md bg-[#0a0a0f] border border-[#d4af37]/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(212,175,55,0.2)] space-y-4 relative max-h-[95vh] overflow-y-auto"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Header - Título limpio en oro */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/25 pb-3">
          <h2 className="font-extrabold text-sm sm:text-base tracking-widest uppercase text-[#d4af37]">
            Ajustes y Asistencia
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-[#d4af37] hover:text-white transition focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buttons List */}
        <div className="space-y-3">
          {/* Botón 1: Estado de Cuenta Google */}
          {activeLinkedState ? (
            <button
              disabled
              className="w-full py-3.5 px-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 text-emerald-400 font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 focus:outline-none cursor-default"
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              Cuenta Vinculada Correctamente
            </button>
          ) : (
            <button
              onClick={handleLinkGoogle}
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm tracking-wider uppercase transition duration-200 flex items-center justify-center focus:outline-none active:scale-98 cursor-pointer"
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
            className={w-full py-3 px-3.5 font-black rounded-2xl text-[11px] sm:text-xs uppercase tracking-wider transition duration-300 border shadow-lg cursor-pointer flex items-center justify-center text-center }
          >
            {settings.voiceMaleEnabled
              ? '🟢 VOZ DE HOMBRE — PRESIONAR PARA CAMBIAR A VOZ DE MUJER'
              : '🌸 VOZ DE MUJER — PRESIONAR PARA CAMBIAR A VOZ DE HOMBRE'}
          </button>

          {/* Botón 3: Cerrar Sesión de Google (Más grande, más rojo y letras blancas) */}
          <button
            onClick={handleLogoutGoogle}
            className="w-full py-3.5 px-4 rounded-2xl bg-red-600/90 hover:bg-red-600 border border-red-500 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase transition duration-200 flex items-center justify-center gap-2.5 active:scale-98 focus:outline-none cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.35)]"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            Cerrar Sesión de Google (Cambiar Correo)
          </button>
        </div>

        {/* ── CUADRO TIPO WHATSAPP REAL AMPLIO: ATENCIÓN AL CLIENTE ── */}
        <div className="rounded-2xl border border-[#25D366]/40 bg-[#0b141a] overflow-hidden shadow-[0_0_30px_rgba(37,211,102,0.2)] font-sans mt-2">
          {/* Cabecera estilo WhatsApp con insignia EN CONSTRUCCIÓN en rojo grande */}
          <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-[#25D366]/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#25D366]/20 border border-[#25D366]/60 flex items-center justify-center shadow-[0_0_10px_rgba(37,211,102,0.3)]">
                <Bot className="w-5 h-5 text-[#25D366]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">Soporte y Asistencia</p>
              </div>
            </div>
            
            {/* EN CONSTRUCCIÓN en Rojo y Letra más grande */}
            <span className="text-[10px] sm:text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-red-950/60 text-red-400 border border-red-500/60 font-black shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse">
              En Construcción
            </span>
          </div>

          {/* Cuerpo del Chat Amplio y fondo WhatsApp */}
          <div className="p-4 space-y-3 bg-[#0b141a]">
            {/* Mensaje recibido de bienvenida con letras más grandes y claras */}
            <div className="flex items-start gap-2">
              <div className="bg-[#1f2c34] text-zinc-100 rounded-2xl rounded-tl-none p-3 text-xs sm:text-sm leading-relaxed max-w-[90%] border border-white/10 shadow-md">
                <p className="font-normal text-white">Hola 👋 ¿En qué podemos ayudarte? Escribe tu duda o mensaje de asistencia:</p>
                <span className="text-[9px] text-zinc-400 block text-right mt-1.5 font-mono">Hoy</span>
              </div>
            </div>

            {/* Aviso de confirmación de envío */}
            {isSent && (
              <div className="bg-[#005c4b] text-white rounded-2xl rounded-tr-none p-3 text-xs sm:text-sm leading-relaxed max-w-[90%] ml-auto border border-emerald-400/40 shadow-lg animate-pulse">
                <p className="font-semibold">✅ ¡Mensaje recibido! Te responderemos a la brevedad.</p>
                <span className="text-[9px] text-emerald-200 block text-right mt-1.5 font-mono">Enviado ✓✓</span>
              </div>
            )}

            {/* Formulario de Entrada Amplio */}
            <form onSubmit={handleSendSupport} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Escribe un mensaje aquí..."
                className="flex-1 bg-[#2a3942] border border-white/15 rounded-2xl px-4 py-3 text-white placeholder-zinc-400 text-xs sm:text-sm outline-none focus:border-[#25D366] transition font-sans shadow-inner"
              />
              <button
                type="submit"
                disabled={!supportMessage.trim()}
                className="p-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-black disabled:opacity-40 disabled:pointer-events-none transition shadow-[0_0_15px_rgba(37,211,102,0.4)] cursor-pointer flex items-center justify-center"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
