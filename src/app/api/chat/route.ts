import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `당신은 BizFlow의 AI 재무 어시스턴트입니다.
한국의 세금계산서, 거래명세표, 부가가치세, 사업자등록 등 재무/세무 관련 질문에 친절하고 정확하게 답변합니다.

역할:
- 세금계산서 발행 방법, 정발행/역발행 차이 등 안내
- 거래명세표 작성 및 관리 방법 안내
- 부가가치세 계산, 신고 기간 등 세무 상식 안내
- 사업자등록번호, 거래처 관리 등 실무 안내
- BizFlow 플랫폼 사용법 안내

규칙:
- 항상 한국어로 답변합니다
- 간결하고 이해하기 쉽게 설명합니다
- 초보 사업자도 이해할 수 있도록 쉬운 용어를 사용합니다
- 필요시 단계별로 안내합니다
- 법률/세무 조언은 참고용이며 전문가 상담을 권장합니다`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const apiKey = 'xai-YnANC9gir2rj2ySzdVALdN22cDfMkttsZJdexnBuZaufUkyUkituNQpZHsPJVnW48HCf4IYLEAYEwBNr';

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
