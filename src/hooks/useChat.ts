import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getClientId } from '@/lib/clientId';
import type { Conversation, Message } from '@/types';
import type { SpeechLanguage } from '@/hooks/useSpeechSynthesis';
import type { UsageStatus } from '@/hooks/useUsage';

interface UseChatReturn {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  isGenerating: boolean;
  isRecording: boolean;
  error: string | null;
  usageLimitReached: boolean;
  selectConversation: (id: string) => void;
  startNewConversation: () => void;
  sendMessage: (text: string) => Promise<void>;
  deleteConversation: (id: string) => void;
  stopGeneration: () => void;
  setIsRecording: (v: boolean) => void;
}

function generateTitle(text: string): string {
  const trimmed = text.trim().replace(/\n/g, ' ');
  if (trimmed.length <= 40) return trimmed;
  return trimmed.slice(0, 40) + '...';
}

const ERROR_MESSAGES: Record<string, string> = {
  API_KEY_MISSING: "Serverda OpenAI API kaliti sozlanmagan. Iltimos, administrator bilan bog'laning.",
  API_KEY_INVALID: 'OpenAI API kaliti yaroqsiz.',
  RATE_LIMITED: "So'rovlar soni chegaradan oshdi. Iltimos, biroz kuting.",
  AI_ERROR: "AI javob berishda xatolik. Iltimos, qayta urinib ko'ring.",
  SERVER_ERROR: 'Server xatosi. Iltimos, qayta urinib ko\'ring.',
  USAGE_LIMIT_EXCEEDED: "Kunlik cheklovga yetdingiz. Ertaga davom eting yoki Premium rejimga o'ting.",
};

export function useChat(
  language: SpeechLanguage,
  onUsageUpdate?: () => void
): UseChatReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageLimitReached, setUsageLimitReached] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const languageRef = useRef<SpeechLanguage>(language);
  const onUsageUpdateRef = useRef(onUsageUpdate);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    onUsageUpdateRef.current = onUsageUpdate;
  }, [onUsageUpdate]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (err) {
      setError('Suhbatlarni yuklashda xatolik yuz berdi');
      setLoading(false);
      return;
    }

    setConversations(data || []);
    setLoading(false);
  };

  const selectConversation = useCallback(
    async (id: string) => {
      const convo = conversations.find((c) => c.id === id);
      if (convo) {
        setActiveConversation(convo);
        const { data, error: err } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', id)
          .order('created_at', { ascending: true });

        if (err) {
          setError('Xabarlarni yuklashda xatolik');
          return;
        }

        setMessages(data || []);
      }
    },
    [conversations]
  );

  const startNewConversation = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
    setError(null);
    setUsageLimitReached(false);
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      const { error: err } = await supabase.from('conversations').delete().eq('id', id);

      if (err) {
        setError('Suhbatni o\'chirishda xatolik');
        return;
      }

      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversation?.id === id) {
        setActiveConversation(null);
        setMessages([]);
      }
    },
    [activeConversation]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      setError(null);
      setUsageLimitReached(false);
      setIsGenerating(true);

      let conversationId: string = activeConversation?.id ?? '';
      let currentMessages = messages;

      // Create conversation if needed
      if (!conversationId) {
        const { data: newConvo, error: convoErr } = await supabase
          .from('conversations')
          .insert({
            title: generateTitle(text),
          })
          .select()
          .single();

        if (convoErr || !newConvo) {
          setError('Suhbat yaratishda xatolik');
          setIsGenerating(false);
          return;
        }

        conversationId = newConvo.id;
        setActiveConversation(newConvo);
        setConversations((prev) => [newConvo, ...prev]);
      }

      // Save user message
      const { data: userMsg, error: msgErr } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: text,
        })
        .select()
        .single();

      if (msgErr || !userMsg) {
        setError('Xabar yuborishda xatolik');
        setIsGenerating(false);
        return;
      }

      currentMessages = [...currentMessages, userMsg];
      setMessages(currentMessages);

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Call the AI edge function
      abortRef.current = new AbortController();

      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
        const headers = {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            messages: currentMessages.map((m) => ({ role: m.role, content: m.content })),
            language: languageRef.current,
            client_id: getClientId(),
          }),
          signal: abortRef.current.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === 'USAGE_LIMIT_EXCEEDED') {
            setUsageLimitReached(true);
            // Refresh usage display
            onUsageUpdateRef.current?.();
            throw new Error(data.message || ERROR_MESSAGES.USAGE_LIMIT_EXCEEDED);
          }
          if (data.error && ERROR_MESSAGES[data.error]) {
            throw new Error(ERROR_MESSAGES[data.error]);
          }
          if (data.error && data.message) {
            throw new Error(data.message);
          }
          throw new Error(`So'rov bajarilmadi (${response.status})`);
        }

        if (data.error) {
          throw new Error(data.error);
        }

        const reply: string = data.reply || 'Kechirisiz, javob bera olmadim.';

        // Save assistant message
        const { data: assistantMsg, error: assistantErr } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: reply,
          })
          .select()
          .single();

        if (assistantErr || !assistantMsg) {
          setError('AI javobini saqlashda xatolik');
          setIsGenerating(false);
          return;
        }

        setMessages((prev) => [...prev, assistantMsg]);

        // Update conversation in sidebar
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === conversationId
              ? { ...c, updated_at: new Date().toISOString() }
              : c
          );
          return updated.sort(
            (a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
        });

        // Refresh usage display after successful message
        onUsageUpdateRef.current?.();
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // User stopped generation
        } else {
          const errorMsg =
            err instanceof Error ? err.message : 'Noma\'lum xatolik yuz berdi';
          setError(errorMsg);
        }
      } finally {
        setIsGenerating(false);
        abortRef.current = null;
      }
    },
    [activeConversation, messages]
  );

  const stopGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setIsGenerating(false);
  }, []);

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    isGenerating,
    isRecording,
    error,
    usageLimitReached,
    selectConversation,
    startNewConversation,
    sendMessage,
    deleteConversation,
    stopGeneration,
    setIsRecording,
  };
}
