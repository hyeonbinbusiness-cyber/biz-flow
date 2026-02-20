'use client';

import Header from '@/components/layout/Header';
import { useChatContext } from '@/contexts/ChatContext';
import {
  FileText,
  ClipboardList,
  Users,
  Sparkles,
  ChevronRight,
  BookOpen,
  MessageCircle,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const guides = [
  {
    icon: FileText,
    color: 'bg-violet-50 text-violet-500',
    title: '세금계산서 발행하기',
    description: '3단계 위저드로 간편하게 세금계산서를 발행하는 방법을 알아보세요',
    steps: [
      '거래처를 선택하거나 새로 등록합니다',
      '품목, 수량, 단가를 입력하면 세액이 자동 계산됩니다',
      '미리보기에서 확인 후 발행 버튼을 클릭합니다',
    ],
    link: '/invoices/new',
  },
  {
    icon: ClipboardList,
    color: 'bg-blue-50 text-blue-500',
    title: '거래명세표 발행하기',
    description: '거래 내역을 상세히 기록한 거래명세표를 발행하세요',
    steps: [
      '거래처를 선택합니다',
      '품명, 규격, 수량, 단가를 입력합니다',
      '미리보기에서 확인 후 발행합니다',
    ],
    link: '/statements/new',
  },
  {
    icon: Users,
    color: 'bg-emerald-50 text-emerald-500',
    title: '거래처 관리하기',
    description: '자주 거래하는 업체의 정보를 미리 등록하여 빠르게 문서를 발행하세요',
    steps: [
      '거래처 관리에서 "거래처 추가" 버튼을 클릭합니다',
      '상호명, 사업자등록번호 등 필수 정보를 입력합니다',
      '저장하면 문서 발행 시 자동으로 불러올 수 있습니다',
    ],
    link: '/clients',
  },
  {
    icon: Sparkles,
    color: 'bg-primary-50 text-primary-500',
    title: 'AI 도우미 활용하기',
    description: '세무/회계 관련 궁금한 점을 AI에게 물어보세요',
    steps: [
      '우측 상단의 "AI 도우미" 버튼을 클릭합니다',
      '궁금한 내용을 자연스럽게 질문합니다',
      'AI가 즉시 관련 정보와 가이드를 제공합니다',
    ],
    link: '#',
  },
];

const faqs = [
  {
    q: '세금계산서와 거래명세표의 차이가 뭔가요?',
    a: '세금계산서는 부가가치세법에 따라 의무적으로 발행하는 법적 문서이고, 거래명세표는 거래 내역을 상세히 기록하는 증빙 서류로 법적 의무는 없습니다.',
  },
  {
    q: '역발행은 무엇인가요?',
    a: '역발행은 공급받는 자(매입자)가 세금계산서를 작성하여 공급자에게 발행을 요청하는 방식입니다. 공급자의 승인이 필요합니다.',
  },
  {
    q: '부가가치세는 어떻게 계산되나요?',
    a: '부가가치세는 공급가액의 10%입니다. BizFlow에서는 단가와 수량을 입력하면 자동으로 계산됩니다.',
  },
  {
    q: '발행한 세금계산서를 수정할 수 있나요?',
    a: '작성중 상태의 세금계산서는 수정이 가능합니다. 이미 발행된 세금계산서는 수정세금계산서를 새로 발행해야 합니다.',
  },
];

export default function HelpPage() {
  const { toggleChat } = useChatContext();

  return (
    <div className="animate-fade-in">
      <Header
        title="도움말"
        description="BizFlow 사용 가이드"
        onChatToggle={toggleChat}
      />

      <div className="p-8 max-w-4xl space-y-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-primary-600 to-indigo-500 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-8 h-8" />
            <h2 className="text-2xl font-bold">BizFlow에 오신 것을 환영합니다</h2>
          </div>
          <p className="text-white/80 max-w-xl">
            초보자도 쉽게 사용할 수 있는 스마트 재무 관리 플랫폼입니다.
            아래 가이드를 참고하여 시작해보세요!
          </p>
        </div>

        {/* Guides */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-500" />
            시작 가이드
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {guides.map((guide) => (
              <div key={guide.title} className="card-hover p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${guide.color}`}>
                    <guide.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{guide.title}</h4>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-3">{guide.description}</p>
                <ol className="space-y-1.5 mb-4">
                  {guide.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <Link
                  href={guide.link}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  시작하기
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary-500" />
            자주 묻는 질문
          </h3>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.q} className="card p-5">
                <h4 className="font-medium text-slate-900 mb-2">Q. {faq.q}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          onClick={toggleChat}
          className="card-hover p-6 flex items-center gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900">더 궁금한 것이 있으신가요?</h4>
            <p className="text-sm text-slate-500">AI 도우미에게 무엇이든 물어보세요</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
