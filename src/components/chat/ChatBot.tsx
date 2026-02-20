'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { X, Send, Bot, User, Sparkles, MessageCircle, Square, ArrowRight, Calculator, CheckSquare, Square as SquareIcon } from 'lucide-react';
import { ChatMessage } from '@/types';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickQuestions = [
  '세금계산서 발행 방법 알려줘',
  '이번 달 매출 현황 알려줘',
  '부가가치세 계산해줘',
  '이번 달 할 일 알려줘',
];

interface ParsedPart {
  type: 'text' | 'link' | 'calc' | 'checklist';
  text: string;
  path?: string;
  calcItems?: { label: string; value: string }[];
  checkItems?: string[];
}

function parseMessageContent(content: string): ParsedPart[] {
  const parts: ParsedPart[] = [];
  let remaining = content;

  // Process all special patterns
  const patterns = [
    { regex: /\{\{calc\|(.+?)\}\}/g, type: 'calc' as const },
    { regex: /\{\{checklist\|(.+?)\}\}/g, type: 'checklist' as const },
    { regex: /\[\[(.+?)\|(.+?)\]\]/g, type: 'link' as const },
  ];

  // Collect all matches with positions
  const allMatches: { index: number; length: number; part: ParsedPart }[] = [];

  for (const { regex, type } of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (type === 'calc') {
        const items = match[1].split('|').map(item => {
          const [label, value] = item.split(':');
          return { label: label?.trim() || '', value: value?.trim() || '' };
        });
        allMatches.push({
          index: match.index,
          length: match[0].length,
          part: { type: 'calc', text: '', calcItems: items },
        });
      } else if (type === 'checklist') {
        const items = match[1].split('|').map(s => s.trim());
        allMatches.push({
          index: match.index,
          length: match[0].length,
          part: { type: 'checklist', text: '', checkItems: items },
        });
      } else if (type === 'link') {
        allMatches.push({
          index: match.index,
          length: match[0].length,
          part: { type: 'link', text: match[1], path: match[2] },
        });
      }
    }
  }

  // Sort by position
  allMatches.sort((a, b) => a.index - b.index);

  // Build parts array
  let lastIndex = 0;
  for (const m of allMatches) {
    if (m.index > lastIndex) {
      parts.push({ type: 'text', text: content.slice(lastIndex, m.index) });
    }
    parts.push(m.part);
    lastIndex = m.index + m.length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', text: content.slice(lastIndex) });
  }

  if (parts.length === 0 && remaining) {
    parts.push({ type: 'text', text: remaining });
  }

  return parts;
}

function CalcCard({ items }: { items: { label: string; value: string }[] }) {
  const lastItem = items[items.length - 1];
  const regularItems = items.slice(0, -1);

  return (
    <div className="mx-3 mb-3 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-100/50 border-b border-blue-200">
        <Calculator className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-blue-700">계산 결과</span>
      </div>
      <div className="px-3 py-2 space-y-1">
        {regularItems.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-xs">
            <span className="text-slate-600">{item.label}</span>
            <span className="text-slate-800 font-medium">{item.value}</span>
          </div>
        ))}
        {lastItem && (
          <div className="flex justify-between items-center text-sm pt-1.5 mt-1.5 border-t border-blue-200">
            <span className="font-semibold text-blue-700">{lastItem.label}</span>
            <span className="font-bold text-blue-800">{lastItem.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ChecklistCard({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(new Array(items.length).fill(false));

  const toggle = (index: number) => {
    setChecked(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const doneCount = checked.filter(Boolean).length;

  return (
    <div className="mx-3 mb-3 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-emerald-100/50 border-b border-emerald-200">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">체크리스트</span>
        </div>
        <span className="text-xs text-emerald-600">{doneCount}/{items.length}</span>
      </div>
      <div className="px-3 py-2 space-y-1">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="flex items-center gap-2 w-full text-left py-1 group"
          >
            {checked[i] ? (
              <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <SquareIcon className="w-4 h-4 text-slate-300 group-hover:text-emerald-400 flex-shrink-0 transition-colors" />
            )}
            <span className={`text-xs transition-all ${checked[i] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
              {item}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: '안녕하세요! BizFlow AI 어시스턴트입니다.\n\n세금계산서, 거래명세표, 부가가치세 등 재무 관련 궁금한 것이 있으시면 편하게 물어보세요!',
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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

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

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

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
            // skip invalid JSON
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId
              ? { ...m, content: m.content || '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.' }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [isStreaming, messages, pathname]);

  const handleSend = () => {
    sendMessage(input);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-6 bottom-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">AI 도우미</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/70 text-xs">Grok 4.1 Fast</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 animate-fade-in ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant'
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {msg.role === 'assistant' ? (
                <Sparkles className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div
              className={`max-w-[280px] rounded-2xl text-sm leading-relaxed ${
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
                    <div className="px-4 py-3 chat-markdown">
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
                      <div className="px-3 pb-3 flex flex-col gap-1.5">
                        {linkParts.map((link, i) => (
                          <button
                            key={i}
                            onClick={() => { router.push(link.path!); onClose(); }}
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
                <div className="px-4 py-3 whitespace-pre-line">{msg.content}</div>
              )}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex gap-2.5 animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 px-4 py-3 rounded-2xl rounded-tl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && !isStreaming && (
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-400 mb-2">자주 묻는 질문</p>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleQuickQuestion(q)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all"
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
            onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSend()}
            placeholder="질문을 입력하세요..."
            className="flex-1 bg-transparent py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all active:scale-95"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 rounded-lg bg-primary-600 text-white disabled:opacity-30 hover:bg-primary-700 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
