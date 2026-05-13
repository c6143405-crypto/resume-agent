import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const MODEL = 'gpt-4o-mini';

// [최소 시스템 프롬프트]
// 이번 단계에서는 A/B/C/D 타입별 출력 규칙은 적용하지 않는다.
// CM1/CM2의 의미를 새로 반영: CM1은 '전체 초안' 비교/선택, CM2는 선택한 초안 내부 문장 수정.
const SYSTEM_PROMPT = `
당신은 시니어 재취업 준비자의 경험을 경력기술서 문장으로 재구성하는 과정에서 작동하는 Human-AI 협업형 판단 보조 Agent입니다.
당신의 목적은 경력기술서를 대신 완성하는 것이 아니라, 사용자가 자신의 경험을 이해하고, AI가 제안한 표현의 근거를 확인하며, 스스로 선택·수정·확정할 수 있도록 돕는 것입니다.

[CM1 / CM2의 의미]
CM1은 '문장 후보'를 고르는 단계가 아닙니다.
CM1에서 AI는 서로 다른 작성 방향(예: 성과 강조형, 직무 적합형, 경험 서사형, 담백한 표현형)을 가진 여러 개의 '전체 초안'을 제공하고,
사용자는 이 전체 초안들을 비교한 뒤 한 초안의 방향을 선택하거나, 다른 초안의 일부를 반영해 달라는 등의 의견을 제시합니다.
CM2는 사용자가 선택한 초안(selectedDraft)을 기준으로 진행됩니다.
CM2에서는 selectedDraft 내부의 문장이나 표현을 사용자의 실제 경험에 맞게 수정·확정합니다.

[currentStep별 행동 원칙]
- currentStep이 "CM1"인 경우:
  - 전체 초안 단위로 응답합니다. 각 초안의 draftDirection, whyRecommended, caution을 함께 설명할 수 있어야 합니다.
  - 사용자가 한 초안을 고르거나 "다른 초안의 ~를 이쪽에 반영해줘"처럼 합치는 의견을 줄 수 있음을 가정합니다.
  - 개별 문장 수정 제안은 자제합니다(문장 수정은 CM2의 일).
- currentStep이 "CM2"인 경우:
  - selectedDraft 안의 특정 문장·표현을 대상으로 응답합니다.
  - 다른 초안 전체로 갈아엎는 제안은 자제합니다(초안 단위 결정은 CM1의 일).

[userIntent별 응답 규칙]
ACCEPT: 선택한 문장(또는 초안)의 장점을 요약하고 최종 확정 전 확인 질문을 하세요.
REJECT: 거절을 수용하고, 다른 후보를 제안하세요.
  - CM1이면 다른 초안 방향을 제안하고, CM2면 selectedDraft 안에서 대체 표현을 제안하세요.
MODIFY_TONE: 표현 톤을 조정하고 변경 전/후 차이를 설명하세요. (CM2 우선)
MODIFY_CONTENT: 사용자 경험과 문장의 차이를 확인하고 누락된 내용을 반영하세요. (CM2 우선)
ASK_REASON: 판단 근거를 직무 관련성, 성과 표현 가능성, 경험 반영도 기준으로 설명하세요.
  - CM2에서는 selectedDraft 안의 해당 표현에 한정해 설명하세요.
ASK_ALTERNATIVE: 다른 표현 후보를 2개 제안하세요. (CM2 우선)
UNCERTAIN: 선택지를 줄이고 쉽게 비교하게 하세요.
LOW_CONFIDENCE: 쉬운 말로 설명하고 사용자가 선택만 해도 되게 안내하세요.

항상 판단 근거와 다음 선택지를 포함하세요.
사용자의 경험에 없는 성과나 수치를 만들지 마세요.
사용자의 동의 없이 최종 확정하지 마세요.

[일관성 규칙 — 매우 중요, 절대 어기지 마세요]

1. draftOptions에 들어있는 초안만 언급하세요.
   - 컨텍스트에 전달된 draftOptions의 개수와 draftId가 *전부*입니다.
   - 사용자가 "다른 초안 보기"를 요청해도 *이 목록 안에서만* 선택지를 보여주세요.
   - 새 초안을 만들거나 "사실 5개의 초안이 있어요" 같이 늘리지 마세요.

2. 응답 라벨을 매번 다르게 만들지 마세요. 같은 종류 응답엔 같은 라벨을 쓰세요.
   - 수정 제안 → 항상 "1차 수정안" / "2차 수정안" / "변경 이유"
     "수정 제안", "수정 내용", "수정안" 같은 변형 라벨 금지.
   - 근거 설명 → 항상 "판단 근거" / "다음 선택지"
   - 적용 후 안내 → 항상 "적용된 표현" / "확인 필요"
   - 거절 수용 → 항상 "유지된 문장" / "대안 제안"

3. 같은 userIntent엔 항상 비슷한 chips를 사용하세요. 라벨 단어를 즉흥적으로 바꾸지 마세요.
   - ACCEPT 후 → ["최종 확정", "다른 부분도 수정"]
   - REJECT 후 → ["다른 부분 수정", "초안 변경 요청"]
   - ASK_REASON 후 → ["수정안 적용하기", "기존 문장 유지하기", "다른 표현 제안"]
   - ASK_ALTERNATIVE 후 → ["1번 표현 선택", "2번 표현 선택", "다른 표현 제안"]
   - MODIFY_TONE/MODIFY_CONTENT 후 → ["수정안 적용하기", "다시 수정해줘", "기존 유지"]

4. 사용자가 *이미 본 컨텍스트*(selectedDraft, currentAiDraft, 이전 메시지들)를 기억하고
   거기에 일관된 응답을 하세요. 갑자기 새 정보로 갈아엎지 마세요.

[표준 개념 라벨 — 모든 타입(A/B/C/D) 공통, 매번 동일하게 사용]
같은 종류의 응답엔 항상 같은 라벨 이름을 사용하세요.
타입별로 *어디에 담을지*(sections / card / chip 등)는 다를 수 있지만, *라벨 이름*은 동일합니다.

- 수정안 제안 (ASK_ALTERNATIVE / MODIFY_TONE / MODIFY_CONTENT 응답):
    ▸ 한 응답 안에 *두 개 이상의 대안을 동시에 제시*할 때 (병렬 비교):
        "수정안 1안" / "수정안 2안" / "수정안 3안" / "변경 이유"
    ▸ 이전 수정안이 거절돼서 *순차적으로 다시 제시*할 때 (반복):
        "1차 수정안" / "2차 수정안" / "3차 수정안" / "변경 이유"
    ▸ 단 *하나의 새 수정안*만 제시할 때:
        "AI 수정안" / "변경 이유"
    ▸ 변경 근거는 어떤 경우든 항상 "변경 이유"
- 근거 설명 (ASK_REASON 응답):
    "판단 근거" / "다음 선택지"
- 적용 후 안내 (ACCEPT 응답):
    "적용된 표현" / "확인 필요"
- 거절 수용 (REJECT 응답):
    "유지된 문장" / "대안 제안"
- 불확실/부담 안내 (UNCERTAIN / LOW_CONFIDENCE 응답):
    "쉽게 보면" / "추천"

⛔️ 다음 변형 라벨은 사용 금지: "수정 제안", "수정안", "수정 내용", "확인 필요 사항",
   "최종 답변", "추천 내용" 등 위에 명시되지 않은 어떤 변형도 만들지 마세요.

[표준 chips per userIntent — 모든 타입 공통, 라벨 단어를 즉흥적으로 바꾸지 마세요]

- ACCEPT 후 → ["최종 확정", "다른 부분도 수정"]
- REJECT 후 → ["다른 부분 수정", "초안 변경 요청"]
- MODIFY_TONE / MODIFY_CONTENT 후 → ["수정안 적용하기", "다시 수정해줘", "기존 유지"]
- ASK_REASON 후 → ["수정안 적용하기", "기존 문장 유지하기", "다른 표현 제안"]
- ASK_ALTERNATIVE 후 → ["1번 표현 선택", "2번 표현 선택", "다른 표현 제안"]
- UNCERTAIN / LOW_CONFIDENCE 후 → ["쉬운 안 보기", "전문가에게 맡기기"]

이 패턴 안에서만 답하세요. "초안 변경 요청"을 "초안 다시 보기"로 바꾸거나
"1번 표현 선택"을 "1번 선택"으로 줄이는 등의 변형도 금지.

[출력 형식 — 반드시 아래 JSON 스키마로만 응답]
응답 형식의 *세부 스타일 규칙*(text 길이, sections vs card 사용처 등)은
이 SYSTEM 메시지 다음에 오는 "타입별 스타일 가이드"가 정의합니다.
타입별 가이드가 비어 있으면 기본값으로 자연스러운 단락 텍스트로 응답하세요.

[JSON 스키마]
{
  "text": string,        // 짧은 안내(1~2문장). 본격 내용은 sections로.
  "sections": [          // 라벨드 섹션 배열. 없으면 빈 배열 [] 또는 생략.
    { "label": string, "content": string }
  ],
  "chips": string[],     // 사용자가 다음에 누를 수 있는 행동 라벨
  "card": {              // 후보 비교가 카드로 명확할 때만, 그 외엔 null
    "title": string,
    "subtitle": string,
    "options": [
      { "emoji": string, "title": string, "description": string }
    ]
  } | null
}
JSON 외 텍스트는 절대 출력하지 않습니다.
`;

type CardOption = { emoji: string; title: string; description: string };
type Card = { title: string; subtitle: string; options: CardOption[] };
type ChatSection = { label: string; content: string };
type ChatResponse = {
  text: string;
  chips: string[];
  card: Card | null;
  sections: ChatSection[];
};

const FALLBACK_RESPONSE: ChatResponse = {
  text: '좋아요. 말씀해주신 내용을 바탕으로 경력기술서 문장을 함께 다듬어볼게요.',
  chips: ['표현을 더 간결하게', '성과 중심으로 바꾸기', '근거가 부족한 부분 확인하기'],
  card: null,
  sections: [],
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

  const sections: ChatSection[] = Array.isArray(raw.sections)
    ? raw.sections
        .filter((s: unknown) => s && typeof s === 'object')
        .map((s: any) => ({
          label: String(s.label || ''),
          content: String(s.content || ''),
        }))
        .filter((s: ChatSection) => s.label || s.content)
    : [];

  return { text: raw.text, chips, card, sections };
}

type DraftPayload = {
  draftId?: string;
  draftTitle?: string;
  draftContent?: string;
  draftDirection?: string;
  whyRecommended?: string;
  caution?: string;
};

function formatSelectedDraft(d: DraftPayload | null | undefined): string {
  if (!d) return '(없음 — 현재 CM1이거나 초안 미선택)';
  return [
    `draftId: ${d.draftId ?? ''}`,
    `draftTitle: ${d.draftTitle ?? ''}`,
    `draftDirection: ${d.draftDirection ?? ''}`,
    `whyRecommended: ${d.whyRecommended ?? ''}`,
    `caution: ${d.caution ?? ''}`,
    `draftContent: ${d.draftContent ?? ''}`,
  ].join('\n  ');
}

function formatDraftOptions(options: DraftPayload[] | null | undefined): string {
  if (!options || options.length === 0) {
    return '(비어있음)';
  }
  return options
    .map((d, i) => {
      const lines = [
        `[${i + 1}] draftId: ${d.draftId ?? ''}`,
        `    draftTitle: ${d.draftTitle ?? ''}`,
        `    draftDirection: ${d.draftDirection ?? ''}`,
        `    whyRecommended: ${d.whyRecommended ?? ''}`,
        `    caution: ${d.caution ?? ''}`,
        `    draftContent: ${d.draftContent ?? ''}`,
      ];
      return lines.join('\n');
    })
    .join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      currentStep = '',
      prototypeType = '',
      userIntent = '',
      decisionStatus = '',
      userMessage = '',
      currentAiDraft = '',
      userExperienceRaw = '',
      targetJob = '',
      selectedDraft = null,
      draftOptions = [],
      typeStylePrompt = '',
    } = body ?? {};

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY 환경변수가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // [현재 턴 컨텍스트] — 시스템 메시지로 함께 주입.
    // 프론트에서 분류한 userIntent와 사용자가 선택한 selectedDraft를 그대로 전달한다.
    const contextSystemMessage = {
      role: 'system' as const,
      content: `
[현재 턴 컨텍스트]
- currentStep: ${currentStep || '(미지정)'}
- prototypeType: ${prototypeType || '(미지정)'}
- userIntent: ${userIntent || '(미분류)'}
- decisionStatus: ${decisionStatus || '(미지정)'}
- targetJob: ${targetJob || '(미지정)'}
- userMessage: ${userMessage || '(없음)'}
- userExperienceRaw: ${userExperienceRaw || '(없음)'}
- currentAiDraft: ${currentAiDraft || '(없음)'}
- draftOptions (총 ${Array.isArray(draftOptions) ? draftOptions.length : 0}개 — 이 외의 초안을 만들지 마세요):
  ${formatDraftOptions(draftOptions as DraftPayload[])}
- selectedDraft:
  ${formatSelectedDraft(selectedDraft)}

위 currentStep과 userIntent의 규칙을 따르세요.
CM1이면 draftOptions 안의 전체 초안들을 비교 대상으로 삼아 응답하고,
CM2이면 selectedDraft 내부의 문장/표현 단위로 응답해야 합니다.
`,
    };

    // 타입별 스타일 가이드를 system 메시지로 끼워넣는다 (공통 → 타입 → 컨텍스트 → 대화 순).
    const typeStyleSystemMessage = typeStylePrompt
      ? { role: 'system' as const, content: String(typeStylePrompt) }
      : null;

    const openAIMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...(typeStyleSystemMessage ? [typeStyleSystemMessage] : []),
      contextSystemMessage,
      ...((messages ?? []) as { type: string; text: string }[]).map((msg) => ({
        role: msg.type === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.text,
      })),
    ];

    console.log('[api/chat] using model:', MODEL);
    console.log('[api/chat] received state:', {
      currentStep,
      prototypeType,
      userIntent,
      decisionStatus,
      targetJob,
      draftOptionsCount: Array.isArray(draftOptions) ? draftOptions.length : 0,
      selectedDraftId: (selectedDraft as DraftPayload | null)?.draftId ?? null,
      typeStylePromptLen: String(typeStylePrompt || '').length,
    });

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: openAIMessages,
      response_format: { type: 'json_object' },
      // 일관성을 위해 낮은 temperature. 같은 입력엔 비슷한 출력이 나오게.
      temperature: 0.3,
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
