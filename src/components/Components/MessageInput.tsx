import { useRef, useState, useEffect } from 'react';
import { Mic, Send, Square, Sparkles, Globe } from 'lucide-react';
import type { SpeechLanguage } from '@/hooks/useSpeechSynthesis';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onStopGeneration?: () => void;
  isGenerating: boolean;
  language: SpeechLanguage;
  onLanguageChange: (lang: SpeechLanguage) => void;
}

const SPEECH_LANG_MAP: Record<SpeechLanguage, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};

const LANG_LABELS: Record<SpeechLanguage, string> = {
  uz: "O'z",
  ru: 'Рус',
  en: 'Eng',
};

const PLACEHOLDERS: Record<SpeechLanguage, string> = {
  uz: "SHOX AI'ga savol bering...",
  ru: 'Спросите SHOX AI...',
  en: 'Ask SHOX AI anything...',
};

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      length: number;
      [index: number]: { transcript: string };
      isFinal: boolean;
    };
  };
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function MessageInput({
  onSend,
  disabled,
  isRecording,
  onStartRecording,
  onStopRecording,
  onStopGeneration,
  isGenerating,
  language,
  onLanguageChange,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const langRef = useRef<SpeechLanguage>(language);

  useEffect(() => {
    langRef.current = language;
  }, [language]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SR);
  }, []);

  useEffect(() => {
    if (isRecording && !recognitionRef.current) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const recognition = new SR();
        recognition.lang = SPEECH_LANG_MAP[langRef.current];
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalText += transcript;
            }
          }
          if (finalText) {
            setText((prev) => prev + finalText);
          }
        };

        recognition.onerror = () => {
          onStopRecording();
        };

        recognition.onend = () => {
          if (recognitionRef.current) {
            onStopRecording();
            recognitionRef.current = null;
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      }
    }

    return () => {
      if (recognitionRef.current && !isRecording) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [isRecording, onStopRecording]);

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    onStopRecording();
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const canSend = text.trim().length > 0 && !disabled;

  const languages: SpeechLanguage[] = ['uz', 'ru', 'en'];

  return (
    <div className="px-3 pb-4 pt-2 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-3xl">
        <div
          className={`relative flex items-end gap-2 rounded-2xl border bg-dark-900/80 backdrop-blur-xl p-2 transition-all ${
            isRecording
              ? 'border-red-500/40 glow-blue'
              : 'border-dark-700 focus-within:border-shox-500/50'
          }`}
        >
          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-red-500/20 border border-red-500/30 px-3 py-1.5 whitespace-nowrap">
              <div className="flex items-center gap-1 h-3">
                <span className="w-0.5 h-3 bg-red-400 rounded-full recording-bar" style={{ animationDelay: '0s' }} />
                <span className="w-0.5 h-3 bg-red-400 rounded-full recording-bar" style={{ animationDelay: '0.1s' }} />
                <span className="w-0.5 h-3 bg-red-400 rounded-full recording-bar" style={{ animationDelay: '0.2s' }} />
                <span className="w-0.5 h-3 bg-red-400 rounded-full recording-bar" style={{ animationDelay: '0.3s' }} />
              </div>
              <span className="text-xs text-red-300 font-medium">Yozilmoqda...</span>
            </div>
          )}

          {/* Language selector */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowLangMenu((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-dark-400 hover:text-accent-cyan hover:bg-dark-800 border border-transparent transition-all gap-0.5"
              aria-label="Tilni tanlash"
              title="Tilni tanlash"
            >
              <Globe size={18} />
            </button>
            {showLangMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowLangMenu(false)}
                />
                <div className="absolute bottom-12 left-0 z-20 w-32 rounded-xl border border-dark-700 bg-dark-900 shadow-xl py-1 animate-fade-in">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        onLanguageChange(lang);
                        setShowLangMenu(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors ${
                        language === lang
                          ? 'text-accent-cyan bg-shox-500/10'
                          : 'text-dark-300 hover:text-white hover:bg-dark-800'
                      }`}
                    >
                      <span>{LANG_LABELS[lang]}</span>
                      {language === lang && (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mic button */}
          {speechSupported && (
            <button
              onClick={isRecording ? handleStopRecording : onStartRecording}
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
                isRecording
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-dark-400 hover:text-accent-cyan hover:bg-dark-800 border border-transparent'
              }`}
              aria-label={isRecording ? 'To\'xtatish' : 'Ovozli yozish'}
            >
              <Mic size={20} className={isRecording ? 'animate-pulse' : ''} />
            </button>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={PLACEHOLDERS[language]}
            className="flex-1 resize-none bg-transparent py-2.5 text-sm text-white placeholder:text-dark-500 focus:outline-none scrollbar-none max-h-40"
            disabled={disabled && !isGenerating}
          />

          {/* Send / Stop button */}
          {isGenerating ? (
            <button
              onClick={onStopGeneration}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-dark-700 text-white hover:bg-dark-600 border border-dark-600 transition-all"
              aria-label="To'xtatish"
            >
              <Square size={18} className="fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSend}
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
                canSend
                  ? 'bg-gradient-to-br from-shox-500 to-shox-600 text-white hover:from-shox-400 hover:to-shox-500 shadow-lg shadow-shox-500/30'
                  : 'bg-dark-800 text-dark-600 cursor-not-allowed'
              }`}
              aria-label="Yuborish"
            >
              <Send size={18} />
            </button>
          )}
        </div>

        {/* Helper text */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          <Sparkles size={11} className="text-dark-600" />
          <p className="text-[11px] text-dark-500">
            SHOX AI xatoliklar qilishi mumkin. Muhim ma'lumotlarni tekshiring.
          </p>
        </div>
      </div>
    </div>
  );
}
