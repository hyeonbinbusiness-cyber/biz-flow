// 거래처 정보
export interface Client {
  id: string;
  companyName: string;          // 상호
  representativeName: string;   // 대표자명
  businessNumber: string;       // 사업자등록번호
  address: string;              // 사업장 주소
  businessType: string;         // 업태
  businessCategory: string;     // 종목
  email: string;
  phone: string;
  memo: string;
  createdAt: string;
}

// 세금계산서 품목
export interface InvoiceItem {
  id: string;
  date: string;           // 월/일
  description: string;    // 품목
  specification: string;  // 규격
  quantity: number;       // 수량
  unitPrice: number;      // 단가
  supplyAmount: number;   // 공급가액
  taxAmount: number;      // 세액
}

// 세금계산서
export interface TaxInvoice {
  id: string;
  type: 'regular' | 'reverse';  // 정발행 / 역발행
  status: 'draft' | 'issued' | 'sent' | 'confirmed' | 'cancelled';
  issueDate: string;
  supplier: {                   // 공급자
    companyName: string;
    businessNumber: string;
    representativeName: string;
    address: string;
    businessType: string;
    businessCategory: string;
  };
  receiver: {                   // 공급받는자
    companyName: string;
    businessNumber: string;
    representativeName: string;
    address: string;
    businessType: string;
    businessCategory: string;
  };
  items: InvoiceItem[];
  totalSupplyAmount: number;    // 합계 공급가액
  totalTaxAmount: number;       // 합계 세액
  totalAmount: number;          // 합계 금액
  memo: string;
  createdAt: string;
}

// 거래명세표 품목
export interface StatementItem {
  id: string;
  date: string;
  productName: string;    // 품명
  specification: string;  // 규격
  unit: string;           // 단위
  quantity: number;       // 수량
  unitPrice: number;      // 단가
  amount: number;         // 금액
  memo: string;           // 비고
}

// 거래명세표
export interface TransactionStatement {
  id: string;
  statementNumber: string;
  status: 'draft' | 'issued' | 'sent' | 'confirmed';
  issueDate: string;
  supplier: {
    companyName: string;
    businessNumber: string;
    representativeName: string;
    address: string;
    phone: string;
    fax: string;
  };
  receiver: {
    companyName: string;
    businessNumber: string;
    representativeName: string;
    address: string;
    phone: string;
  };
  items: StatementItem[];
  totalAmount: number;
  memo: string;
  createdAt: string;
}

// 견적서 품목
export interface QuotationItem {
  id: string;
  description: string;    // 품목명
  specification: string;  // 규격
  quantity: number;       // 수량
  unitPrice: number;      // 단가
  amount: number;         // 금액
  memo: string;           // 비고
}

// 견적서
export interface Quotation {
  id: string;
  quotationNumber: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  issueDate: string;
  validUntil: string;
  supplier: {
    companyName: string;
    businessNumber: string;
    representativeName: string;
    address: string;
    phone: string;
    email: string;
  };
  receiver: {
    companyName: string;
    businessNumber: string;
    representativeName: string;
    address: string;
    phone: string;
  };
  items: QuotationItem[];
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  notes: string;
  paymentTerms: string;
  deliveryTerms: string;
  linkedInvoiceId?: string;
  createdAt: string;
}

// 입금표
export interface PaymentReceipt {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  clientId: string;
  clientName: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'cash' | 'card' | 'check';
  bankName?: string;
  accountNumber?: string;
  memo: string;
  createdAt: string;
}

// 미수금 항목
export interface Receivable {
  invoiceId: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  daysOverdue: number;
  status: 'current' | 'overdue_30' | 'overdue_60' | 'overdue_90';
}

// 부가세 신고 미리보기
export interface VATReturnPreview {
  period: string;
  salesInvoices: {
    count: number;
    totalSupply: number;
    totalTax: number;
  };
  purchaseInvoices: {
    count: number;
    totalSupply: number;
    totalTax: number;
  };
  vatPayable: number;
}

// 문서 (통합)
export interface Document {
  id: string;
  type: 'tax_invoice' | 'statement' | 'quotation' | 'payment_receipt';
  title: string;
  clientName: string;
  amount: number;
  status: string;
  createdAt: string;
}

// 대시보드 통계
export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  invoiceCount: number;
  statementCount: number;
  quotationCount: number;
  pendingCount: number;
  outstandingReceivables: number;
  overdueCount: number;
  monthlySales: { month: string; sales: number; purchases: number }[];
  documentDistribution: {
    taxInvoices: number;
    statements: number;
    quotations: number;
  };
}

// AI 챗봇 메시지
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
