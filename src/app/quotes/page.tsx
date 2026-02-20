'use client';

import Header from '@/components/layout/Header';
import { useChatContext } from '@/contexts/ChatContext';
import Link from 'next/link';
import { Plus, FilePen, Search, Filter, MoreHorizontal, Eye, ArrowRightCircle, Trash2 } from 'lucide-react';
import { mockQuotations } from '@/data/mockData';
import { useState } from 'react';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

const statusMap: Record<string, { label: string; class: string }> = {
  draft: { label: '작성중', class: 'badge-default' },
  sent: { label: '전송완료', class: 'badge-info' },
  accepted: { label: '수락됨', class: 'badge-success' },
  rejected: { label: '거절됨', class: 'bg-red-50 text-red-600 border border-red-100' },
  expired: { label: '만료됨', class: 'badge-warning' },
};

export default function QuotesPage() {
  const { toggleChat } = useChatContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = mockQuotations.filter((q) => {
    const matchSearch =
      q.receiver.companyName.includes(searchTerm) ||
      q.quotationNumber.includes(searchTerm) ||
      q.notes.includes(searchTerm);
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="animate-fade-in">
      <Header
        title="견적서"
        description="견적서를 작성하고 관리하세요"
        onChatToggle={toggleChat}
      />

      <div className="p-8 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="거래처명, 견적번호 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field !pl-10 !py-2.5 w-72 text-sm"
              />
            </div>

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
                  <option value="sent">전송완료</option>
                  <option value="accepted">수락됨</option>
                  <option value="rejected">거절됨</option>
                  <option value="expired">만료됨</option>
                </select>
              </button>
            </div>
          </div>

          <Link href="/quotes/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            새로 작성하기
          </Link>
        </div>

        {/* Info Banner */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FilePen className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-teal-900">
              총 {mockQuotations.length}건의 견적서가 있습니다
            </p>
            <p className="text-xs text-teal-700 mt-0.5">
              수락됨: {mockQuotations.filter(q => q.status === 'accepted').length}건 /
              대기중: {mockQuotations.filter(q => q.status === 'sent').length}건 /
              작성중: {mockQuotations.filter(q => q.status === 'draft').length}건
            </p>
          </div>
        </div>

        {/* Quotation List */}
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">발행일</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">견적번호</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">거래처</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">품목</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">공급가액</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">합계</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">유효기간</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr
                  key={q.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-slate-600">{q.issueDate}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">{q.quotationNumber}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-800">
                      {q.receiver.companyName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {q.items[0]?.description}
                    {q.items.length > 1 && ` 외 ${q.items.length - 1}건`}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 text-right font-medium">
                    {formatCurrency(q.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 text-right font-bold">
                    {formatCurrency(q.grandTotal)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 text-center">
                    {q.validUntil}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`${statusMap[q.status]?.class} badge`}>
                      {statusMap[q.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === q.id ? null : q.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenu === q.id && (
                      <div className="absolute right-6 top-12 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-10 min-w-[160px] animate-fade-in">
                        <button className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left">
                          <Eye className="w-4 h-4" /> 상세보기
                        </button>
                        {(q.status === 'accepted' || q.status === 'sent') && (
                          <Link
                            href="/invoices/new"
                            className="w-full px-4 py-2 text-sm text-teal-700 hover:bg-teal-50 flex items-center gap-2 text-left"
                          >
                            <ArrowRightCircle className="w-4 h-4" /> 세금계산서 변환
                          </Link>
                        )}
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
              <FilePen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">검색 결과가 없습니다</p>
              <p className="text-sm text-slate-400 mt-1">다른 검색어로 시도해보세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
