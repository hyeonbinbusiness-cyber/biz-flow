'use client';

import Header from '@/components/layout/Header';
import { useChatContext } from '@/contexts/ChatContext';
import { useState } from 'react';
import {
  Plus,
  Search,
  Users,
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { mockClients } from '@/data/mockData';
import { Client } from '@/types';

export default function ClientsPage() {
  const { toggleChat } = useChatContext();
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({
    companyName: '',
    representativeName: '',
    businessNumber: '',
    address: '',
    businessType: '',
    businessCategory: '',
    email: '',
    phone: '',
    memo: '',
  });

  const filtered = clients.filter(
    (c) =>
      c.companyName.includes(searchTerm) ||
      c.businessNumber.includes(searchTerm) ||
      c.representativeName.includes(searchTerm)
  );

  const handleAdd = () => {
    setFormData({
      companyName: '',
      representativeName: '',
      businessNumber: '',
      address: '',
      businessType: '',
      businessCategory: '',
      email: '',
      phone: '',
      memo: '',
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (client: Client) => {
    setFormData(client);
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.companyName || !formData.businessNumber) return;

    if (editingId) {
      setClients(clients.map((c) => (c.id === editingId ? { ...c, ...formData } as Client : c)));
    } else {
      const newClient: Client = {
        id: Date.now().toString(),
        companyName: formData.companyName || '',
        representativeName: formData.representativeName || '',
        businessNumber: formData.businessNumber || '',
        address: formData.address || '',
        businessType: formData.businessType || '',
        businessCategory: formData.businessCategory || '',
        email: formData.email || '',
        phone: formData.phone || '',
        memo: formData.memo || '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setClients([newClient, ...clients]);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="거래처 관리"
        description="거래처 정보를 등록하고 관리하세요"
        onChatToggle={toggleChat}
      />

      <div className="p-8 space-y-6">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="상호명, 사업자번호, 대표자 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field !pl-10 !py-2.5 w-80 text-sm"
            />
          </div>
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            거래처 추가
          </button>
        </div>

        {/* Tip */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-900">
              거래처를 미리 등록해두면 세금계산서/거래명세표 발행이 더 빨라집니다
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              현재 {clients.length}개의 거래처가 등록되어 있습니다
            </p>
          </div>
        </div>

        {/* Client Cards */}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((client) => (
            <div key={client.id} className="card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-bold">
                    {client.companyName.replace(/[()주]/g, '').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{client.companyName}</h3>
                    <p className="text-sm text-slate-500">{client.businessNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{client.representativeName} · {client.businessType} · {client.businessCategory}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{client.address}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{client.email}</span>
                  </div>
                </div>
                {client.memo && (
                  <p className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md inline-block">
                    {client.memo}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              {searchTerm ? '검색 결과가 없습니다' : '등록된 거래처가 없습니다'}
            </p>
            <p className="text-sm text-slate-400 mt-1 mb-4">새로운 거래처를 추가해보세요</p>
            <button onClick={handleAdd} className="btn-primary inline-flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              거래처 추가
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? '거래처 수정' : '새 거래처 추가'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">
                    상호명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="예: (주)테크솔루션"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="input-label">
                    사업자등록번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessNumber || ''}
                    onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                    placeholder="123-45-67890"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">대표자명</label>
                  <input
                    type="text"
                    value={formData.representativeName || ''}
                    onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="input-label">업태</label>
                  <input
                    type="text"
                    value={formData.businessType || ''}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    placeholder="예: 서비스업"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">종목</label>
                  <input
                    type="text"
                    value={formData.businessCategory || ''}
                    onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                    placeholder="예: IT 솔루션"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="input-label">전화번호</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="02-1234-5678"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">사업장 주소</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="서울시 강남구..."
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="input-label">이메일</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@company.kr"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="input-label">메모 (선택)</label>
                <textarea
                  value={formData.memo || ''}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  placeholder="거래처에 대한 메모"
                  className="input-field text-sm resize-none h-20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setShowForm(false)} className="btn-secondary">
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.companyName || !formData.businessNumber}
                className="btn-primary flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {editingId ? '수정하기' : '추가하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
