import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const MODEL = 'gpt-5.4-mini';
const SYSTEM_PROMPT =
  '너는 한국어 경력기술서 작성 에이전트다. 사용자의 경험을 채용 언어로 정리하고, 반드시 JSON 형식으로만 답한다.';

type CardOption = { emoji: string; title: string; description: string };
type Card = { title: string; subtitle: string; options: CardOption[] };
type ChatResponse = { text: string; chips: string[]; card: Card | null };

const FALLBACK_RESPONSE: ChatResponse = {
  text: '좋아요. 말씀해주신 내용을 바탕으로 경력기술서 문장을 함께 다듬어볼게요.',
  chips: ['표현을 더 간결하게', '성과 중심으로 바꾸기', '근거가 부족한 부분 확인하기'],
  card: null,
};

function parseOpenAIResponse(content: string): ChatResponse {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : content;
  const raw = JSON.parse(jsonString);

  if (typeof raw.text !== 'string') {
    throw new Error('text 필드 없음');
  }

  const chips = Array.isArray(raw.chips) ? raw.chips.map((chip: unknown) => String(chip)) : [];
  let card: Card | null = null;

  if (raw.card && typeof raw.card === 'object' && Array.isArray(raw.card.options)) {
    card = {
      title: String(raw.card.title || ''),
      subtitle: String(raw.card.subtitle || ''),
      options: raw.card.options
        .filter((option: unknown) => option && typeof option === 'object')
        .map((option: any) => ({
          emoji: String(option.emoji || '✨'),
          title: String(option.title || ''),
          description: String(option.description || ''),
        })),
    };
  }

  return { text: raw.text, chips, card };
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY 환경변수가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const openAIMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages.map((msg: { type: string; text: string }) => ({
        role: msg.type === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.text,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: openAIMessages,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content ?? '';

    try {
      return NextResponse.json(parseOpenAIResponse(content));
    } catch (parseError) {
      console.warn('OpenAI JSON 파싱 실패, fallback 반환:', parseError);
      return NextResponse.json(FALLBACK_RESPONSE);
    }
  } catch (error) {
    console.error('OpenAI API 호출 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.', detail: String(error) },
      { status: 500 }
    );
  }
}
