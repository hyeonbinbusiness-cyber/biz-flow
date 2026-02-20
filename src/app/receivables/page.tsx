'use client';

import Header from '@/components/layout/Header';
import { useChatContext } from '@/contexts/ChatContext';
import { AlertCircle, Banknote, Clock, AlertTriangle } from 'lucide-react';
import { mockReceivables } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

const statusMap: Record<string, { label: string; class: string }> = {
  current: { label: '정상', class: 'badge-success' },
  overdue_30: { label: '30일 연체', class: 'badge-warning' },
  overdue_60: { label: '60일 연체', class: 'bg-orange-50 text-orange-700 border border-orange-100' },
  overdue_90: { label: '90일+ 연체', class: 'bg-red-50 text-red-600 border border-red-100' },
};

export default function ReceivablesPage() {
  const { toggleChat } = useChatContext();

  const totalRemaining = mockReceivables.reduce((sum, r) => sum + r.remainingAmount, 0);
  const currentItems = mockReceivables.filter(r => r.status === 'current');
  const overdue30Items = mockReceivables.filter(r => r.status === 'overdue_30');
  const overdue60PlusItems = mockReceivables.filter(r => r.status === 'overdue_60' || r.status === 'overdue_90');

  const currentAmount = currentItems.reduce((sum, r) => sum + r.remainingAmount, 0);
  const overdue30Amount = overdue30Items.reduce((sum, r) => sum + r.remainingAmount, 0);
  const overdue60PlusAmount = overdue60PlusItems.reduce((sum, r) => sum + r.remainingAmount, 0);

  const agingData = [
    { name: '정상', amount: currentAmount, fill: '#10B981' },
    { name: '30일', amount: overdue30Amount, fill: '#F59E0B' },
    { name: '60일', amount: overdue60PlusItems.filter(r => r.status === 'overdue_60').reduce((sum, r) => sum + r.remainingAmount, 0), fill: '#F97316' },
    { name: '90일+', amount: overdue60PlusItems.filter(r => r.status === 'overdue_90').reduce((sum, r) => sum + r.remainingAmount, 0), fill: '#EF4444' },
  ];

  return (
    <div className="animate-fade-in">
      <Header
        title="미수금 관리"
        description="미수금 현황을 확인하고 관리하세요"
        onChatToggle={toggleChat}
      />

      <div className="p-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Banknote className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">총 미수금</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(totalRemaining)}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{mockReceivables.length}건</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">정상</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(currentAmount)}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{currentItems.length}건</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">30일 이내 연체</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(overdue30Amount)}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{overdue30Items.length}건</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">60일+ 연체</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(overdue60PlusAmount)}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{overdue60PlusItems.length}건</p>
          </div>
        </div>

        {/* Aging Chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">에이징 분석</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 10000).toLocaleString()}만`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '금액']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receivables Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">미수금 상세</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">거래처</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">세금계산서</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">청구일</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">결제기한</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">청구액</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">입금액</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">미수금</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {mockReceivables.map((r) => (
                <tr key={r.invoiceId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{r.clientName}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{r.invoiceNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 text-center">{r.invoiceDate}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 text-center">{r.dueDate}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 text-right">{formatCurrency(r.totalAmount)}</td>
                  <td className="px-6 py-4 text-sm text-emerald-600 text-right font-medium">{formatCurrency(r.paidAmount)}</td>
                  <td className="px-6 py-4 text-sm text-red-600 text-right font-bold">{formatCurrency(r.remainingAmount)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`${statusMap[r.status]?.class} badge`}>
                      {statusMap[r.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href="/payments"
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline"
                    >
                      입금 기록
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {mockReceivables.length === 0 && (
            <div className="py-16 text-center">
              <Banknote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">미수금이 없습니다</p>
              <p className="text-sm text-slate-400 mt-1">모든 대금이 정상적으로 입금되었습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
