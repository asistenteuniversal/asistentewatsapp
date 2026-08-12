# 🔄 INSTRUCCIONES DE REVERSIÓN: Menú Ajustes Independientes de Cliente
**Fecha:** 12 de Agosto de 2026  
**Ubicación:** `40.-NEON-STUDIO-ANDROIT` (Web) y `45.-APK STUDIO NEON VIDEO` (Android)

Este documento detalla cómo deshacer los cambios de los dos botones de ajustes independientes y la validación nativa de cookies de Google.

---

### Paso 1: Cambios en la APK (Java - Carpeta 45)
Para eliminar el lector nativo de cookies:
1. Abre `app/src/main/java/com/phantomlink/neonstudio/MainActivity.java`
2. Busca y elimina el bloque del método `isGoogleSessionActive()`:
   ```java
   @JavascriptInterface
   public boolean isGoogleSessionActive() { ... }
   ```

---

### Paso 2: Cambios en la Web (React - Carpeta 40)
Para regresar el botón del Ojo a su tamaño con texto y eliminar el botón del cliente:

1. Abre [`NeonCoverLayer.tsx`](file:///C:/Users/cmcor/OneDrive/Escritorio/MEMORIA%20TOTAL%20NUEVA/NEON-AVANTAR-APP-WEB/40.-NEON-STUDIO-ANDROIT/src/components/NeonCoverLayer.tsx).
2. Regresa la etiqueta del ojo agregando `<span>MOSTRAR INTERFAZ</span>` debajo del icono `<Eye />`.
3. Elimina el botón con el icono de `Sliders` (Ajustes de Cliente) del HTML del render.
4. Quita la propiedad `onOpenClientSettings` de la interfaz `NeonCoverLayerProps`.
5. Abre [`App.tsx`](file:///C:/Users/cmcor/OneDrive/Escritorio/MEMORIA%20TOTAL%20NUEVA/NEON-AVANTAR-APP-WEB/40.-NEON-STUDIO-ANDROIT/src/App.tsx).
6. Quita el estado `isClientSettingsOpen` y desinstala el componente `<ClientSettingsModal />` del bloque de renderizado final.

---

### Paso 3: Borrar archivo de Modal Cliente
Elimina el archivo `src/components/ClientSettingsModal.tsx`.
