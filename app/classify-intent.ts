// 사용자 입력 문장을 의사결정 신호(UserIntent)로 분류하는 함수.
// 단순 채팅이 아닌 '판단보조형 Agent'를 위한 키워드 기반 1차 분류.
// 추후 AI 분류기로 교체할 수 있도록 인터페이스를 단순하게 유지한다.

import type { UserIntent } from "./agent-state";

// intent별 매칭 키워드.
// 배열의 위 → 아래 순서대로 검사하며, 먼저 매칭되는 intent를 반환한다.
// 짧고 자주 쓰이는 단어("왜", "좋아요" 등)가 다른 의미를 덮어쓰지 않도록
// 질문(ASK_*)·거절(REJECT)·수정(MODIFY_*)을 ACCEPT보다 앞에 둔다.
const INTENT_KEYWORDS: Array<{ intent: UserIntent; keywords: string[] }> = [
  {
    intent: "ASK_REASON",
    keywords: ["왜 이렇게 판단", "왜", "이유", "근거"],
  },
  {
    intent: "ASK_ALTERNATIVE",
    keywords: ["다른 안", "다른 표현", "다시 추천", "또 보여", "다시 수정"],
  },
  {
    intent: "REJECT",
    keywords: [
      "아닌 것 같아요",
      "싫어요",
      "빼주세요",
      "맞지 않아요",
      "기존 문장 유지",
      "내 경험이 아니",
    ],
  },
  {
    intent: "MODIFY_TONE",
    keywords: [
      "덜 과장",
      "더 자연스럽게",
      "자연스럽게",
      "더 전문적으로",
      "전문적으로",
      "쉽게 바꿔",
    ],
  },
  {
    intent: "MODIFY_CONTENT",
    keywords: ["내 경험이 아니", "추가해줘", "추가해 줘", "반영해줘", "반영해 줘"],
  },
  {
    intent: "UNCERTAIN",
    keywords: ["잘 모르겠", "모르겠", "고민돼", "고민이"],
  },
  {
    intent: "LOW_CONFIDENCE",
    keywords: ["어려워", "복잡해", "못하겠", "부담"],
  },
  {
    intent: "ACCEPT",
    keywords: [
      "좋아요",
      "이걸로 할게요",
      "이걸로 갈게요",
      "확정",
      "사용할게요",
      "수정안 적용",
    ],
  },
];

export function classifyUserIntent(userMessage: string): UserIntent {
  const normalized = userMessage.trim();
  if (!normalized) {
    return "UNCERTAIN";
  }

  const hasNumericFact = /\d+\s*(건|년|개월|명|회|개|원|만원|억|%|퍼센트)/.test(normalized);
  const soundsLikeCorrection =
    /^(아니|ㄴㄴ|노|아냐|아니야)/.test(normalized) ||
    /(이야|야|였어|이었어|입니다|임|라고|라니까|으로|로)\s*$/.test(normalized) ||
    normalized.length <= 12;

  if (hasNumericFact && soundsLikeCorrection) {
    return "MODIFY_CONTENT";
  }

  for (const { intent, keywords } of INTENT_KEYWORDS) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return intent;
    }
  }

  // 어느 키워드에도 걸리지 않으면 사용자가 망설이는 신호로 본다.
  return "UNCERTAIN";
}
