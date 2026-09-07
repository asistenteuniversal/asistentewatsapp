import React from 'react';
import { X, MessageSquare, BookOpen, Mic, Sparkles, SlidersHorizontal, ShieldCheck, ChevronRight, Layers, Globe } from 'lucide-react';

interface AppsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
  onOpenClientSettings?: () => void;
}

export const AppsHubModal: React.FC<AppsHubModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenClientSettings,
}) => {
  if (!isOpen) return null;

  // Estilos maestros de oro metálico pulido Neoavania
  const goldGradientText: React.CSSProperties = {
    background: 'linear-gradient(135deg, #fff5c0 0%, #f0d060 25%, #d4af37 50%, #b8860b 75%, #fff5c0 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.3))',
  };

  const handleOpenChrome = () => {
    onClose();
    if ((window as any).AndroidInterface && (window as any).AndroidInterface.showChromeView) {
      try {
        (window as any).AndroidInterface.showChromeView(true);
      } catch (e) {
        console.error('Error abriendo Chrome a pantalla completa:', e);
      }
    } else {
      window.open('https://www.google.com', '_blank');
    }
  };

  const handleOpenWhatsApp = () => {
    onClose();
    if ((window as any).AndroidInterface && (window as any).AndroidInterface.showWhatsAppView) {
      try {
        (window as any).AndroidInterface.showWhatsAppView(true);
      } catch (e) {
        console.error('Error abriendo WhatsApp a pantalla completa:', e);
      }
    } else {
      console.log('Abriendo WhatsApp en vista previa...');
    }
  };

  const handleSelectVoiceAgent = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        fontFamily: "'Outfit', sans-serif",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[92vh] flex flex-col rounded-3xl overflow-hidden relative select-none"
        style={{
          backgroundColor: '#030305',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 0 40px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255, 245, 192, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Resplandor superior sutil */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(212, 175, 55, 0.3) 0%, transparent 75%)',
          }}
        />

        {/* ── CABECERA DEL MODAL ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(0,0,0,0.8) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.5)',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.25)',
              }}
            >
              <Layers className="w-5 h-5 text-[#f0d060]" />
            </div>
            <div>
              <h3 
                style={goldGradientText}
                className="text-lg font-black tracking-wider uppercase leading-none"
              >
                NEOAVAN
              </h3>
              <p className="text-[10px] font-mono tracking-widest text-zinc-400 mt-0.5">
                MULTIAPP • HUB DE MÓDULOS
              </p>
            </div>
          </div>

          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#f0d060',
            }}
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── CONTENEDOR DE TARJETAS (SCROLL) ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3.5 custom-scrollbar">

          {/* TARJETA 1: WHATSAPP PRO */}
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full text-left p-4 rounded-2xl transition-all duration-200 group active:scale-[0.98] relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(16, 25, 20, 0.9) 0%, rgba(5, 10, 8, 0.95) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7), 0 0 15px rgba(34, 197, 94, 0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(10, 30, 15, 0.8) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.5)',
                  }}
                >
                  <MessageSquare className="w-6 h-6 text-[#4ade80]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-base tracking-wide group-hover:text-[#4ade80] transition-colors">
                      WhatsApp Pro
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40">
                      PANTALLA COMPLETA
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-snug">
                    Bandeja oficial, chats y respuestas inteligentes en pantalla completa.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-[#4ade80] transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* TARJETA 1.5: GOOGLE CHROME */}
          <button
            type="button"
            onClick={handleOpenChrome}
            className="w-full text-left p-4 rounded-2xl transition-all duration-200 group active:scale-[0.98] relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(15, 20, 32, 0.9) 0%, rgba(6, 10, 18, 0.95) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7), 0 0 15px rgba(59, 130, 246, 0.15)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(10, 20, 40, 0.8) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                  }}
                >
                  <Globe className="w-6 h-6 text-[#60a5fa]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-base tracking-wide group-hover:text-[#60a5fa] transition-colors">
                      Google Chrome
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/40">
                      NAVEGADOR
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-snug">
                    Navegador web completo y rápido con buscador Google y botón de regreso.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-[#60a5fa] transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* TARJETA 2: AGENTE DE VOZ (AVA) */}
          <button
            type="button"
            onClick={handleSelectVoiceAgent}
            className="w-full text-left p-4 rounded-2xl transition-all duration-200 group active:scale-[0.98] relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(25, 20, 10, 0.9) 0%, rgba(10, 8, 4, 0.95) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7), 0 0 15px rgba(212, 175, 55, 0.15)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(20, 15, 5, 0.8) 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.6)',
                  }}
                >
                  <Mic className="w-6 h-6 text-[#f0d060]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      style={goldGradientText}
                      className="font-bold text-base tracking-wide"
                    >
                      Asistente de Voz (AVA)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#d4af37]/20 text-[#f0d060] border border-[#d4af37]/40">
                      EN VIVO
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-snug">
                    Llamada de voz y videollamada con Gemini Live a pantalla completa.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-[#f0d060] transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* TARJETA 3: NOTEBOOK & CEREBRO */}
          <div
            className="w-full p-4 rounded-2xl relative overflow-hidden opacity-90"
            style={{
              background: 'linear-gradient(145deg, rgba(18, 18, 28, 0.9) 0%, rgba(8, 8, 14, 0.95) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(15, 10, 30, 0.8) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.45)',
                  }}
                >
                  <BookOpen className="w-6 h-6 text-[#c4b5fd]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-base tracking-wide">
                      Notebook & Cerebro
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#8b5cf6]/20 text-[#c4b5fd] border border-[#8b5cf6]/40">
                      PRÓXIMAMENTE
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-snug">
                    Consultas complejas a catálogos, contratos y base de datos con IA.
                  </p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-[#c4b5fd]/60" />
            </div>
          </div>

          {/* TARJETA 4: AJUSTES & ADMINISTRACIÓN */}
          <div className="pt-1 flex gap-2.5">
            {onOpenClientSettings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenClientSettings();
                }}
                className="flex-1 py-3 px-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-150 active:scale-95"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <SlidersHorizontal className="w-4 h-4 text-[#f0d060]" />
                <span className="text-xs font-semibold text-zinc-300">
                  Ajustes
                </span>
              </button>
            )}

            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="flex-1 py-3 px-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-150 active:scale-95"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <ShieldCheck className="w-4 h-4 text-[#f0d060]" />
                <span className="text-xs font-semibold text-zinc-300">
                  Admin
                </span>
              </button>
            )}
          </div>

        </div>

        {/* ── PIE DE MODAL ── */}
        <div className="px-6 py-3 border-t border-white/5 bg-black/40 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>SISTEMA MODULAR LEGO</span>
          <span className="text-[#d4af37]/80 font-bold">EDICIÓN 2026</span>
        </div>
      </div>
    </div>
  );
};
