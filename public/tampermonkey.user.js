// ==UserScript==
// @name         Phantom Link Asistente Clicker
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Orquestador para presionar el boton de Talk de Google AI Studio desde la App Web en Render
// @author       Antigravity
// @match        https://aistudio.google.com/live*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("=== Phantom Link Script Cargado ===");

    // Configuración del host de WebSocket
    let wsHost = localStorage.getItem("phantom_ws_host") || "localhost:3000";

    // Si es la primera vez que se carga y es localhost, mostrar un prompt recordatorio
    if (!localStorage.getItem("phantom_ws_host")) {
        const input = prompt(
            "Introduce el dominio de tu servidor Render (ejemplo: mi-app.onrender.com) o presiona Aceptar para usar local (localhost:3000):",
            "localhost:3000"
        );
        if (input) {
            wsHost = input.replace(/^https?:\/\//, '').replace(/\/ws$/, '');
            localStorage.setItem("phantom_ws_host", wsHost);
        }
    }

    const wsUrl = (wsHost.startsWith("localhost") ? "ws://" : "wss://") + wsHost + "/ws";
    console.log("[Phantom Link] Conectando al servidor WebSocket:", wsUrl);

    let socket = null;

    // Crear indicador de estado visual flotante
    const badge = document.createElement("div");
    badge.style.position = "fixed";
    badge.style.top = "10px";
    badge.style.left = "10px";
    badge.style.zIndex = "99999";
    badge.style.padding = "8px 16px";
    badge.style.borderRadius = "20px";
    badge.style.fontSize = "12px";
    badge.style.fontFamily = "sans-serif";
    badge.style.fontWeight = "bold";
    badge.style.color = "white";
    badge.style.cursor = "pointer";
    badge.style.boxShadow = "0 4px 15px rgba(0,0,0,0.6)";
    badge.style.transition = "all 0.3s ease";
    badge.style.backgroundColor = "#ef4444";
    badge.textContent = "🔴 Phantom Link: Desconectado";
    document.body.appendChild(badge);

    // Permitir configurar la dirección al hacer clic en el indicador
    badge.onclick = () => {
        const input = prompt(
            "Introduce el dominio de tu servidor Render (ejemplo: mi-app.onrender.com) o 'localhost:3000':",
            wsHost
        );
        if (input) {
            const cleanHost = input.replace(/^https?:\/\//, '').replace(/\/ws$/, '');
            localStorage.setItem("phantom_ws_host", cleanHost);
            location.reload();
        }
    };

    function connect() {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("[Phantom Link] Conectado al servidor como Agente.");
            socket.send(JSON.stringify({ type: "register", role: "agent" }));
            badge.textContent = "🟢 Phantom Link: Conectado";
            badge.style.backgroundColor = "#10b981";
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("[Phantom Link] Mensaje recibido:", data);

                if (data.type === "command") {
                    if (data.action === "start-call") {
                        triggerStartCall();
                    } else if (data.action === "end-call") {
                        triggerEndCall();
                    }
                }
            } catch (e) {
                console.error("[Phantom Link] Error parseando mensaje:", e);
            }
        };

        socket.onclose = () => {
            console.log("[Phantom Link] Conexión perdida. Reintentando en 3s...");
            badge.textContent = "🔴 Phantom Link: Desconectado";
            badge.style.backgroundColor = "#ef4444";
            setTimeout(connect, 3000);
        };

        socket.onerror = (err) => {
            console.error("[Phantom Link] Error en WebSocket:", err);
            socket.close();
        };
    }

    // Escáner profundo de DOM y Shadow DOM para encontrar el botón "Talk"
    function deepFindTalk(root) {
        if (!root) return null;
        
        // Buscar en los elementos del nivel actual
        var elements = root.querySelectorAll('*');
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            var text = (el.textContent || '').trim();
            var label = (el.getAttribute('aria-label') || '').trim();
            
            if (text === 'Talk' || label === 'Talk' || text.toLowerCase() === 'talk' || label.toLowerCase() === 'talk') {
                return el.closest('button') || el.closest('[role="button"]') || el;
            }
            
            // Si el elemento contiene Shadow DOM, realizar búsqueda recursiva
            if (el.shadowRoot) {
                var foundInShadow = deepFindTalk(el.shadowRoot);
                if (foundInShadow) return foundInShadow;
            }
        }
        
        // Respaldo secundario: buscar cualquier botón que contenga la palabra "Talk"
        var btns = root.querySelectorAll('button, [role="button"]');
        for (var j = 0; j < btns.length; j++) {
            var b = btns[j];
            var txt = (b.textContent || '').trim();
            if (txt.includes('Talk') || txt.includes('talk')) {
                return b;
            }
        }
        
        return null;
    }

    function triggerStartCall() {
        console.log("[Phantom Link] Comando start-call recibido. Buscando botón Talk...");

        // 1. Asegurar micrófono encendido
        try {
            var micBtns = document.querySelectorAll('button[aria-label*="mic"], button[aria-label*="Microphone"], mat-icon');
            for (var k = 0; k < micBtns.length; k++) {
                var m = micBtns[k];
                var mTxt = (m.textContent || '').trim();
                var mAria = (m.getAttribute('aria-label') || '').toLowerCase();
                if (mTxt === 'mic_off' || mAria.includes('unmute') || mAria.includes('turn on microphone')) {
                    var mBtn = m.closest('button') || m;
                    mBtn.click();
                    console.log("[Phantom Link] Micrófono des-silenciado.");
                }
            }
        } catch (e) {
            console.warn("[Phantom Link] Error al intentar des-silenciar mic:", e);
        }

        // 2. Buscar botón Talk
        var btn = deepFindTalk(document);
        if (btn) {
            console.log("[Phantom Link] ¡Botón Talk encontrado! Simulando clics mecánicos...");
            btn.focus();
            
            // Simular secuencia completa de eventos de puntero y ratón
            ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(function(evtName) {
                try {
                    var evt = new PointerEvent(evtName, { bubbles: true, cancelable: true, composed: true, view: window });
                    btn.dispatchEvent(evt);
                } catch (e) {
                    try {
                        btn.dispatchEvent(new MouseEvent(evtName, { bubbles: true, cancelable: true, composed: true, view: window }));
                    } catch (err) {}
                }
            });
            
            try {
                btn.click();
            } catch (e) {}
        } else {
            console.warn("[Phantom Link] No se encontró el botón Talk en la página actual.");
        }
    }

    // Colgar llamada
    function triggerEndCall() {
        console.log("[Phantom Link] Comando end-call recibido. Colgando llamada...");
        
        try {
            var allNodes = document.querySelectorAll('*');
            let closed = false;
            
            for (var i = 0; i < allNodes.length; i++) {
                var node = allNodes[i];
                var txt = (node.textContent || '').trim();
                if (node.children.length === 0 && txt.includes('Stream is live')) {
                    var bar = node.closest('div, section, footer') || node.parentElement;
                    if (bar) {
                        var closeBtn = bar.querySelector('button, [role="button"], mat-icon, svg');
                        if (closeBtn) {
                            closeBtn.click();
                            closed = true;
                            console.log("[Phantom Link] Botón de colgar presionado con éxito.");
                            break;
                        }
                    }
                }
            }
            
            // Si por alguna razón no se localiza el botón, recargamos la página
            // para limpiar completamente la conexión WebRTC y liberar los recursos.
            if (!closed) {
                console.log("[Phantom Link] No se localizó botón de colgar activo. Recargando página...");
                location.reload();
            }
        } catch (e) {
            console.error("[Phantom Link] Error intentando colgar la llamada. Recargando como respaldo...", e);
            location.reload();
        }
    }

    // Iniciar bucle de conexión
    connect();
})();
