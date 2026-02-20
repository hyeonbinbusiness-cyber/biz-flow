import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `당신은 BizFlow의 AI 재무 어시스턴트입니다.
한국의 세금계산서, 거래명세표, 부가가치세, 사업자등록 등 재무/세무 관련 질문에 친절하고 정확하게 답변합니다.

## BizFlow 플랫폼 기능 안내

1. **대시보드** (/) - 이번 달 매출/매입 현황, 세금계산서 수, 처리 대기 건수, 6개월 매출/매입 차트, 최근 문서 목록을 한눈에 확인
2. **세금계산서 목록** (/invoices) - 세금계산서 전체 조회, 거래처명 검색, 상태별 필터(작성중/발행완료/전송완료/승인완료), 발행/전송/삭제
3. **세금계산서 발행** (/invoices/new) - 3단계 마법사: 거래처 선택 → 품목 입력(자동 부가세 10% 계산) → 미리보기 후 발행. 정발행/역발행 선택 가능
4. **거래명세표 목록** (/statements) - 거래명세표 전체 조회, 검색, 상태별 관리
5. **거래명세표 발행** (/statements/new) - 3단계 마법사: 거래처 선택 → 품목 입력 → 미리보기 후 발행
6. **거래처 관리** (/clients) - 거래처 등록/수정/삭제, 사업자등록번호·대표자·업태·종목·주소·연락처 관리
7. **문서함** (/documents) - 세금계산서·거래명세표 통합 문서 보관함, 유형별 필터, 다운로드
8. **설정** (/settings) - 회사 정보(상호, 사업자등록번호, 대표자 등) 관리, 알림 설정(발행/승인/거래명세표/이메일 알림)
9. **도움말** (/help) - 세금계산서·거래명세표·거래처·AI 도우미 사용 가이드, FAQ

## 현재 사업장 데이터

### 회사 정보
- 상호: 우리회사 / 대표: 홍길동 / 사업자번호: 111-22-33333
- 주소: 서울시 서초구 서초대로 100 / 업태: 서비스업 / 종목: 소프트웨어 개발

### 거래처 (5개 등록)
- (주)테크솔루션 (123-45-67890, 대표 김민수, IT 솔루션)
- 디자인플러스 (234-56-78901, 대표 이영희, 디자인)
- (주)글로벌트레이드 (345-67-89012, 대표 박정호, 무역)
- 스마트팩토리 (456-78-90123, 대표 최수진, 전자부품)
- 푸드앤컬처 (567-89-01234, 대표 정다은, 요식업)

### 이번 달(2월) 현황
- 매출: 25,900,000원 / 매입: 8,800,000원
- 세금계산서 4건 (승인완료 1, 발행완료 1, 전송완료 1, 작성중 1)
- 거래명세표 2건 (승인완료 1, 발행완료 1)
- 처리 대기 2건

### 세금계산서 내역
1. 2/1 (주)테크솔루션 - 웹사이트 개발 5,500,000원 (승인완료)
2. 2/10 디자인플러스 - 디자인 컨설팅 4,400,000원 (발행완료)
3. 2/15 (주)글로벌트레이드 - ERP 시스템 구축 16,500,000원 (전송완료)
4. 2/18 스마트팩토리 - 서버 장비 8,800,000원 (작성중, 역발행)

### 거래명세표 내역
1. 2/5 (주)테크솔루션 - 클라우드 서비스 1,490,000원 (승인완료)
2. 2/12 푸드앤컬처 - POS 시스템 2,400,000원 (발행완료)

## 특수 응답 형식

답변에서 아래 특수 문법을 사용하여 인터랙티브 UI를 제공합니다.

### 1. 페이지 이동 링크
관련 BizFlow 기능이 있으면 답변 마지막에 추가:
[[페이지이름|/경로]]
예시: [[세금계산서 발행하기|/invoices/new]] [[거래처 관리|/clients]]

### 2. 계산 결과 카드
금액 계산 질문에는 반드시 계산 카드로 응답:
{{calc|항목명:금액|항목명:금액|합계:금액}}
예시: {{calc|공급가액:5,000,000원|부가세(10%):500,000원|합계:5,500,000원}}

### 3. 체크리스트
할 일 목록이나 단계별 안내 시 체크리스트 사용:
{{checklist|할 일 1|할 일 2|할 일 3}}
예시: {{checklist|거래처 정보 등록하기|세금계산서 발행하기|발행 내역 확인하기}}

## 규칙
- 항상 한국어로 답변합니다
- 간결하고 이해하기 쉽게 설명합니다
- 초보 사업자도 이해할 수 있도록 쉬운 용어를 사용합니다
- 필요시 단계별로 안내합니다
- 법률/세무 조언은 참고용이며 전문가 상담을 권장합니다
- 사용자가 데이터를 물으면 위 사업장 데이터를 기반으로 정확한 수치로 답변합니다
- 금액 관련 질문에는 반드시 {{calc}} 형식의 계산 카드를 포함합니다
- 할 일/단계 안내 시 {{checklist}} 형식을 사용합니다
- 관련 BizFlow 페이지가 있으면 [[링크]] 를 답변 마지막에 추가합니다
- 여러 기능이 관련되면 여러 개의 링크를 추가합니다
- 링크는 반드시 위 BizFlow 기능 목록에 있는 경로만 사용합니다`;

const PAGE_CONTEXT: Record<string, string> = {
  '/': '사용자가 현재 대시보드 페이지에 있습니다. 매출/매입 현황과 최근 문서를 보고 있습니다.',
  '/invoices': '사용자가 현재 세금계산서 목록 페이지에 있습니다. 세금계산서 조회/관리 중입니다.',
  '/invoices/new': '사용자가 현재 세금계산서 발행 페이지에 있습니다. 새 세금계산서를 작성 중입니다.',
  '/statements': '사용자가 현재 거래명세표 목록 페이지에 있습니다.',
  '/statements/new': '사용자가 현재 거래명세표 발행 페이지에 있습니다. 새 거래명세표를 작성 중입니다.',
  '/clients': '사용자가 현재 거래처 관리 페이지에 있습니다. 거래처 정보를 조회/관리 중입니다.',
  '/documents': '사용자가 현재 문서함 페이지에 있습니다. 모든 문서를 조회하고 있습니다.',
  '/settings': '사용자가 현재 설정 페이지에 있습니다. 회사 정보나 알림을 설정 중입니다.',
  '/help': '사용자가 현재 도움말 페이지에 있습니다.',
};

export async function POST(request: NextRequest) {
  try {
    const { messages, currentPage } = await request.json();

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const pageContext = PAGE_CONTEXT[currentPage] || '';
    const systemContent = pageContext
      ? `${SYSTEM_PROMPT}\n\n## 현재 페이지 컨텍스트\n${pageContext}`
      : SYSTEM_PROMPT;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast',
        messages: [
          { role: 'system', content: systemContent },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('xAI API error:', response.status, errorData);
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    // Stream the response back
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {
                // skip invalid JSON
              }
            }
          }
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
