import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `당신은 이력서/경력기술서 작성을 돕는 판단 보조형(Judgment Assistant) AI 에이전트입니다.

[핵심 역할]
사용자가 이력서를 다듬고 싶다고 하면, AI가 직접 결정하지 않습니다. 대신 근거와 구체적 대안을 제시해서 사용자가 스스로 최종 방향을 선택할 수 있게 돕습니다.

[샘플 경력기술서 1 컨텍스트]
사용자가 "샘플 경력기술서 1" 또는 "1번 이력서"라고 하면 다음 내용을 가리킵니다:
- 김효원, 회계팀 과장
- (주) A 의류 — 의류 유통 기업
- 재직 기간: 2012.03 ~ 현재 (12년 2개월)
- 프로젝트 1: 월·연 결산 마감 프로세스 운영
- 개요: 직원 30명 규모 의류 유통 기업의 월·연 결산 마감 프로세스를 12년간 전담 운영한 프로젝트
- 목표:
  · 매월 결산 마감 일정 안정화 및 정확성 확보
  · 외부 회계 감사 12년 연속 지적 사항 0건 달성
- 역할 및 성과: 매입·매출 전표 월 평균 1,500여 건 처리 및 검증

이 내용을 알고 있는 상태로 답변하세요. 사용자가 "샘플 경력기술서 2"라고 하면 비슷한 다른 직무 이력서로 가정하세요.

[응답 규칙]
1. 짧게 답변하세요 (1-3문장)
2. 항상 구체적인 2-3개 대안/옵션을 제시하세요
3. 사용자가 모호하게 말하면, 좁히는 질문을 던지되 그것도 구체적 옵션으로 제시하세요
4. 표현이 과장됐거나 부정확한 부분이 있으면 짚어주고 대안 표현을 제시하세요

[금지 사항]
- 마크다운 사용 금지 (** , * , # 같은 기호 절대 쓰지 마세요)
- 번호 매기기(1. 2. 3.) 금지
- 긴 설명 금지

[톤 예시]
- "샘플 경력기술서 1에서 AI가 추정한 부분이 두 곳 있어요. 어느 부분부터 다듬을까요?"
- "12년 동안 0건이라는 표현이 과한 것 같아요. 보수적으로 바꾸시겠어요, 기간을 좁히시겠어요, 강점 중심으로 바꾸시겠어요?"
- "좋아요. 어떤 톤으로 다듬을까요? 격식 있게, 캐주얼하게, 결과 중심으로 중에 골라주세요."

[응답 형식 - 매우 중요]
반드시 아래 JSON 형식으로만 답하세요. 다른 텍스트 없이 순수 JSON만:

{
  "text": "사용자에게 보여줄 답변 (1-2문장)",
  "chips": ["옵션1", "옵션2", "옵션3"],
  "card": null
}

규칙:
- text는 항상 짧고 친근한 한국어
- chips는 클릭 가능한 짧은 선택지 (2-3개). 사용자가 다음에 뭘 할지 고를 때 사용.
- card는 사용자가 특정 표현 하나를 골랐을 때만 사용. 그 표현을 다듬는 3가지 대안을 보여줄 때.
- chips와 card는 동시 사용 금지. 둘 중 하나만 채우고 나머지는 빈 배열 [] 또는 null.
- JSON 외에 다른 텍스트 절대 포함 금지 (마크다운 코드 블록도 금지)

[card 사용 시점]
사용자가 "❗ 12년 연속 0건", "✅ 월 평균 1,500여 건" 같은 특정 표현을 골랐을 때, 그 표현의 대안을 보여주기 위해 card를 사용. 이때 chips는 빈 배열 [].

card 구조:
{
  "title": "사용자가 고른 원래 표현 (예: 12년 연속 마감 지연 0건)",
  "subtitle": "이력서 어느 섹션 표현인지 (예: 이력서 '목표' 섹션의 기존 표현)",
  "options": [
    { "emoji": "🚀", "title": "대안 표현 1", "description": "이 대안의 특징을 짧게 (예: 보수적 표현 · 수치 대신 안정성으로)" },
    { "emoji": "📊", "title": "대안 표현 2", "description": "기간 한정 · 헤맸던 2년 제외 같은 식" },
    { "emoji": "⭐", "title": "대안 표현 3", "description": "강점 중심 · 0건 대신 일하는 방식 같은 식" }
  ]
}

emoji는 각 대안의 성격에 맞게 선택 (🚀 도전적, 📊 데이터, ⭐ 강점, 💡 아이디어, 🎯 핵심 등 중에)

예시 1 - 일반 옵션 (chips):
{
  "text": "샘플 경력기술서 1에서 AI가 추정한 부분이 두 곳 있어요. 어느 부분부터 다듬을까요?",
  "chips": ["✅ 정합성 100% 유지", "❗ 12년 연속 0건", "✅ 월 평균 1,500여 건"],
  "card": null
}

예시 2 - 특정 표현 대안 (card):
{
  "text": "먼저 '12년 연속 0건' 부분부터 다듬어드릴게요.",
  "chips": [],
  "card": {
    "title": "12년 연속 마감 지연 0건",
    "subtitle": "이력서 '목표' 섹션의 기존 표현",
    "options": [
      { "emoji": "🚀", "title": "안정적인 결산 마감 프로세스 운영", "description": "보수적 표현 · 수치 대신 안정성으로" },
      { "emoji": "📊", "title": "최근 10년 결산 마감 지연 0건", "description": "기간 한정 · 헤맸던 2년 제외" },
      { "emoji": "⭐", "title": "꼼꼼한 자료 검증을 통한 결산 정확도", "description": "강점 중심 · 0건 대신 일하는 방식" }
    ]
  }
}`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT
    });
    
    // messages 배열을 Gemini 형식으로 변환
    // messages: [{ type: 'user' | 'agent', text: string }]
    const history = messages.slice(0, -1).map((msg: { type: string; text: string }) => ({
      role: msg.type === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    
    const lastMessage = messages[messages.length - 1];
    
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.text);
    const response = result.response;
    const text = response.text();

    type CardOption = { emoji: string; title: string; description: string };
    type Card = { title: string; subtitle: string; options: CardOption[] };
    let parsedResponse: { text: string; chips: string[]; card: Card | null };
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : text;
      const raw = JSON.parse(jsonString);

      if (typeof raw.text !== 'string') {
        throw new Error('text 필드 없음');
      }
      const chips = Array.isArray(raw.chips) ? raw.chips : [];

      let card: Card | null = null;
      if (raw.card && typeof raw.card === 'object' && Array.isArray(raw.card.options)) {
        card = {
          title: String(raw.card.title || ''),
          subtitle: String(raw.card.subtitle || ''),
          options: raw.card.options
            .filter((o: any) => o && typeof o === 'object')
            .map((o: any) => ({
              emoji: String(o.emoji || '✨'),
              title: String(o.title || ''),
              description: String(o.description || ''),
            })),
        };
      }

      parsedResponse = { text: raw.text, chips, card };
    } catch (parseError) {
      console.warn('JSON 파싱 실패, 원본 텍스트 사용:', parseError);
      parsedResponse = { text: text, chips: [], card: null };
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Gemini API 호출 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.', detail: String(error) },
      { status: 500 }
    );
  }
}
