import React, { useState } from 'react';

interface AsistenteProPageProps {
  onBack: () => void;
}

export const AsistenteProPage: React.FC<AsistenteProPageProps> = ({ onBack }) => {
  const [activeViewer, setActiveViewer] = useState<{ title: string; url: string } | null>(null);

  const handleOpenModule = (title: string, url: string) => {
    if (!url) return; // Módulo desconectado (Asistente Personal)
    if (url.startsWith('http') || url.endsWith('.html')) {
      setActiveViewer({ title, url });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 99999,
      fontFamily: "'Montserrat', sans-serif",
      color: '#ffffff',
      userSelect: 'none',
      overflow: 'hidden'
    }}>
      {/* Botón flotante sutil de regreso en la esquina superior izquierda */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 30,
          background: 'rgba(20, 20, 20, 0.8)',
          border: '1px solid rgba(212, 175, 55, 0.6)',
          color: '#fcf6ba',
          padding: '8px 14px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '1px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.8), 0 0 10px rgba(191,149,63,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backdropFilter: 'blur(8px)'
        }}
      >
        ⬅ REGRESAR
      </button>

      {/* Encabezado Único Centrado: Solo "ASISTENTE PRO" en Oro Líquido 3D */}
      <header style={{
        paddingTop: '28px',
        paddingBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
      }}>
        <h1 style={{
          margin: 0,
          padding: 0,
          fontSize: '26px',
          fontWeight: 900,
          letterSpacing: '4px',
          background: 'linear-gradient(135deg, #ffffff 0%, #fcf6ba 25%, #bf953f 50%, #fbf5b7 75%, #aa771c 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          filter: 'drop-shadow(0 2px 8px rgba(191, 149, 63, 0.4))'
        }}>
          ASISTENTE PRO
        </h1>
      </header>

      {/* Rejilla Maestra de los 6 Módulos Circulares de Cristal 3D */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 20px 40px 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '28px 32px',
          maxWidth: '340px',
          width: '100%'
        }}>
          {/* 1. ASISTENTE PERSONAL */}
          <div
            onClick={() => handleOpenModule('ASISTENTE PERSONAL', '')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={crystalCircleStyle}>
              <svg style={iconSvgStyle} viewBox="0 0 24 24">
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.72 11.72 0 0 0 3.7.59 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.72 11.72 0 0 0 .59 3.7 1 1 0 0 1-.24 1.02z"/>
              </svg>
            </div>
            <div style={moduleLabelStyle}>ASISTENTE PERSONAL</div>
          </div>

          {/* 2. ASISTENTE TELÉFONO */}
          <div
            onClick={() => handleOpenModule('ASISTENTE TELÉFONO', '/marcador_telefono.html')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={crystalCircleStyle}>
              <svg style={iconSvgStyle} viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z"/>
              </svg>
            </div>
            <div style={moduleLabelStyle}>ASISTENTE TELÉFONO</div>
          </div>

          {/* 3. ASISTENTE WHATSAPP */}
          <div
            onClick={() => { window.location.href = 'https://restauran-editable-premiun.firebaseapp.com/'; }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={crystalCircleStyle}>
              <svg style={iconSvgStyle} viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.8 14.16c-.24.68-1.4 1.25-1.92 1.33-.51.07-1.18.1-3.41-.82-2.85-1.18-4.69-4.08-4.83-4.27-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09 1-2.37.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.42-.07.65.49.24.57.81 1.98.88 2.13.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.12.59.16.28.72 1.19 1.55 1.93 1.07.95 1.97 1.25 2.25 1.39.28.14.45.12.62-.07.17-.19.73-.85.92-1.14.19-.28.38-.24.64-.14.26.09 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.7-.17 1.38z"/>
              </svg>
            </div>
            <div style={moduleLabelStyle}>ASISTENTE WHATSAPP</div>
          </div>

          {/* 4. GENERADOR DE FOTOS */}
          <div
            onClick={() => handleOpenModule('GENERADOR DE FOTOS', 'https://ideogram.ai')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={crystalCircleStyle}>
              <svg style={iconSvgStyle} viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <div style={moduleLabelStyle}>GENERADOR DE FOTOS</div>
          </div>

          {/* 5. GENERADOR DE VÍDEO */}
          <div
            onClick={() => handleOpenModule('GENERADOR DE VÍDEO', 'https://flow.google.com')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={crystalCircleStyle}>
              <svg style={iconSvgStyle} viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            </div>
            <div style={moduleLabelStyle}>GENERADOR DE VÍDEO</div>
          </div>

          {/* 6. ASISTENTE IA (Letras IA en el botón, ASISTENTE IA abajo) */}
          <div
            onClick={() => handleOpenModule('ASISTENTE IA', 'https://aistudio.google.com')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={crystalCircleStyle}>
              <span style={{
                fontSize: '26px',
                fontWeight: 900,
                letterSpacing: '1px',
                background: 'linear-gradient(135deg, #ffffff 0%, #fcf6ba 40%, #bf953f 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))'
              }}>
                IA
              </span>
            </div>
            <div style={moduleLabelStyle}>ASISTENTE IA</div>
          </div>

        </div>
      </div>

      {/* Visor Interno para Módulos Secundarios */}
      {activeViewer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#000000',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100000
        }}>
          <div style={{
            height: '54px',
            backgroundColor: '#0a0a0a',
            borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px'
          }}>
            <button
              onClick={() => setActiveViewer(null)}
              style={{
                background: 'linear-gradient(145deg, #18181b, #000000)',
                border: '1px solid #bf953f',
                color: '#fcf6ba',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ⬅ REGRESAR
            </button>
            <div style={{
              fontSize: '13px',
              fontWeight: 900,
              letterSpacing: '2px',
              background: 'linear-gradient(135deg, #ffffff, #fcf6ba, #bf953f)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {activeViewer.title}
            </div>
            <div style={{ width: '80px' }}></div>
          </div>
          <iframe
            src={activeViewer.url}
            style={{
              flex: 1,
              width: '100%',
              border: 'none',
              backgroundColor: '#000000'
            }}
          />
        </div>
      )}
    </div>
  );
};

// ==============================================================================
// ESTILOS DE CRISTAL PURO 3D CIRCULARES (GLASSMORPHISM CON BISEL ORO LÍQUIDO)
// ==============================================================================
const crystalCircleStyle: React.CSSProperties = {
  width: '92px',
  height: '92px',
  borderRadius: '50%',
  position: 'relative',
  background: 'radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.18) 0%, rgba(35, 35, 35, 0.75) 45%, rgba(5, 5, 5, 0.95) 100%)',
  border: '1.8px solid rgba(212, 175, 55, 0.85)',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.95), inset 0 2px 6px rgba(255, 255, 255, 0.35), inset 0 -3px 8px rgba(0, 0, 0, 0.8), 0 0 15px rgba(191, 149, 63, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
};

const iconSvgStyle: React.CSSProperties = {
  width: '38px',
  height: '38px',
  fill: '#f0d060',
  filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.9))',
};

const moduleLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '1px',
  color: '#ffffff',
  textAlign: 'center',
  marginTop: '12px',
  textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)',
};
