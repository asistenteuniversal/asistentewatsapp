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
  const startTimeRef = useRef<number>(0);

  const updateDuration = useCallback(() => {
    if (startTimeRef.current > 0) {
      const elapsedSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setCallDuration(elapsedSec);
    }
  }, []);

  // Alternar el estado de llamada con cálculo exacto por timestamp del reloj físico del celular
  const toggleCall = useCallback(async () => {
    if (isCallActive) {
      setIsCallActive(false);
      setCallDuration(0);
      startTimeRef.current = 0;
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsCallActive(true);
      setCallDuration(0);
      const now = Date.now();
      startTimeRef.current = now;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (startTimeRef.current > 0) {
          const elapsedSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setCallDuration(elapsedSec);
        }
      }, 1000);
    }
  }, [isCallActive]);

  // Actualizar el cronómetro inmediatamente al regresar a primer plano o reanudar pantalla
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isCallActive && startTimeRef.current > 0) {
        updateDuration();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCallActive, updateDuration]);

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
