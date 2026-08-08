export type AppMode = 'studio' | 'neon';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface VoiceConfig {
  voiceName: string;
  pitch: number;
  rate: number;
  useGeminiTts: boolean;
}

export interface AppSettings {
  chatUrl: string;
  stealthOpacity: number;
  hotkeyEnabled: boolean;
  pulseSpeed: number;
  voiceConfig: VoiceConfig;
  autoStartVoice: boolean;
  showIframeFallback: boolean;
  bridgeEnabled: boolean;
  systemInstructions: string;
  systemMemory: string;
  memorySaveDate: string;
}
