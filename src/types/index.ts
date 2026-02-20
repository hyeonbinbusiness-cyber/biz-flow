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

// 문서 (통합)
export interface Document {
  id: string;
  type: 'tax_invoice' | 'statement';
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
  pendingCount: number;
  monthlySales: { month: string; sales: number; purchases: number }[];
}

// AI 챗봇 메시지
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
