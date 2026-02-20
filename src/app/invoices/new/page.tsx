'use client';

import Header from '@/components/layout/Header';
import { useChatContext } from '@/contexts/ChatContext';
import { useState } from 'react';
import {
  ChevronRight,
  Check,
  Building2,
  FileText,
  Eye,
  Plus,
  Trash2,
  ArrowLeft,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { mockClients } from '@/data/mockData';
import { InvoiceItem } from '@/types';

const steps = [
  { id: 1, title: '거래처 선택', description: '공급받는 자 정보', icon: Building2 },
  { id: 2, title: '품목 입력', description: '거래 내역 작성', icon: FileText },
  { id: 3, title: '미리보기 & 발행', description: '최종 확인', icon: Eye },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount);
}

export default function NewInvoicePage() {
  const { toggleChat } = useChatContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [invoiceType, setInvoiceType] = useState<'regular' | 'reverse'>('regular');
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      date: new Date().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('. ', '/').replace('.', ''),
      description: '',
      specification: '',
      quantity: 1,
      unitPrice: 0,
      supplyAmount: 0,
      taxAmount: 0,
    },
  ]);
  const [memo, setMemo] = useState('');
  const [isIssued, setIsIssued] = useState(false);

  const client = mockClients.find((c) => c.id === selectedClient);

  const totalSupply = items.reduce((sum, item) => sum + item.supplyAmount, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const totalAmount = totalSupply + totalTax;

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('. ', '/').replace('.', ''),
        description: '',
        specification: '',
        quantity: 1,
        unitPrice: 0,
        supplyAmount: 0,
        taxAmount: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? Number(value) : item.quantity;
          const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
          updated.supplyAmount = qty * price;
          updated.taxAmount = Math.round(qty * price * 0.1);
        }
        return updated;
      })
    );
  };

  const handleIssue = () => {
    setIsIssued(true);
  };

  const canProceed = () => {
    if (currentStep === 1) return !!selectedClient;
    if (currentStep === 2) return items.some((item) => item.description && item.unitPrice > 0);
    return true;
  };

  if (isIssued) {
    return (
      <div className="animate-fade-in">
        <Header title="세금계산서 발행" onChatToggle={toggleChat} />
        <div className="p-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">발행이 완료되었습니다!</h2>
            <p className="text-slate-500 mb-2">
              {client?.companyName}에 대한 세금계산서가 성공적으로 발행되었습니다.
            </p>
            <p className="text-lg font-bold text-primary-600 mb-8">
              합계금액: {formatCurrency(totalAmount)}원
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/invoices" className="btn-secondary">
                목록으로
              </Link>
              <Link href="/invoices/new" className="btn-primary">
                새로 발행하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Header
        title="세금계산서 발행"
        description="3단계로 간편하게 세금계산서를 발행하세요"
        onChatToggle={toggleChat}
      />

      <div className="p-8">
        {/* Back button */}
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로 돌아가기
        </Link>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    currentStep > step.id
                      ? 'step-completed'
                      : currentStep === step.id
                      ? 'step-active'
                      : 'step-pending'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-400">{step.description}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-slate-300 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Select Client */}
          {currentStep === 1 && (
            <div className="animate-slide-up space-y-6">
              {/* Invoice Type */}
              <div className="card p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  발행 유형
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      정발행: 공급자가 직접 발행 / 역발행: 매입자가 요청
                    </span>
                  </span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setInvoiceType('regular')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      invoiceType === 'regular'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-medium text-slate-900">정발행</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      공급자(나)가 직접 세금계산서를 발행합니다
                    </p>
                  </button>
                  <button
                    onClick={() => setInvoiceType('reverse')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      invoiceType === 'reverse'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-medium text-slate-900">역발행</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      공급받는 자가 작성하여 승인을 요청합니다
                    </p>
                  </button>
                </div>
              </div>

              {/* Client Selection */}
              <div className="card p-6">
                <h3 className="font-semibold text-slate-900 mb-1">공급받는 자 선택</h3>
                <p className="text-sm text-slate-500 mb-4">
                  등록된 거래처에서 선택하거나 직접 입력할 수 있습니다
                </p>
                <div className="space-y-2">
                  {mockClients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClient(c.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                        selectedClient === c.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold text-sm">
                        {c.companyName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900">{c.companyName}</p>
                        <p className="text-sm text-slate-500">
                          {c.businessNumber} · {c.representativeName}
                        </p>
                      </div>
                      {selectedClient === c.id && (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Input Items */}
          {currentStep === 2 && (
            <div className="animate-slide-up space-y-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">품목 정보</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      거래 품목을 입력하세요. 수량과 단가를 입력하면 금액이 자동 계산됩니다.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      toggleChat();
                    }}
                    className="btn-ghost flex items-center gap-1.5 text-primary-600 text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI 도움
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">
                          품목 {idx + 1}
                        </span>
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-2">
                          <label className="input-label">날짜</label>
                          <input
                            type="text"
                            value={item.date}
                            onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                            placeholder="MM/DD"
                            className="input-field text-sm"
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="input-label">품목명</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="예: 웹사이트 개발"
                            className="input-field text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="input-label">규격</label>
                          <input
                            type="text"
                            value={item.specification}
                            onChange={(e) => updateItem(item.id, 'specification', e.target.value)}
                            placeholder="선택사항"
                            className="input-field text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="input-label">수량</label>
                          <input
                            type="number"
                            value={item.quantity || ''}
                            onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                            min="1"
                            className="input-field text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="input-label">단가</label>
                          <input
                            type="number"
                            value={item.unitPrice || ''}
                            onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                            min="0"
                            placeholder="0"
                            className="input-field text-sm"
                          />
                        </div>
                      </div>

                      {item.supplyAmount > 0 && (
                        <div className="flex justify-end gap-6 pt-2 border-t border-slate-200 text-sm">
                          <span className="text-slate-500">
                            공급가액: <strong className="text-slate-700">{formatCurrency(item.supplyAmount)}원</strong>
                          </span>
                          <span className="text-slate-500">
                            세액: <strong className="text-slate-700">{formatCurrency(item.taxAmount)}원</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={addItem}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    품목 추가
                  </button>
                </div>

                {/* Total */}
                <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-700">합계 공급가액</span>
                    <span className="font-bold text-primary-900">{formatCurrency(totalSupply)}원</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-primary-700">합계 세액</span>
                    <span className="font-bold text-primary-900">{formatCurrency(totalTax)}원</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-primary-200">
                    <span className="font-semibold text-primary-900">총 합계금액</span>
                    <span className="text-xl font-bold text-primary-900">{formatCurrency(totalAmount)}원</span>
                  </div>
                </div>

                {/* Memo */}
                <div className="mt-4">
                  <label className="input-label">비고 (선택)</label>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="추가 메모를 입력하세요"
                    className="input-field text-sm resize-none h-20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Issue */}
          {currentStep === 3 && (
            <div className="animate-slide-up space-y-6">
              <div className="card p-8">
                <h3 className="text-center text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">
                  세 금 계 산 서
                </h3>

                {/* Supplier & Receiver Info */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      공급자
                    </p>
                    <div className="space-y-1.5 text-sm">
                      <p><span className="text-slate-500">상호:</span> <strong>우리회사</strong></p>
                      <p><span className="text-slate-500">사업자번호:</span> 111-22-33333</p>
                      <p><span className="text-slate-500">대표자:</span> 홍길동</p>
                      <p><span className="text-slate-500">주소:</span> 서울시 서초구 서초대로 100</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
                    <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-3">
                      공급받는 자
                    </p>
                    {client && (
                      <div className="space-y-1.5 text-sm">
                        <p><span className="text-primary-500">상호:</span> <strong>{client.companyName}</strong></p>
                        <p><span className="text-primary-500">사업자번호:</span> {client.businessNumber}</p>
                        <p><span className="text-primary-500">대표자:</span> {client.representativeName}</p>
                        <p><span className="text-primary-500">주소:</span> {client.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">날짜</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">품목</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">규격</th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">수량</th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">단가</th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">공급가액</th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">세액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.filter(i => i.description).map((item) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="px-4 py-3 text-slate-600">{item.date}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{item.description}</td>
                          <td className="px-4 py-3 text-slate-500">{item.specification || '-'}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-800">{formatCurrency(item.supplyAmount)}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.taxAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="p-5 bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl border border-primary-100">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-primary-500 mb-1">공급가액</p>
                      <p className="text-lg font-bold text-primary-800">{formatCurrency(totalSupply)}원</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary-500 mb-1">세액 (10%)</p>
                      <p className="text-lg font-bold text-primary-800">{formatCurrency(totalTax)}원</p>
                    </div>
                    <div className="border-l border-primary-200 pl-4">
                      <p className="text-xs text-primary-500 mb-1">합계금액</p>
                      <p className="text-2xl font-bold text-primary-900">{formatCurrency(totalAmount)}원</p>
                    </div>
                  </div>
                </div>

                {memo && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">비고</p>
                    <p className="text-sm text-slate-600">{memo}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="btn-secondary disabled:opacity-0"
            >
              이전 단계
            </button>

            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="btn-primary flex items-center gap-2"
              >
                다음 단계
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleIssue}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98] flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                발행하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
