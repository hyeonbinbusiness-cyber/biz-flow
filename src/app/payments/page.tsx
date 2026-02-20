'use client';

import Header from '@/components/layout/Header';
import { useChatContext } from '@/contexts/ChatContext';
import { useState } from 'react';
import {
  Receipt,
  Search,
  Plus,
  X,
  Trash2,
  Banknote,
  CreditCard,
  Landmark,
  FileText,
} from 'lucide-react';
import { mockPaymentReceipts, mockClients, mockInvoices } from '@/data/mockData';
import { PaymentReceipt } from '@/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

const methodMap: Record<string, { label: string; icon: React.ElementType; class: string }> = {
  bank_transfer: { label: '계좌이체', icon: Landmark, class: 'bg-blue-50 text-blue-700 border border-blue-100' },
  cash: { label: '현금', icon: Banknote, class: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  card: { label: '카드', icon: CreditCard, class: 'bg-violet-50 text-violet-700 border border-violet-100' },
  check: { label: '수표', icon: FileText, class: 'bg-amber-50 text-amber-700 border border-amber-100' },
};

export default function PaymentsPage() {
  const { toggleChat } = useChatContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [payments, setPayments] = useState<PaymentReceipt[]>(mockPaymentReceipts);

  // Form states
  const [formClientId, setFormClientId] = useState('');
  const [formInvoiceId, setFormInvoiceId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formMethod, setFormMethod] = useState<PaymentReceipt['paymentMethod']>('bank_transfer');
  const [formBankName, setFormBankName] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formMemo, setFormMemo] = useState('');

  const filtered = payments.filter((p) =>
    p.clientName.includes(searchTerm) || p.paymentNumber.includes(searchTerm)
  );

  const totalPayments = filtered.reduce((sum, p) => sum + p.amount, 0);

  const resetForm = () => {
    setFormClientId('');
    setFormInvoiceId('');
    setFormDate('');
    setFormAmount('');
    setFormMethod('bank_transfer');
    setFormBankName('');
    setFormAccountNumber('');
    setFormMemo('');
  };

  const handleSubmit = () => {
    const client = mockClients.find(c => c.id === formClientId);
    const newPayment: PaymentReceipt = {
      id: `pay${Date.now()}`,
      paymentNumber: `PAY-2026-${String(payments.length + 1).padStart(3, '0')}`,
      invoiceId: formInvoiceId,
      clientId: formClientId,
      clientName: client?.companyName || '',
      paymentDate: formDate,
      amount: Number(formAmount),
      paymentMethod: formMethod,
      bankName: formBankName || undefined,
      accountNumber: formAccountNumber || undefined,
      memo: formMemo,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPayments([newPayment, ...payments]);
    resetForm();
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="입금표"
        description="입금 내역을 기록하고 관리하세요"
        onChatToggle={toggleChat}
      />

      <div className="p-8 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="거래처명, 입금번호 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field !pl-10 !py-2.5 w-72 text-sm"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            입금 기록
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Receipt className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-900">
              총 {filtered.length}건의 입금 내역이 있습니다
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              총 입금액: {formatCurrency(totalPayments)}
            </p>
          </div>
        </div>

        {/* Payment Cards */}
        <div className="space-y-3">
          {filtered.map((payment) => {
            const method = methodMap[payment.paymentMethod];
            const MethodIcon = method.icon;
            return (
              <div key={payment.id} className="card-hover p-5 flex items-center gap-4">
                <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MethodIcon className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900">{payment.clientName}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${method.class}`}>
                      {method.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{payment.paymentNumber}</span>
                    <span>·</span>
                    <span>{payment.paymentDate}</span>
                    {payment.bankName && (
                      <>
                        <span>·</span>
                        <span>{payment.bankName}</span>
                      </>
                    )}
                    {payment.memo && (
                      <>
                        <span>·</span>
                        <span className="truncate">{payment.memo}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(payment.amount)}</p>
                </div>
                <button
                  onClick={() => handleDelete(payment.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">입금 내역이 없습니다</p>
              <p className="text-sm text-slate-400 mt-1">입금 기록 버튼을 클릭하여 새로운 입금을 기록하세요</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Recording Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">입금 기록</h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="input-label">거래처</label>
                <select
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">거래처를 선택하세요</option>
                  {mockClients.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">연결 세금계산서</label>
                <select
                  value={formInvoiceId}
                  onChange={(e) => setFormInvoiceId(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">세금계산서를 선택하세요 (선택사항)</option>
                  {mockInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.receiver.companyName} - {formatCurrency(inv.totalAmount)} ({inv.issueDate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">입금일</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="input-label">입금액</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">입금방법</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(methodMap) as Array<PaymentReceipt['paymentMethod']>).map((key) => {
                    const m = methodMap[key];
                    const Icon = m.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setFormMethod(key)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formMethod === key
                            ? 'border-green-500 bg-green-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${formMethod === key ? 'text-green-600' : 'text-slate-400'}`} />
                        <span className="text-xs font-medium">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formMethod === 'bank_transfer' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">입금은행</label>
                    <input
                      type="text"
                      value={formBankName}
                      onChange={(e) => setFormBankName(e.target.value)}
                      placeholder="예: 신한은행"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="input-label">계좌번호</label>
                    <input
                      type="text"
                      value={formAccountNumber}
                      onChange={(e) => setFormAccountNumber(e.target.value)}
                      placeholder="예: 110-123-456789"
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="input-label">메모 (선택)</label>
                <textarea
                  value={formMemo}
                  onChange={(e) => setFormMemo(e.target.value)}
                  placeholder="입금 관련 메모"
                  className="input-field text-sm resize-none h-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="btn-secondary"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formClientId || !formDate || !formAmount}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                기록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
