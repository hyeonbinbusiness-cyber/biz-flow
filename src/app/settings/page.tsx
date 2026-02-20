'use client';

import Header from '@/components/layout/Header';
import { useChatContext } from '@/contexts/ChatContext';
import { useState } from 'react';
import { Building2, User, Bell, Shield, Check } from 'lucide-react';

export default function SettingsPage() {
  const { toggleChat } = useChatContext();
  const [saved, setSaved] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '우리회사',
    businessNumber: '111-22-33333',
    representativeName: '홍길동',
    address: '서울시 서초구 서초대로 100',
    businessType: '서비스업',
    businessCategory: '소프트웨어 개발',
    phone: '02-1111-2222',
    fax: '02-1111-2223',
    email: 'info@ourcompany.kr',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <Header title="설정" description="회사 정보 및 환경설정" onChatToggle={toggleChat} />

      <div className="p-8 max-w-3xl space-y-6">
        {/* Company Info */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">사업자 정보</h3>
              <p className="text-sm text-slate-500">세금계산서/거래명세표에 표시되는 공급자 정보입니다</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">상호명</label>
                <input
                  type="text"
                  value={companyInfo.companyName}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="input-label">사업자등록번호</label>
                <input
                  type="text"
                  value={companyInfo.businessNumber}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, businessNumber: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">대표자명</label>
                <input
                  type="text"
                  value={companyInfo.representativeName}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, representativeName: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="input-label">업태 / 종목</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={companyInfo.businessType}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, businessType: e.target.value })}
                    className="input-field text-sm"
                  />
                  <input
                    type="text"
                    value={companyInfo.businessCategory}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, businessCategory: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="input-label">사업장 주소</label>
              <input
                type="text"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                className="input-field text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="input-label">전화번호</label>
                <input
                  type="text"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="input-label">팩스</label>
                <input
                  type="text"
                  value={companyInfo.fax}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, fax: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="input-label">이메일</label>
                <input
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">알림 설정</h3>
              <p className="text-sm text-slate-500">알림 수신 방법을 설정합니다</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: '세금계산서 발행 알림', desc: '세금계산서가 발행되면 알림을 받습니다' },
              { label: '승인 요청 알림', desc: '역발행 승인 요청 시 알림을 받습니다' },
              { label: '거래명세표 알림', desc: '거래명세표 발행 시 알림을 받습니다' },
              { label: '견적서 알림', desc: '견적서 수락/거절 시 알림을 받습니다' },
              { label: '입금 알림', desc: '새로운 입금이 기록되면 알림을 받습니다' },
              { label: '미수금 연체 알림', desc: '미수금 결제기한이 지나면 알림을 받습니다' },
              { label: '이메일 알림', desc: '중요 알림을 이메일로도 받습니다' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                저장되었습니다
              </>
            ) : (
              '설정 저장'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
