import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/ChatArea';
import { SettingsModal } from '@/components/SettingsModal';
import { useChat } from '@/hooks/useChat';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { supabase } from '@/lib/supabase';
import type { SpeechLanguage } from '@/hooks/useSpeechSynthesis';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [language, setLanguage] = useState<SpeechLanguage>('uz');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keyCheckNonce, setKeyCheckNonce] = useState(0);

  const {
    conversations,
    activeConversation,
    messages,
    loading,
    isGenerating,
    isRecording,
    error,
    apiKeyMissing,
    selectConversation,
    startNewConversation,
    sendMessage,
    deleteConversation,
    stopGeneration,
    setIsRecording,
  } = useChat(language, keyCheckNonce);

  const { stop: stopTTS } = useSpeechSynthesis();

  const displayError = error || localError;

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    setSidebarOpen(false);
    stopTTS();
  };

  const handleNewConversation = () => {
    startNewConversation();
    setSidebarOpen(false);
    stopTTS();
  };

  const handleLanguageChange = (lang: SpeechLanguage) => {
    setLanguage(lang);
    stopTTS();
  };

  const handleClearError = () => {
    setLocalError(null);
  };

  const handleOpenSettings = () => {
    setSettingsOpen(true);
    setSidebarOpen(false);
  };

  const handleSettingsSaved = () => {
    // Trigger a re-check of the API key status in useChat
    setKeyCheckNonce((n) => n + 1);
  };

  // Check API key status on mount
  useEffect(() => {
    supabase.rpc('has_openai_key').then(({ data }) => {
      if (!data) {
        setKeyCheckNonce((n) => n + 1);
      }
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-dark-990">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-shox-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-accent-cyan/5 blur-3xl" />
      </div>

      {/* Sidebar */}
      <div className="relative z-10">
        <Sidebar
          conversations={conversations}
          activeId={activeConversation?.id ?? null}
          onSelect={handleSelectConversation}
          onNew={handleNewConversation}
          onDelete={deleteConversation}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenSettings={handleOpenSettings}
        />
      </div>

      {/* Main chat area */}
      <div className="relative z-10 flex flex-1 flex-col">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 rounded-full border-2 border-shox-500/20 border-t-shox-500 animate-spin" />
              <p className="text-sm text-dark-400">Yuklanmoqda...</p>
            </div>
          </div>
        ) : (
          <ChatArea
            messages={messages}
            isGenerating={isGenerating}
            isRecording={isRecording}
            error={displayError}
            apiKeyMissing={apiKeyMissing}
            onClearError={handleClearError}
            onToggleSidebar={() => setSidebarOpen(true)}
            onStartRecording={() => setIsRecording(true)}
            onStopRecording={() => setIsRecording(false)}
            onStopGeneration={stopGeneration}
            onNewChat={handleNewConversation}
            onSend={sendMessage}
            hasActiveConversation={!!activeConversation}
            language={language}
            onLanguageChange={handleLanguageChange}
            onOpenSettings={handleOpenSettings}
          />
        )}
      </div>

      {/* Settings modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={handleSettingsSaved}
      />
    </div>
  );
}

export default App;
