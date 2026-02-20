'use client';

import Header from '@/components/layout/Header';
import { useChatContext } from '@/contexts/ChatContext';
import { useState } from 'react';
import {
  Search,
  FileText,
  ClipboardList,
  FolderOpen,
  Download,
  Calendar,
  FilePen,
  Receipt,
} from 'lucide-react';
import { mockDocuments } from '@/data/mockData';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

const statusColorMap: Record<string, string> = {
  '승인완료': 'badge-success',
  '발행완료': 'badge-info',
  '전송완료': 'badge-warning',
  '작성중': 'badge-default',
  '수락됨': 'badge-success',
  '거절됨': 'bg-red-50 text-red-600 border border-red-100',
  '만료됨': 'badge-warning',
  '완료': 'badge-success',
};

const docTypeConfig: Record<string, { icon: React.ElementType; bgClass: string; hoverClass: string; label: string }> = {
  tax_invoice: { icon: FileText, bgClass: 'bg-violet-50 text-violet-500', hoverClass: 'group-hover:bg-violet-100', label: '세금계산서' },
  statement: { icon: ClipboardList, bgClass: 'bg-blue-50 text-blue-500', hoverClass: 'group-hover:bg-blue-100', label: '거래명세표' },
  quotation: { icon: FilePen, bgClass: 'bg-teal-50 text-teal-500', hoverClass: 'group-hover:bg-teal-100', label: '견적서' },
  payment_receipt: { icon: Receipt, bgClass: 'bg-green-50 text-green-500', hoverClass: 'group-hover:bg-green-100', label: '입금표' },
};

export default function DocumentsPage() {
  const { toggleChat } = useChatContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = mockDocuments.filter((doc) => {
    const matchSearch =
      doc.title.includes(searchTerm) ||
      doc.clientName.includes(searchTerm);
    const matchType =
      typeFilter === 'all' ||
      (typeFilter === 'invoice' && doc.type === 'tax_invoice') ||
      (typeFilter === 'statement' && doc.type === 'statement') ||
      (typeFilter === 'quotation' && doc.type === 'quotation') ||
      (typeFilter === 'payment' && doc.type === 'payment_receipt');
    return matchSearch && matchType;
  });

  const totalAmount = filtered.reduce((sum, doc) => sum + doc.amount, 0);

  return (
    <div className="animate-fade-in">
      <Header
        title="문서함"
        description="발행된 모든 문서를 한곳에서 관리하세요"
        onChatToggle={toggleChat}
      />

      <div className="p-8 space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="문서 제목, 거래처명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field !pl-10 !py-2.5 w-72 text-sm"
              />
            </div>

            {/* Type Filter Tabs */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              {[
                { key: 'all', label: '전체' },
                { key: 'invoice', label: '세금계산서' },
                { key: 'statement', label: '거래명세표' },
                { key: 'quotation', label: '견적서' },
                { key: 'payment', label: '입금표' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTypeFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === tab.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{filtered.length}건</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-slate-700">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((doc) => {
            const config = docTypeConfig[doc.type] || docTypeConfig.tax_invoice;
            const DocIcon = config.icon;
            return (
              <div
                key={`${doc.type}-${doc.id}`}
                className="card-hover p-5 flex items-center gap-4 cursor-pointer group"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bgClass} ${config.hoverClass} transition-colors`}>
                  <DocIcon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {doc.title}
                    </h3>
                    <span className={statusColorMap[doc.status] || 'badge-default'}>
                      {doc.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>{doc.clientName}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {doc.createdAt}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-900">{formatCurrency(doc.amount)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{config.label}</p>
                </div>

                <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">문서가 없습니다</p>
            <p className="text-sm text-slate-400 mt-1">
              세금계산서나 거래명세표를 발행하면 여기에 표시됩니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
