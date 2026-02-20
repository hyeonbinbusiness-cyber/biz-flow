'use client';

import { useState } from 'react';
import { Calculator, CheckSquare, Square as SquareIcon } from 'lucide-react';

export interface ParsedPart {
  type: 'text' | 'link' | 'calc' | 'checklist';
  text: string;
  path?: string;
  calcItems?: { label: string; value: string }[];
  checkItems?: string[];
}

export function parseMessageContent(content: string): ParsedPart[] {
  const parts: ParsedPart[] = [];

  const patterns = [
    { regex: /\{\{calc\|(.+?)\}\}/g, type: 'calc' as const },
    { regex: /\{\{checklist\|(.+?)\}\}/g, type: 'checklist' as const },
    { regex: /\[\[(.+?)\|(.+?)\]\]/g, type: 'link' as const },
  ];

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

  allMatches.sort((a, b) => a.index - b.index);

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

  if (parts.length === 0) {
    parts.push({ type: 'text', text: content });
  }

  return parts;
}

export function CalcCard({ items }: { items: { label: string; value: string }[] }) {
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

export function ChecklistCard({ items }: { items: string[] }) {
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
