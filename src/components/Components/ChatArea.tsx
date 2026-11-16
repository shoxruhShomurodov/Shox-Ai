import { useEffect, useRef } from 'react';
import { AlertCircle, X, PenSquare, Zap } from 'lucide-react';
import { MessageBubble, TypingIndicator } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { WelcomeScreen } from './WelcomeScreen';
import { SidebarToggle } from './Sidebar';
import { LogoText } from './Logo';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import type { Message } from '@/types';
import type { SpeechLanguage } from '@/hooks/useSpeechSynthesis';

interface ChatAreaProps {
  messages: Message[];
  isGenerating: boolean;
  isRecording: boolean;
  error: string | null;
  usageLimitReached: boolean;
  onSend: (text: string) => void;
  onClearError: () => void;
  onToggleSidebar: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onStopGeneration: () => void;
  onNewChat: () => void;
  hasActiveConversation: boolean;
  language: SpeechLanguage;
  onLanguageChange: (lang: SpeechLanguage) => void;
}

export function ChatArea({
  messages,
  isGenerating,
  isRecording,
  error,
  usageLimitReached,
  onSend,
  onClearError,
  onToggleSidebar,
  onStartRecording,
  onStopRecording,
  onStopGeneration,
  onNewChat,
  hasActiveConversation,
  language,
  onLanguageChange,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { speak, stop, speakingId, isSpeaking, supported: ttsSupported } =
    useSpeechSynthesis();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isGenerating]);

  useEffect(() => {
    stop();
  }, [messages, stop]);

  const handleSpeak = (id: string) => {
    const msg = messages.find((m) => m.id === id);
    if (msg) {
      speak(msg.content, id, language);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-dark-950">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-3 border-b border-dark-800 px-4 py-3 sm:px-6 glass">
        <div className="flex items-center gap-2">
          <SidebarToggle onClick={onToggleSidebar} />
          <div className="md:hidden">
            <LogoText size="text-base" />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-medium text-dark-200">
              {hasActiveConversation ? 'Suhbat' : 'Yangi suhbat'}
            </span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-dark-400">Onlayn</span>
          </div>
        </div>

        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-lg border border-dark-700 px-3 py-1.5 text-xs font-medium text-dark-300 transition-colors hover:border-shox-500/40 hover:text-white"
        >
          <PenSquare size={14} />
          <span className="hidden sm:inline">Yangi suhbat</span>
        </button>
      </header>

      {/* Usage limit banner */}
      {usageLimitReached && (
        <div className="mx-4 mt-3 sm:mx-6 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 animate-fade-in-up">
          <Zap size={18} className="flex-shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-200">Kunlik cheklovga yetdingiz</p>
            <p className="text-xs text-amber-300/80 mt-1">
              Bepul rejimda kuniga 20 ta xabar yuborishingiz mumkin.
              Ertaga davom eting yoki Premium rejimga o'ting.
            </p>
          </div>
          <button
            onClick={onClearError}
            className="flex-shrink-0 text-amber-400 hover:text-amber-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Generic error banner */}
      {error && !usageLimitReached && (
        <div className="mx-4 mt-3 sm:mx-6 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 animate-fade-in-up">
          <AlertCircle size={18} className="flex-shrink-0 text-red-400 mt-0.5" />
          <p className="flex-1 text-sm text-red-200">{error}</p>
          <button
            onClick={onClearError}
            className="flex-shrink-0 text-red-400 hover:text-red-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Messages or welcome screen */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeScreen onPromptClick={onSend} language={language} />
        ) : (
          <div className="mx-auto max-w-3xl pb-4">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLast={i === messages.length - 1 && !isGenerating}
                isSpeaking={speakingId === msg.id && isSpeaking}
                onSpeak={ttsSupported ? handleSpeak : undefined}
              />
            ))}
            {isGenerating && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput
        onSend={onSend}
        disabled={isGenerating || usageLimitReached}
        isRecording={isRecording}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
        onStopGeneration={onStopGeneration}
        isGenerating={isGenerating}
        language={language}
        onLanguageChange={onLanguageChange}
      />
    </div>
  );
}
