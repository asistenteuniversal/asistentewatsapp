# Asistente Universal - Cliente Web

Interfaz cliente web interactiva construida con React, TypeScript, Vite y Tailwind CSS para la conexiÃ³n de audio, video y datos en tiempo real mediante WebRTC con inteligencia artificial.

---

## ðŸš€ CaracterÃ­sticas Principales

- **ConexiÃ³n en Tiempo Real**: Streaming bidireccional de voz y audio de baja latencia vÃ­a WebRTC.
- **CarÃ¡tula Neon Gold**: Interfaz visual optimizada con controles de conexiÃ³n, avatar reactivo y micro-interacciones de alta respuesta.
- **Multiplataforma**: DiseÃ±ada para ejecutarse tanto en navegadores de escritorio como dentro de WebViews nativos de Android (APK).
- **Control de Estado Robusto**: GestiÃ³n de estados de llamada, reconexiÃ³n automÃ¡tica y detecciÃ³n de fallas de red.

---

## ðŸ› ï¸ Requisitos del Sistema

- **Node.js**: VersiÃ³n 18.0.0 o superior (se recomienda LTS 20+).
- **NPM**: VersiÃ³n 9.0.0 o superior.

---

## ðŸ“¦ InstalaciÃ³n y ConfiguraciÃ³n

1. **Clonar o descargar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd web
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Copia el archivo de ejemplo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   Configura las claves de API necesarias en `.env`:
   ```env
   VITE_GEMINI_API_KEY=tu_clave_aqui
   ```

---

## ðŸ’» Scripts Disponibles

- **`npm run dev`**: Inicia el servidor de desarrollo local con recarga rÃ¡pida (HMR).
- **`npm run build`**: Compila y optimiza el cÃ³digo TypeScript y React para producciÃ³n en el directorio `dist/`.
- **`npm run preview`**: Levanta un servidor local para previsualizar la compilaciÃ³n de producciÃ³n.

---

## ðŸŒ Despliegue en ProducciÃ³n

### Vercel
Este proyecto estÃ¡ configurado para despliegue continuo en Vercel:
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Cloudflare Pages
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`

---

## ðŸ”’ Seguridad y Buenas PrÃ¡cticas

- **Variables de Entorno**: Nunca confirmar archivos `.env` con credenciales reales a control de versiones.
- **ProtecciÃ³n de Datos**: Las claves y tokens de API deben inyectarse exclusivamente a travÃ©s de las variables de entorno de la plataforma de hosting (Vercel / Cloudflare).
- **Arquitectura Limpia**: Todo el cÃ³digo de producciÃ³n reside en `src/` y los activos estÃ¡ticos en `public/`.