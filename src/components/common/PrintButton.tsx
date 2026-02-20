'use client';

import { Printer } from 'lucide-react';

interface PrintButtonProps {
  label?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function PrintButton({ label = '인쇄', className = '', variant = 'secondary' }: PrintButtonProps) {
  const baseClass = variant === 'primary'
    ? 'btn-primary'
    : variant === 'ghost'
    ? 'btn-ghost'
    : 'btn-secondary';

  return (
    <button
      onClick={() => window.print()}
      className={`${baseClass} inline-flex items-center gap-2 no-print ${className}`}
    >
      <Printer className="w-4 h-4" />
      {label}
    </button>
  );
}
