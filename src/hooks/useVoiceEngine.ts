import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, VoiceConfig } from '../types';

export function useVoiceEngine(
  onSpeechRecognized?: (text: string) => void,
  voiceConfig?: VoiceConfig
) {
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null);
  const [transcript, setTranscript] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Request & setup microphone audio analyser
  const setupMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicPermissionGranted(true);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Analyze volume loop
      const buffer = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(buffer);
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i];
          }
          const avg = sum / buffer.length;
          // Normalised 0 - 100 level
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        }
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      return true;
    } catch (err) {
      console.warn('Microphone access error:', err);
      setMicPermissionGranted(false);
      return false;
    }
  }, []);

  // Stop microphone
  const stopMicrophone = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // Speech Recognition setup
  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += text;
          } else {
            interim += text;
          }
        }

        if (final) {
          setTranscript(final);
          if (onSpeechRecognized) {
            onSpeechRecognized(final);
          }
        } else if (interim) {
          setTranscript(interim);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e.error);
        if (e.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Auto-restart listening if call is active and not speaking
        if (isCallActive && !isSpeaking) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (_) {}
          }, 300);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
    }
  }, [isCallActive, isSpeaking, onSpeechRecognized]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Speech Synthesis
  const speakText = useCallback(
    (text: string) => {
      if (!('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel(); // stop previous
      setIsSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = voiceConfig?.rate || 1.0;
      utterance.pitch = voiceConfig?.pitch || 1.0;

      // Try selecting a good Spanish voice
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice =
        voices.find((v) => v.lang.startsWith('es') && v.name.includes('Google')) ||
        voices.find((v) => v.lang.startsWith('es')) ||
        voices[0];

      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        if (isCallActive) {
          startListening();
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        if (isCallActive) {
          startListening();
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [isCallActive, startListening, voiceConfig]
  );

  // Toggle call
  const toggleCall = useCallback(async () => {
    if (isCallActive) {
      // Hang up
      setIsCallActive(false);
      stopListening();
      stopMicrophone();
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      setCallDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      // Start call
      setIsCallActive(true);
      await setupMicrophone();
      startListening();

      // Start timer
      setCallDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
  }, [isCallActive, setupMicrophone, startListening, stopListening, stopMicrophone]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopMicrophone();
      stopListening();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopListening, stopMicrophone]);

  return {
    isCallActive,
    isListening,
    isSpeaking,
    audioLevel,
    callDuration,
    micPermissionGranted,
    transcript,
    toggleCall,
    speakText,
    startListening,
    stopListening,
  };
}
