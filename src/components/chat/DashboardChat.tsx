'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, User, MessageCircle, Square, ArrowRight, Bot, Maximize2 } from 'lucide-react';
import { ChatMessage } from '@/types';
import { parseMessageContent, CalcCard, ChecklistCard } from './chatUtils';
import { useChatContext } from '@/contexts/ChatContext';

const quickQuestions = [
  '이번 달 매출 현황',
  '세금계산서 발행 방법',
  '부가세 계산해줘',
  '이번 달 할 일',
];

export default function DashboardChat() {
  const router = useRouter();
  const pathname = usePathname();
  const { openChat } = useChatContext();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: '안녕하세요! 무엇을 도와드릴까요?\n\n아래 빠른 질문을 눌러보거나, 직접 입력해보세요.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInput('');
    setIsStreaming(true);

    const apiMessages = [...messages, userMessage]
      .filter((m) => m.id !== '0')
      .map((m) => ({ role: m.role, content: m.content }));

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, currentPage: pathname }),
        signal: abortController.signal,
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMessageId
                    ? { ...m, content: m.content + parsed.content }
                    : m
                )
              );
            }
          } catch {
            // skip
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        // cancelled
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId
              ? { ...m, content: m.content || '죄송합니다. 일시적인 오류가 발생했습니다.' }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [isStreaming, messages, pathname]);

  return (
    <div className="card flex flex-col h-[480px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">AI 도우미</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-slate-400 text-xs">Grok 4.1 Fast</span>
            </div>
          </div>
        </div>
        <button
          onClick={openChat}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
          title="전체 화면으로 열기"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant'
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {msg.role === 'assistant' ? (
                <Sparkles className="w-3.5 h-3.5" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-slate-50 text-slate-700 rounded-tl-md'
                  : 'bg-primary-600 text-white rounded-tr-md'
              }`}
            >
              {msg.role === 'assistant' ? (() => {
                const parts = parseMessageContent(msg.content);
                const textParts = parts.filter(p => p.type === 'text');
                const linkParts = parts.filter(p => p.type === 'link');
                const calcParts = parts.filter(p => p.type === 'calc');
                const checklistParts = parts.filter(p => p.type === 'checklist');
                return (
                  <>
                    <div className="px-3.5 py-2.5 chat-markdown">
                      <ReactMarkdown>{textParts.map(p => p.text).join('')}</ReactMarkdown>
                      {isStreaming && msg.id === messages[messages.length - 1]?.id && (
                        <span className="inline-block w-1.5 h-4 bg-primary-500 ml-0.5 animate-pulse rounded-sm" />
                      )}
                    </div>
                    {!isStreaming && calcParts.map((calc, i) => (
                      <CalcCard key={`calc-${i}`} items={calc.calcItems!} />
                    ))}
                    {!isStreaming && checklistParts.map((cl, i) => (
                      <ChecklistCard key={`check-${i}`} items={cl.checkItems!} />
                    ))}
                    {linkParts.length > 0 && !isStreaming && (
                      <div className="px-3 pb-2.5 flex flex-col gap-1.5">
                        {linkParts.map((link, i) => (
                          <button
                            key={i}
                            onClick={() => router.push(link.path!)}
                            className="flex items-center justify-between w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-xl text-xs font-medium text-primary-700 hover:bg-primary-100 transition-all group"
                          >
                            <span>{link.text}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-primary-400 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                );
              })() : (
                <div className="px-3.5 py-2.5 whitespace-pre-line">{msg.content}</div>
              )}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex gap-2 animate-fade-in">
            <div className="w-6 h-6 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-50 px-3.5 py-2.5 rounded-2xl rounded-tl-md">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && !isStreaming && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-1">
          <MessageCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && sendMessage(input)}
            placeholder="질문을 입력하세요..."
            className="flex-1 bg-transparent py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all active:scale-95"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="p-1.5 rounded-lg bg-primary-600 text-white disabled:opacity-30 hover:bg-primary-700 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
