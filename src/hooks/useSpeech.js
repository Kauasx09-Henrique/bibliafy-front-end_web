import { useState, useEffect, useRef } from 'react';

export default function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synth = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  useEffect(() => {
    // Cancela qualquer fala pendente ao desmontar o componente
    return () => {
      if (synth.current) {
        synth.current.cancel();
      }
    };
  }, []);

  const speak = (text) => {
    if (!text) return;

    // Cancela fala anterior se houver
    if (synth.current.speaking) {
      synth.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Tenta configurar para PT-BR
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1; // Velocidade um pouco mais natural
    utterance.pitch = 1;

    // Tenta encontrar uma voz do Google ou Microsoft em PT-BR (são melhores)
    const voices = synth.current.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt-BR') && v.name.includes('Google')) || 
                    voices.find(v => v.lang.includes('pt-BR'));
    
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    // Eventos para controlar o estado
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synth.current.speak(utterance);
  };

  const pause = () => {
    if (synth.current.speaking && !synth.current.paused) {
      synth.current.pause();
      setIsPaused(true);
      setIsSpeaking(false); // Visualmente parado
    }
  };

  const resume = () => {
    if (synth.current.paused) {
      synth.current.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    }
  };

  const stop = () => {
    if (synth.current.speaking || synth.current.paused) {
      synth.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  return { speak, pause, resume, stop, isSpeaking, isPaused };
}