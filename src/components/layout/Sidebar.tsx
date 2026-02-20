'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  FolderOpen,
  Settings,
  HelpCircle,
  Zap,
  FilePen,
  Receipt,
  AlertCircle,
  Calculator,
} from 'lucide-react';

const menuSections = [
  {
    label: '문서',
    items: [
      { href: '/', label: '대시보드', icon: LayoutDashboard, description: '한눈에 보는 현황' },
      { href: '/invoices', label: '세금계산서', icon: FileText, description: '발행 및 관리' },
      { href: '/statements', label: '거래명세표', icon: ClipboardList, description: '발행 및 관리' },
      { href: '/quotes', label: '견적서', icon: FilePen, description: '견적 작성 및 관리' },
      { href: '/payments', label: '입금표', icon: Receipt, description: '입금 내역 관리' },
    ],
  },
  {
    label: '분석',
    items: [
      { href: '/receivables', label: '미수금 관리', icon: AlertCircle, description: '미수금 현황' },
      { href: '/vat-return', label: '부가세 미리보기', icon: Calculator, description: 'VAT 신고 준비' },
    ],
  },
  {
    label: '관리',
    items: [
      { href: '/clients', label: '거래처 관리', icon: Users, description: '거래처 정보' },
      { href: '/documents', label: '문서함', icon: FolderOpen, description: '모든 문서 조회' },
    ],
  },
];

const bottomItems = [
  { href: '/settings', label: '설정', icon: Settings },
  { href: '/help', label: '도움말', icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">BizFlow</h1>
            <p className="text-[10px] text-slate-400 -mt-0.5">스마트 재무 관리</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium block ${isActive ? 'text-primary-700' : ''}`}>
                      {item.label}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {item.description}
                    </span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200"
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}

        {/* User Info */}
        <div className="mt-3 px-3 py-3 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              홍
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">홍길동</p>
              <p className="text-[11px] text-slate-400 truncate">우리회사</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
