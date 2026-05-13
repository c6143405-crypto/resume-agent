// 판단보조형 Agent 상태값 타입 정의 (T3 '경험 표현 구체화' 단계 / CM1·CM2)
// page.tsx에서 import해서 사용한다.

// [CM1/CM2 의미]
// CM1: AI가 여러 개의 전체 초안을 제공하고, 사용자가 그 중 한 초안의 방향을 선택하거나 의견을 내는 단계.
//      대상은 '문장 후보'가 아니라 '전체 초안'이다.
// CM2: 선택한 초안 내부의 문장·표현을 사용자의 실제 경험에 맞게 수정·확정하는 단계.

export type CurrentStep = "CM1" | "CM2";

export type PrototypeType = "A" | "B" | "C" | "D";

export type UserIntent =
  | "ACCEPT"
  | "REJECT"
  | "MODIFY_TONE"
  | "MODIFY_CONTENT"
  | "ASK_REASON"
  | "ASK_ALTERNATIVE"
  | "UNCERTAIN"
  | "LOW_CONFIDENCE";

export type DecisionStatus =
  | "draft"
  | "selected"
  | "modified"
  | "confirmed"
  | "rejected";

// CM1에서 비교 대상이 되는 '전체 초안' 단위.
export interface Draft {
  draftId: string;
  draftTitle: string;
  draftContent: string;
  draftDirection: string; // 예: 성과 강조형 / 직무 적합형 / 경험 서사형 / 담백한 표현형
  whyRecommended: string;
  caution: string;
}

export type SelectedDraft = Draft | null;

export interface AgentState {
  currentStep: CurrentStep;
  prototypeType: PrototypeType;
  userIntent: UserIntent | null;
  decisionStatus: DecisionStatus;
  selectedDraft: SelectedDraft;
  // CM1에서 비교 가능한 전체 초안 목록.
  // 사용자가 한 초안을 고르면 그 항목이 selectedDraft로 옮겨간다.
  draftOptions: Draft[];
}

export const DEFAULT_AGENT_STATE: AgentState = {
  currentStep: "CM1",
  prototypeType: "A",
  userIntent: null,
  decisionStatus: "draft",
  selectedDraft: null,
  draftOptions: [],
};
