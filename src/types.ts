export type AppMode = 'studio' | 'neon' | 'admin';

export interface AsistenteConfigRow {
  client_id: string;
  system_instructions: string;
  system_memory: string;
  client_name: string;
  is_active: boolean;
  activation_key: string | null;
  hardware_id: string | null;
  updated_at?: string;
}

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
  memoryDays?: number;
  memorySaveTimestamp?: number;
  syncMemoryEnabled?: boolean;
  voiceMaleEnabled?: boolean;
}
