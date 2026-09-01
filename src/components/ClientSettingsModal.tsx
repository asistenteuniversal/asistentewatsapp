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

    // Simulación de envío exitoso y guardado local
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
    <div className="fixed inset-0 z-50 bg-[#020205]/95 backdrop-blur-2xl flex items-center justify-center p-4 font-sans text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');`}</style>
      
      <div 
        className="w-full max-w-sm bg-[#0a0a0f] border border-[#d4af37]/35 rounded-3xl p-5 shadow-[0_0_40px_rgba(212,175,55,0.15)] space-y-4 relative max-h-[92vh] overflow-y-auto"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Header - Sin icono, título limpio en oro */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-3">
          <h2 className="font-extrabold text-sm tracking-widest uppercase text-[#d4af37]">
            Ajustes y Asistencia
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/5 text-[#d4af37]/75 hover:text-white transition focus:outline-none cursor-pointer"
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
              className="w-full py-3 px-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/10 text-emerald-400 font-bold text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 focus:outline-none cursor-default"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Cuenta Vinculada Correctamente
            </button>
          ) : (
            <button
              onClick={handleLinkGoogle}
              className="w-full py-3 px-3.5 rounded-xl font-bold text-[11px] tracking-wider uppercase transition duration-200 flex items-center justify-center focus:outline-none active:scale-98 cursor-pointer"
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
            className={w-full py-2.5 px-3 font-black rounded-xl text-[10px] sm:text-[11px] uppercase tracking-wider transition duration-300 border shadow-lg cursor-pointer flex items-center justify-center text-center }
          >
            {settings.voiceMaleEnabled
              ? '🟢 VOZ DE HOMBRE — PRESIONAR PARA CAMBIAR A VOZ DE MUJER'
              : '🌸 VOZ DE MUJER — PRESIONAR PARA CAMBIAR A VOZ DE HOMBRE'}
          </button>

          {/* Botón 3: Cerrar Sesión de Google */}
          <button
            onClick={handleLogoutGoogle}
            className="w-full py-2.5 px-3.5 rounded-xl border border-rose-500/30 bg-rose-950/10 hover:bg-rose-950/20 text-rose-300 font-bold text-[10px] sm:text-[11px] tracking-wider uppercase transition duration-200 flex items-center justify-center gap-2 active:scale-98 focus:outline-none cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-300" />
            Cerrar Sesión de Google (Cambiar Correo)
          </button>
        </div>

        {/* ── CUADRO TIPO WHATSAPP MINIATURA: ATENCIÓN AL CLIENTE ── */}
        <div className="rounded-2xl border border-[#25D366]/30 bg-[#0b141a] overflow-hidden shadow-[0_0_25px_rgba(37,211,102,0.15)] font-sans">
          {/* Cabecera estilo WhatsApp */}
          <div className="bg-[#1f2c34] px-3.5 py-2.5 flex items-center justify-between border-b border-[#25D366]/20">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#25D366]/20 border border-[#25D366]/50 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-[#25D366]" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white leading-tight">Soporte y Asistencia</p>
                <p className="text-[9px] text-[#25D366] font-medium leading-tight">En línea</p>
              </div>
            </div>
            <span className="text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 font-bold">
              En Construcción
            </span>
          </div>

          {/* Cuerpo del Chat Miniatura */}
          <div className="p-3 space-y-2.5 bg-[#0b141a] bg-opacity-95">
            {/* Mensaje recibido de bienvenida */}
            <div className="flex items-start gap-1.5">
              <div className="bg-[#1f2c34] text-zinc-200 rounded-2xl rounded-tl-none p-2 text-[10px] leading-relaxed max-w-[85%] border border-white/5 shadow-sm">
                <p>Hola 👋 ¿En qué podemos ayudarte? Escribe tu duda o mensaje de asistencia:</p>
                <span className="text-[7px] text-zinc-500 block text-right mt-1">Hoy</span>
              </div>
            </div>

            {/* Aviso de confirmación de envío */}
            {isSent && (
              <div className="bg-[#005c4b] text-emerald-100 rounded-2xl rounded-tr-none p-2 text-[10px] leading-relaxed max-w-[85%] ml-auto border border-emerald-400/20 shadow-sm animate-pulse">
                <p>✅ ¡Mensaje recibido! Te responderemos a la brevedad.</p>
                <span className="text-[7px] text-emerald-300 block text-right mt-1">Enviado ✓✓</span>
              </div>
            )}

            {/* Formulario de Entrada */}
            <form onSubmit={handleSendSupport} className="pt-1 flex items-center gap-1.5">
              <input
                type="text"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Escribe un mensaje aquí..."
                className="flex-1 bg-[#2a3942] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-400 text-[10px] outline-none focus:border-[#25D366]/70 transition font-sans"
              />
              <button
                type="submit"
                disabled={!supportMessage.trim()}
                className="p-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-black disabled:opacity-40 disabled:pointer-events-none transition shadow-[0_0_10px_rgba(37,211,102,0.3)] cursor-pointer flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5 fill-black" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
