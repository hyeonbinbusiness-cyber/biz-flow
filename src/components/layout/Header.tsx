'use client';

import { Bell, Search, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  description?: string;
  onChatToggle?: () => void;
}

export default function Header({ title, description, onChatToggle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {description && (
            <p className="text-sm text-slate-500 mt-0.5">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          {searchOpen ? (
            <div className="animate-fade-in">
              <input
                type="text"
                placeholder="문서, 거래처 검색..."
                className="input-field w-64 !py-2 text-sm"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Notifications */}
          <button className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* AI Chat Toggle */}
          <button
            onClick={onChatToggle}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200 active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
            AI 도우미
          </button>
        </div>
      </div>
    </header>
  );
}
