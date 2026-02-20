'use client';

import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import ChatBot from '@/components/chat/ChatBot';
import { ChatProvider, useChatContext } from '@/contexts/ChatContext';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { chatOpen, closeChat } = useChatContext();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="max-w-[1400px]">
          {children}
        </div>
      </main>
      <ChatBot isOpen={chatOpen} onClose={closeChat} />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <title>BizFlow - 스마트 재무 관리</title>
        <meta name="description" content="초보자도 쉽게 사용하는 세금계산서 · 거래명세표 발행 플랫폼" />
      </head>
      <body>
        <ChatProvider>
          <LayoutInner>{children}</LayoutInner>
        </ChatProvider>
      </body>
    </html>
  );
}
