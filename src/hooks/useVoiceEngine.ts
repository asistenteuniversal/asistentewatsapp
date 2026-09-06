import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceConfig } from '../types';

export function useVoiceEngine(
  onSpeechRecognized?: (text: string) => void,
  voiceConfig?: VoiceConfig
) {
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Alternar el estado de llamada (solo temporizador visual, gasta 0% recursos)
  const toggleCall = useCallback(async () => {
    if (isCallActive) {
      setIsCallActive(false);
      setCallDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsCallActive(true);
      setCallDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
  }, [isCallActive]);

  // Limpiar temporizadores al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    isCallActive,
    isListening,
    isSpeaking,
    audioLevel,
    callDuration,
    micPermissionGranted,
    transcript,
    toggleCall,
    speakText: (text: string) => {
      // Desactivado por completo
    },
    startListening: () => {
      // Desactivado por completo
    },
    stopListening: () => {
      // Desactivado por completo
    },
  };
}
