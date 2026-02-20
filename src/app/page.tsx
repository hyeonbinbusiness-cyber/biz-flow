'use client';

import Header from '@/components/layout/Header';
import DashboardChat from '@/components/chat/DashboardChat';
import { useChatContext } from '@/contexts/ChatContext';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  ClipboardList,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { mockDashboardStats, mockDocuments } from '@/data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

function formatShortCurrency(amount: number): string {
  if (amount >= 10000000) {
    return (amount / 10000000).toFixed(1) + '천만';
  }
  if (amount >= 10000) {
    return (amount / 10000).toFixed(0) + '만';
  }
  return amount.toString();
}

const statusColorMap: Record<string, string> = {
  '승인완료': 'badge-success',
  '발행완료': 'badge-info',
  '전송완료': 'badge-warning',
  '작성중': 'badge-default',
};

export default function DashboardPage() {
  const { toggleChat } = useChatContext();
  const stats = mockDashboardStats;

  return (
    <div className="animate-fade-in">
      <Header
        title="대시보드"
        description="오늘의 재무 현황을 한눈에 확인하세요"
        onChatToggle={toggleChat}
      />

      <div className="p-8 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-500 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative">
            <h3 className="text-lg font-semibold mb-1">안녕하세요, 홍길동님!</h3>
            <p className="text-white/80 text-sm mb-4">
              이번 달 발행한 세금계산서 {stats.invoiceCount}건, 거래명세표 {stats.statementCount}건이 있습니다.
            </p>
            <div className="flex gap-3">
              <Link
                href="/invoices/new"
                className="inline-flex items-center gap-2 bg-white text-primary-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/90 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                세금계산서 발행
              </Link>
              <Link
                href="/statements/new"
                className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                거래명세표 발행
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">이번 달 매출</span>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {formatShortCurrency(stats.totalSales)}
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>전월 대비 29.5% 증가</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">이번 달 매입</span>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {formatShortCurrency(stats.totalPurchases)}
            </p>
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>전월 대비 10% 증가</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">세금계산서</span>
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.invoiceCount}건</p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>이번 달 발행</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">처리 대기</span>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.pendingCount}건</p>
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <span>승인 대기 중</span>
            </div>
          </div>
        </div>

        {/* Chart + Recent Documents + AI Chat */}
        <div className="grid grid-cols-3 gap-6">
          {/* Sales Chart */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-slate-900">월별 매출/매입 현황</h3>
                <p className="text-sm text-slate-500 mt-0.5">최근 6개월 추이</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlySales} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  tickFormatter={(value) => formatShortCurrency(value)}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="sales"
                  name="매출"
                  fill="#6366F1"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="purchases"
                  name="매입"
                  fill="#C7D2FE"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Documents */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">최근 문서</h3>
              <Link
                href="/documents"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                전체보기
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {mockDocuments.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      doc.type === 'tax_invoice'
                        ? 'bg-violet-50 text-violet-500'
                        : 'bg-blue-50 text-blue-500'
                    }`}
                  >
                    {doc.type === 'tax_invoice' ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <ClipboardList className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {doc.clientName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatCurrency(doc.amount)}
                    </p>
                  </div>
                  <span className={statusColorMap[doc.status] || 'badge-default'}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Chat Panel */}
          <DashboardChat />
        </div>
      </div>
    </div>
  );
}
