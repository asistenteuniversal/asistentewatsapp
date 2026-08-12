# 🔄 INSTRUCCIONES DE REVERSIÓN: Menú Ajustes Independientes de Cliente
**Fecha:** 12 de Agosto de 2026  
**Ubicación:** `40.-NEON-STUDIO-ANDROIT` (Web)

Este documento detalla cómo deshacer los cambios de los dos botones de ajustes independientes y el icono compacto del ojo.

---

### Paso 1: Cambios en `src/components/NeonCoverLayer.tsx`
Para regresar el botón del Ojo a su tamaño con texto y eliminar el botón del cliente:

1. Abre [`NeonCoverLayer.tsx`](file:///C:/Users/cmcor/OneDrive/Escritorio/MEMORIA%20TOTAL%20NUEVA/NEON-AVANTAR-APP-WEB/40.-NEON-STUDIO-ANDROIT/src/components/NeonCoverLayer.tsx).
2. Regresa la etiqueta del ojo agregando `<span>MOSTRAR INTERFAZ</span>` debajo del icono `<Eye />`.
3. Elimina el botón con el icono de `Sliders` (Ajustes de Cliente) del HTML del render.
4. Quita la propiedad `onOpenClientSettings` de la interfaz `NeonCoverLayerProps`.

---

### Paso 2: Cambios en `src/App.tsx`
1. Abre [`App.tsx`](file:///C:/Users/cmcor/OneDrive/Escritorio/MEMORIA%20TOTAL%20NUEVA/NEON-AVANTAR-APP-WEB/40.-NEON-STUDIO-ANDROIT/src/App.tsx).
2. Elimina los estados `isClientSettingsOpen` e `isGoogleLinked`.
3. Elimina el componente `<ClientSettingsModal />` del bloque de renderizado final.
4. Quita las líneas de `localStorage.setItem` de los callbacks de ventana `setAppModeNeon` y `setAppModeStudio`.

---

### Paso 3: Borrar modal del cliente
Elimina el archivo `src/components/ClientSettingsModal.tsx`.
