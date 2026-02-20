'use client';

import Header from '@/components/layout/Header';
import { useChatContext } from '@/contexts/ChatContext';
import Link from 'next/link';
import { Plus, ClipboardList, Search, MoreHorizontal, Eye, Send, Trash2, Printer } from 'lucide-react';
import { mockStatements } from '@/data/mockData';
import { useState } from 'react';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

const statusMap: Record<string, { label: string; class: string }> = {
  draft: { label: '작성중', class: 'badge-default' },
  issued: { label: '발행완료', class: 'badge-info' },
  sent: { label: '전송완료', class: 'badge-warning' },
  confirmed: { label: '승인완료', class: 'badge-success' },
};

export default function StatementsPage() {
  const { toggleChat } = useChatContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = mockStatements.filter((st) =>
    st.receiver.companyName.includes(searchTerm) ||
    st.statementNumber.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in">
      <Header
        title="거래명세표"
        description="거래명세표를 발행하고 관리하세요"
        onChatToggle={toggleChat}
      />

      <div className="p-8 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="거래처명, 문서번호 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field !pl-10 !py-2.5 w-72 text-sm"
            />
          </div>

          <Link href="/statements/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            새로 발행하기
          </Link>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">
              거래명세표는 거래 내역을 상세히 기록한 증빙 서류입니다
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              세금계산서와 함께 발행하면 거래 내역을 더 명확하게 관리할 수 있어요
            </p>
          </div>
        </div>

        {/* Statement Cards */}
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((st) => (
            <div key={st.id} className="card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{st.receiver.companyName}</h3>
                      <span className={statusMap[st.status]?.class}>
                        {statusMap[st.status]?.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {st.statementNumber} · {st.issueDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(st.totalAmount)}
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === st.id ? null : st.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenu === st.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-10 min-w-[140px] animate-fade-in">
                        <button className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left">
                          <Eye className="w-4 h-4" /> 상세보기
                        </button>
                        <button className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left">
                          <Send className="w-4 h-4" /> 전송하기
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left"
                        >
                          <Printer className="w-4 h-4" /> 인쇄
                        </button>
                        <button className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 text-left">
                          <Trash2 className="w-4 h-4" /> 삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Preview */}
              <div className="bg-slate-50 rounded-xl p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 text-xs">
                      <th className="text-left pb-2 font-medium">품명</th>
                      <th className="text-left pb-2 font-medium">규격</th>
                      <th className="text-right pb-2 font-medium">수량</th>
                      <th className="text-right pb-2 font-medium">단가</th>
                      <th className="text-right pb-2 font-medium">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {st.items.map((item) => (
                      <tr key={item.id} className="border-t border-slate-200/50">
                        <td className="py-2 text-slate-700 font-medium">{item.productName}</td>
                        <td className="py-2 text-slate-500">{item.specification}</td>
                        <td className="py-2 text-right text-slate-600">{item.quantity} {item.unit}</td>
                        <td className="py-2 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-2 text-right font-medium text-slate-800">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">거래명세표가 없습니다</p>
              <p className="text-sm text-slate-400 mt-1 mb-4">새로운 거래명세표를 발행해보세요</p>
              <Link href="/statements/new" className="btn-primary inline-flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" />
                새로 발행하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
