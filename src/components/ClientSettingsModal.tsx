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
    <div className="fixed inset-0 z-50 bg-[#020205]/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 font-sans text-white">
      <style>{@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');}</style>
      
      <div 
        className="w-full max-w-md bg-[#0a0a0f] border border-[#d4af37]/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(212,175,55,0.2)] space-y-4 relative max-h-[96vh] overflow-y-auto"
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

        {/* Buttons List con el nuevo orden */}
        <div className="space-y-3">
          {/* 1. Botón: Estado de Cuenta Google */}
          {activeLinkedState ? (
            <button
              disabled
              className="w-full py-3.5 px-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 focus:outline-none cursor-default shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              Cuenta Vinculada Correctamente
            </button>
          ) : (
            <button
              onClick={handleLinkGoogle}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition duration-200 flex items-center justify-center focus:outline-none active:scale-98 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              style={{
                background: 'linear-gradient(135deg, #fff5c0 0%, #f0d060 20%, #d4af37 45%, #b8860b 70%, #f0d060 85%, #fff5c0 100%)',
                color: '#000000',
                border: 'none',
              }}
            >
              INGRESA CUENTA DE GMAIL
            </button>
          )}

          {/* 2. Botón: Cerrar Sesión de Gmail (PRESIONA PARA CAMBIAR TU CORREO) */}
          <button
            onClick={handleLogoutGoogle}
            className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-500 border-2 border-red-400 text-white font-black text-xs sm:text-[13px] tracking-wider uppercase transition duration-200 flex items-center justify-center gap-2 active:scale-98 focus:outline-none cursor-pointer shadow-[0_0_25px_rgba(220,38,38,0.45)]"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            CERRAR SESIÓN DE GMAIL (PRESIONA PARA CAMBIAR TU CORREO)
          </button>

          {/* 3. Botón: Selector de Voz Espejo (Hombre/Mujer) */}
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
        </div>

        {/* ── CUADRO 4: SOPORTE Y ASISTENCIA (VERDE WHATSAPP TOTAL, CONTORNO GRUESO Y MÁS GRANDE) ── */}
        <div className="rounded-3xl border-2 border-[#25D366] bg-[#075E54]/90 overflow-hidden shadow-[0_0_35px_rgba(37,211,102,0.3)] font-sans mt-3">
          {/* Cabecera Verde Oficial */}
          <div className="bg-[#128C7E] px-4 py-3 flex items-center justify-between border-b border-[#25D366]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center shadow-md">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-white leading-tight">Soporte y Asistencia</p>
              </div>
            </div>
            
            {/* Insignia EN CONSTRUCCIÓN en Rojo Intenso, Letra Blanca Grande */}
            <span className="text-xs sm:text-sm uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-red-600 text-white border-2 border-white/40 font-black shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse">
              EN CONSTRUCCIÓN
            </span>
          </div>

          {/* Cuerpo del Chat Verde con Letras Claras */}
          <div className="p-4 sm:p-5 space-y-3 bg-[#075E54]">
            {/* Mensaje de Bienvenida */}
            <div className="flex items-start gap-2">
              <div className="bg-[#128C7E] text-white rounded-2xl rounded-tl-none p-3.5 text-xs sm:text-sm leading-relaxed max-w-[92%] border border-white/20 shadow-md">
                <p className="font-semibold text-white">Hola 👋 ¿En qué podemos ayudarte? Escribe tu duda o mensaje de asistencia:</p>
                <span className="text-[10px] text-emerald-100 block text-right mt-1.5 font-mono">Hoy</span>
              </div>
            </div>

            {/* Aviso de confirmación de envío */}
            {isSent && (
              <div className="bg-[#25D366] text-black rounded-2xl rounded-tr-none p-3.5 text-xs sm:text-sm leading-relaxed max-w-[92%] ml-auto border border-white/40 shadow-xl font-bold animate-pulse">
                <p>✅ ¡Mensaje recibido! Te responderemos a la brevedad.</p>
                <span className="text-[10px] text-zinc-900 block text-right mt-1.5 font-mono">Enviado ✓✓</span>
              </div>
            )}

            {/* Formulario de Entrada */}
            <form onSubmit={handleSendSupport} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Escribe un mensaje aquí..."
                className="flex-1 bg-[#128C7E] border-2 border-white/30 rounded-2xl px-4 py-3 text-white placeholder-emerald-100 text-xs sm:text-sm outline-none focus:border-white transition font-sans shadow-inner"
              />
              <button
                type="submit"
                disabled={!supportMessage.trim()}
                className="p-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-black disabled:opacity-40 disabled:pointer-events-none transition shadow-[0_0_20px_rgba(37,211,102,0.5)] cursor-pointer flex items-center justify-center border border-white/20"
              >
                <Send className="w-5 h-5 fill-black" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
