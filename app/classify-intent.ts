// 사용자 입력 문장을 의사결정 신호(UserIntent)로 분류하는 함수.
// 키워드 기반 1차 분류. 추후 AI 분류기로 교체할 수 있도록 인터페이스를 단순하게 유지한다.
//
// 분류 규칙은 13_의도분류_정책.md를 따른다.
// - INTENT_KEYWORDS 배열은 4-Tier 우선순위 순서대로 정렬돼 있다.
//   위에서부터 검사하며 먼저 매칭되는 intent를 반환한다 = 복합 입력 시 높은 Tier가 우선.
// - 어떤 키워드에도 안 걸리고 양가/모호 어미가 있으면 CLARIFY(명확화 되묻기).
// - 그 외 미매칭은 UNCERTAIN.

import type { UserIntent } from "./agent-state";

// intent별 매칭 키워드. 배열 순서 = 13번 정책의 4-Tier 우선순위.
const INTENT_KEYWORDS: Array<{ intent: UserIntent; keywords: string[] }> = [
  // ── Tier 1: 작업 지시 ──
  {
    intent: "MODIFY_CONTENT",
    keywords: [
      "제가 한 일", "제가 안", "안 해본", "경험에 맞게", "제 경험",
      "수치는", "업무 범위", "제 일이랑", "한 업무는", "사실이 아니",
      "팀에서 한", "내 경험이 아니", "추가해", "반영해줘", "반영해 줘",
      "다른데요", "어긋", "달라요", "살려주",
    ],
  },
  {
    intent: "MODIFY_TONE",
    keywords: [
      "덜 과장", "과장", "겸손", "자랑", "차분", "강한 표현", "강하게",
      "단정적", "부드럽게", "셉니다", "톤다운", "톤 다운", "잘난 척",
      "자연스럽게", "전문적으로", "쉽게 바꿔",
    ],
  },
  // ── Tier 2: 정보 요청 ──
  {
    intent: "ASK_ALTERNATIVE",
    keywords: [
      "다른 표현", "다른 거", "다른 것", "다른 안", "다른 옵션", "다른 방향",
      "다른 식", "다른 버전", "다른 후보", "또 다른", "또 보여",
      "또 어떤", "비슷한 거 더", "다시 추천", "다시 수정",
    ],
  },
  {
    intent: "ASK_REASON",
    keywords: ["왜", "이유", "근거", "어떤 점", "어떤 면", "궁금"],
  },
  // ── Tier 3: 진행·결정 ──
  {
    intent: "NEXT_ITEM",
    keywords: [
      "다음 거", "다음 항목", "다음으로", "다음 문장", "다음 검토",
      "넘어", "그 다음",
    ],
  },
  {
    intent: "REJECT",
    keywords: [
      "아닌 것 같", "아니에요", "별로", "말고", "빼주", "빼 주",
      "스타일이 아니", "어색", "안 맞", "맞지 않", "마음에 안 들",
      "싫어", "기존 문장 유지",
    ],
  },
  {
    intent: "ACCEPT",
    keywords: [
      "좋아요", "좋네", "마음에 들", "마음에 듭", "이대로", "이걸로",
      "결정할", "적당", "이거면 됐", "됐어요", "가겠습니다",
      "가죠", "확정", "사용할게", "수정안 적용", "낫긴", "더 나아",
    ],
  },
  // ── Tier 4: 상태 표현 ──
  {
    intent: "LOW_CONFIDENCE",
    keywords: [
      "자신이 없", "자신은 없", "자신 없", "맞나 싶", "어렵게",
      "안 써봐", "부담", "거창", "할 수 있을까", "괜찮을지", "해도 되나",
      "낯설", "복잡해", "못하겠",
    ],
  },
  {
    intent: "UNCERTAIN",
    keywords: [
      "잘 모르겠", "모르겠", "고민", "어떤 게 나은", "비슷해",
      "비슷한 것", "판단이 안", "글쎄", "결정하기 어려",
    ],
  },
];

// CLARIFY(명확화 되묻기)를 발동시키는 양가/모호 어미.
// 어떤 의도 키워드에도 안 걸렸을 때만 검사한다.
const CLARIFY_MARKERS = ["긴 한데", "진 않", "아닌가요"];

export function classifyUserIntent(userMessage: string): UserIntent {
  const normalized = userMessage.trim();
  if (!normalized) {
    return "UNCERTAIN";
  }

  // 숫자 사실 교정은 MODIFY_CONTENT로 최우선 처리.
  const hasNumericFact = /\d+\s*(건|년|개월|명|회|개|원|만원|억|%|퍼센트)/.test(normalized);
  const soundsLikeCorrection =
    /^(아니|ㄴㄴ|노|아냐|아니야)/.test(normalized) ||
    /(이야|야|였어|이었어|입니다|임|라고|라니까|으로|로|이에요|예요|이거든|거든)\s*$/.test(
      normalized
    ) ||
    normalized.length <= 12;
  if (hasNumericFact && soundsLikeCorrection) {
    return "MODIFY_CONTENT";
  }

  // 4-Tier 우선순위 순서대로 키워드 검사.
  for (const { intent, keywords } of INTENT_KEYWORDS) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return intent;
    }
  }

  // 어떤 의도 키워드에도 안 걸림.
  // 양가/모호 어미가 있으면 명확화 되묻기(CLARIFY), 아니면 망설임(UNCERTAIN).
  if (CLARIFY_MARKERS.some((marker) => normalized.includes(marker))) {
    return "CLARIFY";
  }
  return "UNCERTAIN";
}
