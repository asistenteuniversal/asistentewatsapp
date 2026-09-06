import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize GenAI client lazily or safely on request
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured in process.env");
    }
    return new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Proxy endpoint to bypass X-Frame-Options and Content-Security-Policy blocking
  app.all("/api/proxy", async (req, res) => {
    try {
      const targetUrl = (req.query.url as string) || (req.body?.url as string);
      if (!targetUrl) {
        return res.status(400).send("Parametro URL es requerido");
      }

      let validUrl = targetUrl;
      if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
        validUrl = "https://" + validUrl;
      }

      const method = req.method || "GET";
      const headers: Record<string, string> = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      };

      if (req.headers["cookie"]) {
        headers["Cookie"] = req.headers["cookie"];
      }

      const fetchOptions: RequestInit = {
        method,
        headers,
      };

      if (method === "POST" && req.body) {
        fetchOptions.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      }

      const response = await fetch(validUrl, fetchOptions);

      const contentType = response.headers.get("content-type") || "text/html";
      res.setHeader("Content-Type", contentType);

      if (contentType.includes("text/html")) {
        let html = await response.text();
        const urlObj = new URL(validUrl);
        const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;

        // Inject <base href="..."> so relative paths load correctly
        if (html.includes("<head>")) {
          html = html.replace("<head>", `<head><base href="${baseUrl}" />`);
        } else if (html.includes("<HEAD>")) {
          html = html.replace("<HEAD>", `<HEAD><base href="${baseUrl}" />`);
        } else {
          html = `<base href="${baseUrl}" />` + html;
        }

        return res.send(html);
      } else {
        const arrayBuffer = await response.arrayBuffer();
        return res.send(Buffer.from(arrayBuffer));
      }
    } catch (err: any) {
      console.error("Proxy error:", err);
      return res
        .status(500)
        .send(`Error al cargar la página a través del proxy: ${err.message}`);
    }
  });

  // Chat completion endpoint (emulating Google AI Studio backend engine under NEON skin)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, mode } = req.body;
      const ai = getGenAI();

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "API key missing",
          reply: "System initialized. Please ensure GEMINI_API_KEY is set in Secrets."
        });
      }

      // Format conversation history
      const formattedContents = [];
      if (Array.isArray(history)) {
        for (const item of history) {
          if (item.role && item.content) {
            formattedContents.push({
              role: item.role === "user" ? "user" : "model",
              parts: [{ text: item.content }]
            });
          }
        }
      }

      // Append current message
      formattedContents.push({
        role: "user",
        parts: [{ text: message || "Hola" }]
      });

      const systemInstruction = mode === "voice"
        ? "Eres una inteligencia artificial avanzada conversando en una llamada de voz. Responde de forma concisa, directa, natural y conversacional (máximo 2 a 3 frases cortas), adaptada para ser escuchada por audio como en una llamada de voz telefónica."
        : "Eres Google AI Studio en la interfaz oculta de NEON. Responde de manera servicial, fluida y precisa en español.";

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "Entendido.";
      res.json({ reply: replyText });
    } catch (err: any) {
      console.error("Error in /api/chat:", err);
      res.status(500).json({ error: err.message || "Failed to process chat" });
    }
  });

  // Text-to-speech audio endpoint
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const ai = getGenAI();
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "API key missing" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || "Kore" },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audio: base64Audio });
      } else {
        res.status(500).json({ error: "No audio generated from TTS" });
      }
    } catch (err: any) {
      console.error("Error in /api/tts:", err);
      res.status(500).json({ error: err.message || "TTS generation failed" });
    }
  });

  // Vite middleware setup for Development vs Production static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = new Set<WebSocket & { role?: string }>();

  wss.on("connection", (ws: WebSocket & { role?: string }) => {
    clients.add(ws);
    console.log(`[WS] Client connected. Total clients: ${clients.size}`);

    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "register") {
          ws.role = data.role;
          console.log(`[WS] Client registered as: ${ws.role}`);
        } else if (data.type === "command") {
          console.log(`[WS] Command received: ${data.action} (from role: ${ws.role || "unknown"})`);
          // Broadcast to all other connected clients
          for (const client of clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "command", action: data.action }));
            }
          }
        }
      } catch (err) {
        console.error("[WS] Error parsing message:", err);
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`[WS] Client disconnected. Total clients: ${clients.size}`);
    });

    ws.on("error", (err) => {
      console.error("[WS] Socket error:", err);
    });
  });
}

startServer();
