import { useState } from 'react';
import { Plus, MessageSquare, Trash2, X, Menu, Sparkles, Zap } from 'lucide-react';
import { LogoText } from './Logo';
import type { Conversation } from '@/types';
import type { UsageStatus } from '@/hooks/useUsage';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  usage: UsageStatus | null;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'hozir';
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  if (diffHr < 24) return `${diffHr} soat oldin`;
  if (diffDay < 7) return `${diffDay} kun oldin`;
  return date.toLocaleDateString('uz-UZ');
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onClose,
  usage,
}: SidebarProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const remaining = usage?.remaining ?? 20;
  const limit = usage?.limit ?? 20;
  const used = usage?.message_count ?? 0;
  const isPremium = usage?.plan === 'premium';
  const usagePercent = limit > 0 ? (used / limit) * 100 : 0;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:relative z-50 md:z-0 flex h-full w-[280px] flex-col border-r border-dark-800 bg-dark-990 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-dark-800">
          <LogoText />
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
            aria-label="Yopish"
          >
            <X size={20} />
          </button>
        </div>

        {/* New chat button */}
        <div className="p-3">
          <button
            onClick={onNew}
            className="group flex w-full items-center gap-3 rounded-xl border border-shox-500/30 bg-gradient-to-r from-shox-500/10 to-accent-cyan/5 px-4 py-3 text-sm font-medium text-white transition-all hover:border-shox-500/60 hover:from-shox-500/20 hover:to-accent-cyan/10"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-shox-500/20 group-hover:bg-shox-500/30 transition-colors">
              <Plus size={16} className="text-accent-cyan" />
            </div>
            Yangi suhbat
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-none">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <MessageSquare size={32} className="text-dark-600 mb-3" />
              <p className="text-sm text-dark-400">Suhbatlar tarixi bo'sh</p>
              <p className="text-xs text-dark-500 mt-1">
                Yangi suhbatni boshlash uchun tugmani bosing
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-dark-500">
                Suhbatlar
              </p>
              {conversations.map((convo) => (
                <div
                  key={convo.id}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all ${
                    activeId === convo.id
                      ? 'bg-shox-500/15 border border-shox-500/30'
                      : 'hover:bg-dark-800/60 border border-transparent'
                  }`}
                  onClick={() => onSelect(convo.id)}
                >
                  <MessageSquare
                    size={16}
                    className={
                      activeId === convo.id ? 'text-accent-cyan' : 'text-dark-500'
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`truncate text-sm ${
                        activeId === convo.id ? 'text-white font-medium' : 'text-dark-200'
                      }`}
                    >
                      {convo.title}
                    </p>
                    <p className="text-[11px] text-dark-500 mt-0.5">
                      {formatRelativeTime(convo.updated_at)}
                    </p>
                  </div>

                  {confirmDelete === convo.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(convo.id);
                          setConfirmDelete(null);
                        }}
                        className="rounded p-1 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(null);
                        }}
                        className="rounded p-1 text-dark-400 hover:bg-dark-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(convo.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 rounded p-1 text-dark-500 hover:text-red-400 hover:bg-dark-700 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Plan & Usage */}
        <div className="border-t border-dark-800 p-4 space-y-3">
          <div className="rounded-xl bg-dark-900/60 border border-dark-700 p-3.5 space-y-2.5">
            {/* Plan badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isPremium ? (
                  <Zap size={14} className="text-amber-400" />
                ) : (
                  <Sparkles size={14} className="text-accent-cyan" />
                )}
                <span className="text-sm font-semibold text-white">
                  {isPremium ? 'Premium' : 'Bepul rejim'}
                </span>
              </div>
              {!isPremium && (
                <span className="rounded-md bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                  Tez orada Premium
                </span>
              )}
            </div>

            {/* Usage bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-dark-400">Bugungi xabarlar</span>
                <span className={`font-medium ${remaining <= 3 ? 'text-amber-400' : 'text-dark-300'}`}>
                  {used} / {limit}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-dark-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usagePercent > 80
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
                      : 'bg-gradient-to-r from-shox-500 to-accent-cyan'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-dark-500">
                {remaining > 0
                  ? `${remaining} ta xabar qoldi`
                  : "Cheklov tugadi. Ertaga davom eting."}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
      aria-label="Menyu"
    >
      <Menu size={22} />
    </button>
  );
}
