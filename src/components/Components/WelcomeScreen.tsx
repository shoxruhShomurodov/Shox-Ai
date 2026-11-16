import { Sparkles, Code, BookOpen, Lightbulb, Languages } from 'lucide-react';
import { Logo } from './Logo';
import type { SpeechLanguage } from '@/hooks/useSpeechSynthesis';

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
  language: SpeechLanguage;
}

const CONTENT: Record<SpeechLanguage, {
  title: string;
  subtitle: string;
  suggestions: { icon: typeof Lightbulb; title: string; prompt: string; color: string; iconColor: string; borderColor: string }[];
}> = {
  uz: {
    title: "'ga xush kelibsiz",
    subtitle:
      "Sizning shaxsiy sun'iy intellekt yordamchingiz. Savol bering, kod yozing, g'oyalar oling va ko'p narsani o'rganing.",
    suggestions: [
      {
        icon: Lightbulb,
        title: "G'oya topish",
        prompt: 'Mening biznesim uchun 5 ta yangi g\'oya taklif eting',
        color: 'from-amber-500/20 to-orange-500/5',
        iconColor: 'text-amber-400',
        borderColor: 'border-amber-500/20',
      },
      {
        icon: Code,
        title: 'Kod yozish',
        prompt: 'React-da oddiy counter komponentini yozing va tushuntiring',
        color: 'from-shox-500/20 to-accent-cyan/5',
        iconColor: 'text-accent-cyan',
        borderColor: 'border-shox-500/20',
      },
      {
        icon: BookOpen,
        title: "O'rganish",
        prompt: "Sun'iy intellekt nima ekanligini oddiy so'zlar bilan tushuntiring",
        color: 'from-emerald-500/20 to-teal-500/5',
        iconColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/20',
      },
      {
        icon: Sparkles,
        title: 'Yordam',
        prompt: "O'zbek milliy taomlari retseptini yozib bering",
        color: 'from-rose-500/20 to-pink-500/5',
        iconColor: 'text-rose-400',
        borderColor: 'border-rose-500/20',
      },
    ],
  },
  ru: {
    title: ' — добро пожаловать',
    subtitle:
      'Ваш личный искусственный интеллект-помощник. Задавайте вопросы, пишите код, получайте идеи и узнавайте новое.',
    suggestions: [
      {
        icon: Lightbulb,
        title: 'Идеи',
        prompt: 'Предложите 5 новых идей для моего бизнеса',
        color: 'from-amber-500/20 to-orange-500/5',
        iconColor: 'text-amber-400',
        borderColor: 'border-amber-500/20',
      },
      {
        icon: Code,
        title: 'Код',
        prompt: 'Напиши простой counter компонент на React и объясни',
        color: 'from-shox-500/20 to-accent-cyan/5',
        iconColor: 'text-accent-cyan',
        borderColor: 'border-shox-500/20',
      },
      {
        icon: BookOpen,
        title: 'Обучение',
        prompt: 'Объясни простыми словами, что такое искусственный интеллект',
        color: 'from-emerald-500/20 to-teal-500/5',
        iconColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/20',
      },
      {
        icon: Sparkles,
        title: 'Помощь',
        prompt: 'Напиши рецепт узбекского национального блюда',
        color: 'from-rose-500/20 to-pink-500/5',
        iconColor: 'text-rose-400',
        borderColor: 'border-rose-500/20',
      },
    ],
  },
  en: {
    title: ' — welcome',
    subtitle:
      'Your personal AI assistant. Ask questions, write code, get ideas, and learn new things.',
    suggestions: [
      {
        icon: Lightbulb,
        title: 'Ideas',
        prompt: 'Suggest 5 new business ideas for me',
        color: 'from-amber-500/20 to-orange-500/5',
        iconColor: 'text-amber-400',
        borderColor: 'border-amber-500/20',
      },
      {
        icon: Code,
        title: 'Code',
        prompt: 'Write a simple counter component in React and explain it',
        color: 'from-shox-500/20 to-accent-cyan/5',
        iconColor: 'text-accent-cyan',
        borderColor: 'border-shox-500/20',
      },
      {
        icon: BookOpen,
        title: 'Learn',
        prompt: 'Explain what artificial intelligence is in simple terms',
        color: 'from-emerald-500/20 to-teal-500/5',
        iconColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/20',
      },
      {
        icon: Sparkles,
        title: 'Help',
        prompt: 'Write a recipe for a traditional Uzbek dish',
        color: 'from-rose-500/20 to-pink-500/5',
        iconColor: 'text-rose-400',
        borderColor: 'border-rose-500/20',
      },
    ],
  },
};

export function WelcomeScreen({ onPromptClick, language }: WelcomeScreenProps) {
  const content = CONTENT[language];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Logo with glow */}
        <div className="relative mb-6 animate-fade-in-up">
          <div className="absolute inset-0 blur-3xl bg-shox-500/20 rounded-full" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-shox-500/20 to-accent-cyan/10 border border-shox-500/30 glow-blue">
            <Logo size={64} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="gradient-text">SHOX AI</span>
          {content.title}
        </h1>
        <p className="text-sm text-dark-400 text-center mb-8 max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {content.subtitle}
        </p>

        {/* Language badge */}
        <div className="flex items-center gap-1.5 mb-6 rounded-full border border-dark-700 bg-dark-900/60 px-3 py-1.5 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <Languages size={13} className="text-accent-cyan" />
          <span className="text-xs text-dark-300">
            {language === 'uz' ? "O'zbek tili" : language === 'ru' ? 'Русский язык' : 'English'}
          </span>
        </div>

        {/* Suggestion cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {content.suggestions.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={i}
                onClick={() => onPromptClick(s.prompt)}
                className={`group flex items-start gap-3 rounded-xl border ${s.borderColor} bg-gradient-to-br ${s.color} p-4 text-left transition-all hover:border-shox-500/40 hover:scale-[1.02] animate-fade-in-up`}
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-dark-900/60 border border-dark-700">
                  <Icon size={18} className={s.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white mb-1">{s.title}</p>
                  <p className="text-xs text-dark-400 line-clamp-2">{s.prompt}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
