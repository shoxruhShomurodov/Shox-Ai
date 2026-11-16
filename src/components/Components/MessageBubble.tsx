import { useState } from 'react';
import { Copy, Check, User, Sparkles, Volume2, Square } from 'lucide-react';
import { Logo } from './Logo';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
  isSpeaking?: boolean;
  onSpeak?: (id: string) => void;
}

function formatText(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  html = html.replace(/^\s*[-•]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  html = html.replace(/^\s*(\d+)\.\s+(.+)$/gm, '<li>$2</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+(?!<ul>)/g, (match) => {
    return match.includes('<ul>') ? match : `<ol>${match}</ol>`;
  });

  html = html
    .split('\n\n')
    .map((block) => {
      if (block.startsWith('<pre>') || block.startsWith('<ul>') || block.startsWith('<ol>')) {
        return block;
      }
      return block.trim() ? `<p>${block.replace(/\n/g, '<br/>')}</p>` : '';
    })
    .join('\n');

  return html;
}

export function MessageBubble({ message, isLast, isSpeaking, onSpeak }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group flex gap-3 sm:gap-4 px-4 py-5 sm:px-6 animate-fade-in-up ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark-700 border border-dark-600">
            <User size={16} className="text-dark-300" />
          </div>
        ) : (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-shox-500/30 to-accent-cyan/10 border border-shox-500/30 ${isSpeaking ? 'glow-blue' : ''}`}>
            <Logo size={32} />
          </div>
        )}
      </div>

      {/* Message content */}
      <div className={`flex flex-col gap-1.5 max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-dark-300">
            {isUser ? 'Siz' : 'SHOX AI'}
          </span>
          {!isUser && (
            <Sparkles size={12} className="text-accent-cyan/60" />
          )}
        </div>

        <div
          className={`message-content rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-shox-500/15 border border-shox-500/25 text-white rounded-tr-sm'
              : 'bg-dark-800/60 border border-dark-700 text-dark-100 rounded-tl-sm'
          } ${isLast ? 'animate-pulse-glow' : ''}`}
          dangerouslySetInnerHTML={{ __html: formatText(message.content) }}
        />

        {/* Action buttons */}
        <div className={`flex items-center gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-dark-500 hover:text-dark-300 transition-colors opacity-0 group-hover:opacity-100"
          >
            {copied ? (
              <>
                <Check size={12} /> Nusxalandi
              </>
            ) : (
              <>
                <Copy size={12} /> Nusxa olish
              </>
            )}
          </button>

          {!isUser && onSpeak && (
            <button
              onClick={() => onSpeak(message.id)}
              className={`flex items-center gap-1 text-[11px] transition-colors ${
                isSpeaking
                  ? 'text-accent-cyan opacity-100'
                  : 'text-dark-500 hover:text-accent-cyan opacity-0 group-hover:opacity-100'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Square size={11} className="fill-current" /> To'xtatish
                </>
              ) : (
                <>
                  <Volume2 size={12} /> Ovozda eshitish
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 sm:gap-4 px-4 py-5 sm:px-6 animate-fade-in">
      <div className="flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-shox-500/30 to-accent-cyan/10 border border-shox-500/30 glow-blue">
          <Logo size={32} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-dark-300">SHOX AI</span>
        <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-dark-800/60 border border-dark-700 px-4 py-3.5">
          <span className="text-xs text-dark-400 mr-1">yozmoqda</span>
          <div className="flex gap-1">
            <span
              className="h-2 w-2 rounded-full bg-accent-cyan animate-bounce-dot"
              style={{ animationDelay: '0s' }}
            />
            <span
              className="h-2 w-2 rounded-full bg-accent-cyan animate-bounce-dot"
              style={{ animationDelay: '0.2s' }}
            />
            <span
              className="h-2 w-2 rounded-full bg-accent-cyan animate-bounce-dot"
              style={{ animationDelay: '0.4s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
