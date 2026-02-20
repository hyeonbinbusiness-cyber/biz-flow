'use client';

import Header from '@/components/layout/Header';
import { useChatContext } from '@/contexts/ChatContext';
import { useState } from 'react';
import { Calculator, AlertTriangle, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { mockInvoices } from '@/data/mockData';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

const periods = [
  { id: '2026-1q', label: '2026년 1기 예정 (1~3월)' },
  { id: '2026-1h', label: '2026년 1기 확정 (1~6월)' },
  { id: '2025-2q', label: '2025년 2기 예정 (7~9월)' },
  { id: '2025-2h', label: '2025년 2기 확정 (7~12월)' },
];

export default function VATReturnPage() {
  const { toggleChat } = useChatContext();
  const [selectedPeriod, setSelectedPeriod] = useState('2026-1q');

  // Filter invoices by period (for demo, show all Feb 2026 invoices)
  const salesInvoices = mockInvoices.filter(
    (inv) => inv.supplier.companyName === '우리회사' && inv.type === 'regular'
  );
  const purchaseInvoices = mockInvoices.filter(
    (inv) => inv.receiver.companyName === '우리회사' && inv.type === 'reverse'
  );

  const totalSalesSupply = salesInvoices.reduce((sum, inv) => sum + inv.totalSupplyAmount, 0);
  const totalSalesTax = salesInvoices.reduce((sum, inv) => sum + inv.totalTaxAmount, 0);
  const totalPurchaseSupply = purchaseInvoices.reduce((sum, inv) => sum + inv.totalSupplyAmount, 0);
  const totalPurchaseTax = purchaseInvoices.reduce((sum, inv) => sum + inv.totalTaxAmount, 0);
  const vatPayable = totalSalesTax - totalPurchaseTax;

  return (
    <div className="animate-fade-in">
      <Header
        title="부가세 미리보기"
        description="부가가치세 신고 자료를 미리 확인하세요"
        onChatToggle={toggleChat}
      />

      <div className="p-8 space-y-6">
        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-900">
              미리보기 전용 - 실제 신고가 아닙니다
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              이 자료는 참고용이며, 실제 부가세 신고는 홈택스에서 진행해주세요. 데이터는 BizFlow에 등록된 세금계산서를 기준으로 계산됩니다.
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">신고 기간:</span>
            <div className="flex gap-2">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === period.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">매출세액</p>
                <p className="text-xs text-slate-400">{salesInvoices.length}건</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-1">공급가액</p>
            <p className="text-lg font-bold text-slate-900 mb-2">{formatCurrency(totalSalesSupply)}</p>
            <p className="text-sm text-slate-500 mb-1">세액</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totalSalesTax)}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">매입세액</p>
                <p className="text-xs text-slate-400">{purchaseInvoices.length}건</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-1">공급가액</p>
            <p className="text-lg font-bold text-slate-900 mb-2">{formatCurrency(totalPurchaseSupply)}</p>
            <p className="text-sm text-slate-500 mb-1">세액</p>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(totalPurchaseTax)}</p>
          </div>

          <div className={`card p-6 ${vatPayable > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${vatPayable > 0 ? 'bg-red-100' : 'bg-emerald-100'}`}>
                <Calculator className={`w-5 h-5 ${vatPayable > 0 ? 'text-red-600' : 'text-emerald-600'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {vatPayable > 0 ? '납부할 세액' : '환급받을 세액'}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-1">매출세액 - 매입세액</p>
            <p className={`text-2xl font-bold ${vatPayable > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatCurrency(Math.abs(vatPayable))}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {formatCurrency(totalSalesTax)} - {formatCurrency(totalPurchaseTax)}
            </p>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-2 gap-6">
          {/* Sales Invoices */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">매출 세금계산서</h3>
              <span className="text-sm text-blue-600 font-medium">{salesInvoices.length}건</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">발행일</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">거래처</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">공급가액</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">세액</th>
                </tr>
              </thead>
              <tbody>
                {salesInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 text-slate-600">{inv.issueDate}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{inv.receiver.companyName}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(inv.totalSupplyAmount)}</td>
                    <td className="px-4 py-3 text-right font-medium text-blue-600">{formatCurrency(inv.totalTaxAmount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50/50">
                  <td colSpan={2} className="px-4 py-3 font-semibold text-slate-700">합계</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(totalSalesSupply)}</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-700">{formatCurrency(totalSalesTax)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Purchase Invoices */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">매입 세금계산서</h3>
              <span className="text-sm text-orange-600 font-medium">{purchaseInvoices.length}건</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">발행일</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">거래처</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">공급가액</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">세액</th>
                </tr>
              </thead>
              <tbody>
                {purchaseInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 text-slate-600">{inv.issueDate}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{inv.supplier.companyName}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(inv.totalSupplyAmount)}</td>
                    <td className="px-4 py-3 text-right font-medium text-orange-600">{formatCurrency(inv.totalTaxAmount)}</td>
                  </tr>
                ))}
                {purchaseInvoices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      매입 세금계산서가 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-orange-50/50">
                  <td colSpan={2} className="px-4 py-3 font-semibold text-slate-700">합계</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(totalPurchaseSupply)}</td>
                  <td className="px-4 py-3 text-right font-bold text-orange-700">{formatCurrency(totalPurchaseTax)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Calculation Summary */}
        <div className="card p-6 bg-gradient-to-r from-slate-50 to-primary-50">
          <h3 className="font-semibold text-slate-900 mb-4">부가세 계산 요약</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center p-4 bg-white rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">매출세액</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(totalSalesTax)}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div className="flex-1 text-center p-4 bg-white rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">매입세액</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(totalPurchaseTax)}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div className={`flex-1 text-center p-4 rounded-xl border ${
              vatPayable > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
            }`}>
              <p className="text-xs text-slate-500 mb-1">
                {vatPayable > 0 ? '납부세액' : '환급세액'}
              </p>
              <p className={`text-xl font-bold ${vatPayable > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatCurrency(Math.abs(vatPayable))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
