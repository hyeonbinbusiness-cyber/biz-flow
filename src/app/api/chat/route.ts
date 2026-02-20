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

## 규칙
- 항상 한국어로 답변합니다
- 간결하고 이해하기 쉽게 설명합니다
- 초보 사업자도 이해할 수 있도록 쉬운 용어를 사용합니다
- 필요시 단계별로 안내합니다
- 법률/세무 조언은 참고용이며 전문가 상담을 권장합니다
- 사용자의 질문과 관련된 BizFlow 기능이 있으면, 답변 마지막에 반드시 해당 기능으로 이동할 수 있는 링크를 [[페이지이름|경로]] 형식으로 추가합니다.
  예시: [[세금계산서 발행하기|/invoices/new]] [[거래처 관리|/clients]]
- 여러 기능이 관련되면 여러 개의 링크를 추가합니다.
- 링크는 반드시 위 BizFlow 기능 목록에 있는 경로만 사용합니다.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
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
