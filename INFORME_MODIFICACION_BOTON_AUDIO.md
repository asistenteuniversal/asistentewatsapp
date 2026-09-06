# 📄 INFORME TÉCNICO: Activación del Botón de Llamada de Audio y Control de Luces
**Fecha:** 11 de Agosto de 2026  
**Proyecto:** NEON STUDIO ANDROIT — Capa Web  
**Ubicación:** `40.-NEON-STUDIO-ANDROIT`

---

## 1. RESUMEN DEL CAMBIO Realizado

Se habilitó y programó el botón de la derecha (icono de teléfono de llamada de audio) en la carátula de la aplicación. Ahora, este botón realiza una llamada de voz en Google AI Studio (presionando directamente el botón "Talk", sin activar la cámara), y se corrigió el problema de iluminación para que cada botón encienda su luz de forma independiente según la llamada que se encuentre activa.

---

## 2. DETALLE DE LA IMPLEMENTACIÓN EN LA CAPA WEB (REACT)

El cambio se realizó en el archivo principal de la carátula: `src/components/NeonCoverLayer.tsx`.

### A. Estado Local del Botón Activo
Para evitar tocar el estado global del sistema y prevenir fallos en la pantalla, se incorporó un estado interno de memoria dentro de la misma carátula:

```typescript
const [activeCallType, setActiveCallType] = useState<'video' | 'audio' | null>(null);
```

Este estado realiza el siguiente comportamiento:
* **Si se presiona Video:** Se establece en `'video'`.
* **Si se presiona Audio (Teléfono):** Se establece en `'audio'`.
* **Si se cuelga:** Se restablece a `null` automáticamente.

Para asegurar que el estado visual se apague al colgar, se inyectó un hook de sincronización:
```typescript
useEffect(() => {
  if (!isCallActive) {
    setActiveCallType(null); // Apaga cualquier luz activa si no hay llamada corriendo
  }
}, [isCallActive]);
```

---

### B. Habilitación del Botón del Teléfono (Llamada de Voz)
El botón del teléfono estaba deshabilitado con el atributo `disabled`. Se activó y se le configuró el comportamiento condicional:

```tsx
<button
  type="button"
  onClick={() => {
    if (onToggleAudio) {
      if (isCallActive) {
        onToggleAudio();
        setActiveCallType(null);
      } else {
        onToggleAudio();
        setActiveCallType('audio');
      }
    }
  }}
  className={`rounded-full border-2 flex items-center justify-center
              transition-all duration-150 ease-out focus:outline-none active:scale-90
              ${isCallActive && activeCallType === 'audio'
                ? 'border-red-500 text-red-500 bg-black shadow-[0_0_22px_rgba(239,68,68,0.45)]'
                : 'border-[#d4af37] text-[#d4af37] bg-black shadow-[0_0_22px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]'
              }`}
>
  <Phone
    style={{ 
      width: 'clamp(22px, 6.5vw, 32px)', 
      height: 'clamp(22px, 6.5vw, 32px)', 
      transform: isCallActive && activeCallType === 'audio' ? 'rotate(135deg)' : 'none' 
    }}
  />
</button>
```

#### Efectos visuales agregados:
1. **Rotación dinámica:** El teléfono está recto en reposo (dorado). Al iniciar la llamada de audio, **el icono rota 135 grados** adoptando la posición clásica de colgar llamada.
2. **Cambio de color:** El botón pasa de dorado brillante metálico a rojo puro de colgar con un anillo pulsante (`animate-ping`) rojo a su alrededor.

---

### C. Condicionamiento de Luz en el Botón de Video
Se aplicó la misma validación para el botón de la cámara. Ahora, la luz verde y la animación expansiva de ping solo se activarán si el tipo de llamada actual es estrictamente de video:

```tsx
className={`rounded-full border-2 flex items-center justify-center
            transition-all duration-150 ease-out focus:outline-none active:scale-90
            ${isCallActive && activeCallType === 'video'
              ? 'border-emerald-400 text-emerald-400 bg-black shadow-[0_0_22px_rgba(52,211,153,0.45)]'
              : 'border-[#d4af37] text-[#d4af37] bg-black shadow-[0_0_22px_rgba(212,175,55,0.3)]'
            }`}
```

---

## 3. INTEGRACIÓN CON EL PUENTE NATIVO ANDROID

Cuando se presiona el botón de audio, este ejecuta `onToggleAudio()` en `src/App.tsx`, el cual despacha la instrucción al puente nativo enviando la bandera `false` (llamada sin video):

```typescript
(window as any).AndroidInterface.startVoiceCall(false);
```

En la APK (Página 2), Java interpreta el `false`, omitiendo el paso de activación de la Webcam (Segundo 1) y presionando directamente el botón de **Talk** (Segundo 2) en la interfaz de Google AI Studio.

---

*Informe de Modificación — Antigravity AI — Agosto 2026*
