'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  chatOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType>({
  chatOpen: false,
  toggleChat: () => {},
  openChat: () => {},
  closeChat: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <ChatContext.Provider
      value={{
        chatOpen,
        toggleChat: () => setChatOpen((prev) => !prev),
        openChat: () => setChatOpen(true),
        closeChat: () => setChatOpen(false),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
