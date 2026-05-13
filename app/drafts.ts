// CM1에서 사용자가 비교·선택하는 '전체 초안' 후보 (프로토타입용 샘플 데이터).
// 각 초안은 서로 다른 작성 방향을 가진다.
// 실제 UI(BottomSheet)는 기존 마크업을 유지하며, 이 데이터는 상태/페이로드/AI 컨텍스트용으로 쓰인다.

import type { Draft } from "./agent-state";

export const SAMPLE_DRAFTS: Draft[] = [
  {
    draftId: "draft-01",
    draftTitle: "성과 강조형 초안",
    draftDirection: "성과와 업무 처리 능력을 중심으로 구성",
    draftContent:
      "12년간 (주)A 의류 회계팀에서 월·연 결산 마감 프로세스를 전담 운영하며, " +
      "외부 회계 감사 12년 연속 지적 사항 0건과 매입·매출 전표 월 평균 1,500여 건 처리를 달성했습니다.",
    whyRecommended:
      "사용자의 장기 회계 경험을 채용시장 언어로 가장 직접적으로 연결함",
    caution:
      "성과 수치가 부족하면 일부 표현이 과장되어 보일 수 있음",
  },
  {
    draftId: "draft-02",
    draftTitle: "직무 적합형 초안",
    draftDirection: "지원 직무와 연결되는 역량 중심으로 구성",
    draftContent:
      "30명 규모 의류 유통 기업에서 회계팀 과장으로 12년간 근무하며, 매월 결산 일정을 안정적으로 운영하고 " +
      "세무사와 협업해 자료를 두 번씩 검증하는 방식으로 결산의 정확도를 유지했습니다.",
    whyRecommended:
      "지원 직무의 회계·세무 협업 역량과의 연결성이 높음",
    caution:
      "개인의 경력 맥락이 다소 축약될 수 있음",
  },
];

// 기존 editingSampleIndex(0|1)와 selectedDraft를 매핑.
export function findDraftBySampleIndex(index: 0 | 1): Draft {
  return SAMPLE_DRAFTS[index];
}
