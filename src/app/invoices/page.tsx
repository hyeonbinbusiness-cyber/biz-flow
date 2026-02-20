'use client';

import Header from '@/components/layout/Header';
import { useChatContext } from '@/contexts/ChatContext';
import Link from 'next/link';
import { Plus, FileText, Search, Filter, MoreHorizontal, Eye, Send, Trash2 } from 'lucide-react';
import { mockInvoices } from '@/data/mockData';
import { useState } from 'react';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

const statusMap: Record<string, { label: string; class: string }> = {
  draft: { label: '작성중', class: 'badge-default' },
  issued: { label: '발행완료', class: 'badge-info' },
  sent: { label: '전송완료', class: 'badge-warning' },
  confirmed: { label: '승인완료', class: 'badge-success' },
  cancelled: { label: '취소', class: 'bg-red-50 text-red-600 border border-red-100' },
};

const typeMap: Record<string, string> = {
  regular: '정발행',
  reverse: '역발행',
};

export default function InvoicesPage() {
  const { toggleChat } = useChatContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = mockInvoices.filter((inv) => {
    const matchSearch =
      inv.receiver.companyName.includes(searchTerm) ||
      inv.supplier.companyName.includes(searchTerm) ||
      inv.memo.includes(searchTerm);
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="animate-fade-in">
      <Header
        title="세금계산서"
        description="세금계산서를 발행하고 관리하세요"
        onChatToggle={toggleChat}
      />

      <div className="p-8 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="거래처명, 메모 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field !pl-10 !py-2.5 w-72 text-sm"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <button className="btn-secondary !py-2.5 flex items-center gap-2 text-sm">
                <Filter className="w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-sm cursor-pointer"
                >
                  <option value="all">전체 상태</option>
                  <option value="draft">작성중</option>
                  <option value="issued">발행완료</option>
                  <option value="sent">전송완료</option>
                  <option value="confirmed">승인완료</option>
                </select>
              </button>
            </div>
          </div>

          <Link href="/invoices/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            새로 발행하기
          </Link>
        </div>

        {/* Info Banner */}
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary-900">
              이번 달 세금계산서 {mockInvoices.length}건이 있습니다
            </p>
            <p className="text-xs text-primary-700 mt-0.5">
              총 공급가액: {formatCurrency(mockInvoices.reduce((sum, inv) => sum + inv.totalSupplyAmount, 0))} /
              총 세액: {formatCurrency(mockInvoices.reduce((sum, inv) => sum + inv.totalTaxAmount, 0))}
            </p>
          </div>
        </div>

        {/* Invoice List */}
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">발행일</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">유형</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">거래처</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">품목</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">공급가액</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">세액</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">합계</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-slate-600">{inv.issueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                      inv.type === 'regular'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-orange-50 text-orange-700'
                    }`}>
                      {typeMap[inv.type]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-800">
                      {inv.receiver.companyName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {inv.items[0]?.description}
                    {inv.items.length > 1 && ` 외 ${inv.items.length - 1}건`}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 text-right font-medium">
                    {formatCurrency(inv.totalSupplyAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 text-right">
                    {formatCurrency(inv.totalTaxAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 text-right font-bold">
                    {formatCurrency(inv.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`${statusMap[inv.status]?.class} badge`}>
                      {statusMap[inv.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === inv.id ? null : inv.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenu === inv.id && (
                      <div className="absolute right-6 top-12 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-10 min-w-[140px] animate-fade-in">
                        <button className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left">
                          <Eye className="w-4 h-4" /> 상세보기
                        </button>
                        <button className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left">
                          <Send className="w-4 h-4" /> 전송하기
                        </button>
                        <button className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 text-left">
                          <Trash2 className="w-4 h-4" /> 삭제
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">검색 결과가 없습니다</p>
              <p className="text-sm text-slate-400 mt-1">다른 검색어로 시도해보세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
