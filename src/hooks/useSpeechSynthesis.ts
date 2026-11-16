import { useState, useCallback, useRef, useEffect } from 'react';

export type SpeechLanguage = 'uz' | 'ru' | 'en';

const BCP47_MAP: Record<SpeechLanguage, string[]> = {
  uz: ['uz-UZ', 'uz'],
  ru: ['ru-RU', 'ru'],
  en: ['en-US', 'en-GB', 'en'],
};

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!supported) return;

    const handleEnd = () => {
      setIsSpeaking(false);
      setSpeakingId(null);
      utteranceRef.current = null;
    };

    window.speechSynthesis.addEventListener('end', handleEnd);
    window.speechSynthesis.addEventListener('error', handleEnd);

    return () => {
      window.speechSynthesis.removeEventListener('end', handleEnd);
      window.speechSynthesis.removeEventListener('error', handleEnd);
    };
  }, [supported]);

  const speak = useCallback(
    (text: string, id: string, language: SpeechLanguage = 'uz') => {
      if (!supported) return;

      // If already speaking this message, stop
      if (speakingId === id && isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setSpeakingId(null);
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Strip markdown/code for cleaner speech
      const cleanText = text
        .replace(/```[\s\S]*?```/g, ' kod bloki ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/[#*_-]/g, '')
        .replace(/\n+/g, '. ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Try to find a matching voice
      const voices = window.speechSynthesis.getVoices();
      const langCodes = BCP47_MAP[language];
      const matchedVoice = voices.find((v) =>
        langCodes.some((code) => v.lang.toLowerCase().startsWith(code.toLowerCase()))
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      utterance.lang = langCodes[0];
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingId(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingId(null);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setSpeakingId(id);
    },
    [supported, speakingId, isSpeaking]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingId(null);
  }, [supported]);

  return { speak, stop, isSpeaking, speakingId, supported };
}
