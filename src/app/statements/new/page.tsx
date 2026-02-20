'use client';

import Header from '@/components/layout/Header';
import { useChatContext } from '@/contexts/ChatContext';
import { useState } from 'react';
import {
  ChevronRight,
  Check,
  Building2,
  ClipboardList,
  Eye,
  Plus,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { mockClients } from '@/data/mockData';
import { StatementItem } from '@/types';

const steps = [
  { id: 1, title: '거래처 선택', icon: Building2 },
  { id: 2, title: '품목 입력', icon: ClipboardList },
  { id: 3, title: '미리보기 & 발행', icon: Eye },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount);
}

export default function NewStatementPage() {
  const { toggleChat } = useChatContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [items, setItems] = useState<StatementItem[]>([
    {
      id: '1',
      date: new Date().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('. ', '/').replace('.', ''),
      productName: '',
      specification: '',
      unit: '개',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      memo: '',
    },
  ]);
  const [memo, setMemo] = useState('');
  const [isIssued, setIsIssued] = useState(false);

  const client = mockClients.find((c) => c.id === selectedClient);
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('. ', '/').replace('.', ''),
        productName: '',
        specification: '',
        unit: '개',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        memo: '',
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof StatementItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? Number(value) : item.quantity;
          const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
          updated.amount = qty * price;
        }
        return updated;
      })
    );
  };

  const canProceed = () => {
    if (currentStep === 1) return !!selectedClient;
    if (currentStep === 2) return items.some((item) => item.productName && item.unitPrice > 0);
    return true;
  };

  if (isIssued) {
    return (
      <div className="animate-fade-in">
        <Header title="거래명세표 발행" onChatToggle={toggleChat} />
        <div className="p-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">발행이 완료되었습니다!</h2>
            <p className="text-slate-500 mb-2">
              {client?.companyName}에 대한 거래명세표가 성공적으로 발행되었습니다.
            </p>
            <p className="text-lg font-bold text-primary-600 mb-8">
              합계금액: {formatCurrency(totalAmount)}원
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/statements" className="btn-secondary">목록으로</Link>
              <Link href="/statements/new" className="btn-primary">새로 발행하기</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Header
        title="거래명세표 발행"
        description="3단계로 간편하게 거래명세표를 발행하세요"
        onChatToggle={toggleChat}
      />

      <div className="p-8">
        <Link
          href="/statements"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로 돌아가기
        </Link>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
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
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-slate-300 mx-4" />
              )}
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="animate-slide-up card p-6">
              <h3 className="font-semibold text-slate-900 mb-1">거래처 선택</h3>
              <p className="text-sm text-slate-500 mb-4">
                거래명세표를 발행할 거래처를 선택하세요
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
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{c.companyName}</p>
                      <p className="text-sm text-slate-500">{c.businessNumber} · {c.representativeName}</p>
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
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="animate-slide-up card p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">거래 품목 입력</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  수량과 단가를 입력하면 금액이 자동 계산됩니다
                </p>
              </div>

              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">품목 {idx + 1}</span>
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
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="input-label">품명</label>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) => updateItem(item.id, 'productName', e.target.value)}
                        placeholder="예: 클라우드 서비스"
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="input-label">규격</label>
                      <input
                        type="text"
                        value={item.specification}
                        onChange={(e) => updateItem(item.id, 'specification', e.target.value)}
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="input-label">단위</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
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
                        className="input-field text-sm"
                      />
                    </div>
                  </div>

                  {item.amount > 0 && (
                    <div className="text-right pt-2 border-t border-slate-200 text-sm text-slate-500">
                      금액: <strong className="text-slate-700">{formatCurrency(item.amount)}원</strong>
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

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900">합계금액</span>
                  <span className="text-xl font-bold text-blue-900">{formatCurrency(totalAmount)}원</span>
                </div>
              </div>

              <div>
                <label className="input-label">비고 (선택)</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="추가 메모를 입력하세요"
                  className="input-field text-sm resize-none h-20"
                />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="animate-slide-up card p-8">
              <h3 className="text-center text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">
                거 래 명 세 표
              </h3>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">공급자</p>
                  <div className="space-y-1.5 text-sm">
                    <p><span className="text-slate-500">상호:</span> <strong>우리회사</strong></p>
                    <p><span className="text-slate-500">사업자번호:</span> 111-22-33333</p>
                    <p><span className="text-slate-500">대표자:</span> 홍길동</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">공급받는 자</p>
                  {client && (
                    <div className="space-y-1.5 text-sm">
                      <p><span className="text-blue-500">상호:</span> <strong>{client.companyName}</strong></p>
                      <p><span className="text-blue-500">사업자번호:</span> {client.businessNumber}</p>
                      <p><span className="text-blue-500">대표자:</span> {client.representativeName}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">날짜</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">품명</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">규격</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">수량</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">단가</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter(i => i.productName).map((item) => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="px-4 py-3 text-slate-600">{item.date}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{item.productName}</td>
                        <td className="px-4 py-3 text-slate-500">{item.specification || '-'}</td>
                        <td className="px-4 py-3 text-right">{item.quantity} {item.unit}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 text-center">
                <p className="text-xs text-blue-500 mb-1">합계금액</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalAmount)}원</p>
              </div>
            </div>
          )}

          {/* Navigation */}
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
                onClick={() => setIsIssued(true)}
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
