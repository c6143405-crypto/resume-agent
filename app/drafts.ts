// CM1에서 사용자가 비교·선택하는 '전체 초안' 후보 (프로토타입용 샘플 데이터).
// 각 초안은 같은 사용자 경험을 바탕으로 하지만 'AI agent의 작성 성향'이 달라서
// draftContent / body 구성이 서로 다르게 나타난다.

import type { Draft } from "./agent-state";

export const SAMPLE_DRAFTS: Draft[] = [
  // ─────────────────────────────────────────────────────
  // 1) 성과 강조형 — AI가 수치·결과 중심으로 정리
  // ─────────────────────────────────────────────────────
  {
    draftId: "draft-01",
    draftTitle: "성과 강조형 초안",
    draftDirection: "업무 경험을 성과와 처리 능력 중심으로 정리합니다.",
    draftContent:
      "12년간 (주)A 의류 회계팀에서 월·연 결산 마감 프로세스를 전담 운영하며, " +
      "외부 회계 감사 12년 연속 지적 사항 0건과 매입·매출 전표 월 평균 1,500여 건 처리를 달성했습니다.",
    whyRecommended:
      "사용자의 장기 사무직 경험을 채용시장에서 이해하기 쉬운 성과 표현으로 바꾸는 데 적합합니다.",
    caution:
      "구체적인 수치나 사례가 부족하면 일부 표현이 과장되어 보일 수 있습니다.",
    refinementTarget: {
      originalSentence:
        "외부 회계 감사 12년 연속 지적 사항 0건 달성",
      revisedSentence:
        "최근 10년간 외부 회계 감사에서 지적 사항이 발생하지 않도록 결산 정확도를 관리",
      changeReason:
        "\"12년 연속 0건\"은 AI 추정 정확율이 50%로 일부 헤맸던 초기 2년의 기억과 차이가 있을 수 있어, 사용자가 직접 확인 가능한 범위(최근 10년)로 보수적으로 표현했습니다.",
    },
    body: {
      company: "(주) A 의류 — 의류 유통 기업",
      period: "2012.03 ~ 현재 (12년 2개월) · 회계팀 과장",
      projectTitle: "프로젝트 1 · 월·연 결산 마감 프로세스 운영",
      projectChip: { label: "월말 마감 칠 때 자료부터 미리 챙겨놨어요", variant: "gray" },
      overview:
        "직원 30명 규모 의류 유통 기업의 월·연 결산 마감 프로세스를 12년간 전담 운영한 프로젝트",
      goals: [
        {
          text: "매월 결산 마감 일정 안정화 및 정확성 확보",
          chips: [
            { label: "매년 결산을 대표님께 보고했어요", variant: "gray" },
            { label: "AI · 정확율 70%", variant: "blue" },
          ],
        },
        {
          text: "외부 회계 감사 12년 연속 지적 사항 0건 달성",
          chips: [
            { label: "외부 회계 관리도 했었어요", variant: "gray" },
            { label: "AI · 정확율 50%", variant: "purple" },
          ],
        },
      ],
      roleAndResults: [
        {
          text: "매입·매출 전표 월 평균 1,500여 건 처리 및 검증",
          chips: [
            { label: "장부 매기고 세금계산서 끊는 일이요", variant: "gray" },
            { label: "AI · 정확율 80%", variant: "blue" },
          ],
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────
  // 2) 직무 적합형 — AI가 협업·검증·직무 역량 중심으로 정리
  // ─────────────────────────────────────────────────────
  {
    draftId: "draft-02",
    draftTitle: "직무 적합형 초안",
    draftDirection: "지원 직무와 연결되는 역량을 중심으로 정리합니다.",
    draftContent:
      "30명 규모 의류 유통 기업에서 회계팀 과장으로 12년간 근무하며, 매월 결산 일정을 안정적으로 운영하고 " +
      "세무사와 협업해 자료를 두 번씩 검증하는 방식으로 결산의 정확도를 유지했습니다.",
    whyRecommended:
      "사용자의 총무·행정·조율 경험을 현재 채용 직무와 연결하기 쉽습니다.",
    caution:
      "개인의 경력 맥락이나 서사가 다소 줄어들 수 있습니다.",
    refinementTarget: {
      originalSentence:
        "세무 협업을 통한 회계 자료 정합성 확보",
      revisedSentence:
        "매월 세무사에게 자료를 전달하기 전 두 차례 검토해 자료 정합성을 확인",
      changeReason:
        "\"정합성 확보\"는 다소 추상적으로 들릴 수 있어, 사용자가 실제로 했다고 말한 \"두 번 확인\" 행위로 구체화했습니다.",
    },
    body: {
      company: "(주) A 의류 — 의류 유통 기업",
      period: "2012.03 ~ 현재 (12년 2개월) · 회계팀 과장",
      projectTitle: "프로젝트 1 · 회계 데이터 검증 및 세무 협업 운영",
      projectChip: {
        label: "세무사한테 보내기 전에 두 번씩 확인했어요",
        variant: "gray",
      },
      overview:
        "의류 유통 기업의 월 회계 운영에서 세무사·대표·외부 감사와의 협업 체계를 유지하고, 자료 정합성을 검증해 온 직무 경험",
      goals: [
        {
          text: "세무 협업을 통한 회계 자료 정합성 확보",
          chips: [
            { label: "세무사 자료 두 번 확인했어요", variant: "gray" },
            { label: "AI · 정확율 75%", variant: "blue" },
          ],
        },
        {
          text: "결산 마감 일정에 맞춘 자료 사전 정리 및 공유",
          chips: [
            { label: "월말 되기 전에 자료를 미리 모았어요", variant: "gray" },
            { label: "AI · 정확율 80%", variant: "blue" },
          ],
        },
      ],
      roleAndResults: [
        {
          text: "매입·매출 전표 검증 및 세무 자료 정리 담당",
          chips: [
            { label: "장부 매기고 세금계산서 정리했어요", variant: "gray" },
            { label: "AI · 정확율 85%", variant: "blue" },
          ],
        },
        {
          text: "대표 보고용 결산 자료 작성 및 공유",
          chips: [
            { label: "결산 끝나면 대표님께 정리해서 드렸어요", variant: "gray" },
            { label: "AI · 정확율 65%", variant: "purple" },
          ],
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────
  // 3) 경험 서사형 — AI가 시간 흐름·역할 변화 중심으로 정리
  // ─────────────────────────────────────────────────────
  {
    draftId: "draft-03",
    draftTitle: "경험 서사형 초안",
    draftDirection: "오랜 경력의 흐름과 역할 변화를 중심으로 정리합니다.",
    draftContent:
      "(주)A 의류에 2012년 입사해 회계 담당으로 시작한 뒤 과장으로 성장하기까지, " +
      "월말 마감 자료를 미리 챙기는 습관과 세무사와의 협업 방식을 다듬어가며 결산 운영을 안정화시켜 왔습니다.",
    whyRecommended:
      "사용자의 장기 경력과 축적된 경험을 자연스럽게 설명하는 데 적합합니다.",
    caution:
      "문장이 길어질 수 있어 경력기술서에서 핵심이 덜 선명해질 수 있습니다.",
    refinementTarget: {
      originalSentence:
        "12년에 걸쳐 회계 운영 방식을 단계적으로 다듬어옴",
      revisedSentence:
        "12년간 회계 운영에서 매년 자료 정리 방식을 점검하고 보완해 옴",
      changeReason:
        "\"단계적으로 다듬어옴\"은 다소 모호하게 들릴 수 있어, 사용자가 실제 매년 자료 정리 방식을 점검하고 보완해온 행동에 가깝게 풀어 썼습니다.",
    },
    body: {
      company: "(주) A 의류 — 의류 유통 기업",
      period: "2012.03 ~ 현재 (12년 2개월) · 회계팀 과장",
      projectTitle: "프로젝트 1 · 입사 후 회계 운영을 다듬어 온 12년의 흐름",
      projectChip: {
        label: "입사하고 한참 헤매다 자리잡았어요",
        variant: "gray",
      },
      overview:
        "2012년 회계 담당으로 입사한 뒤 과장으로 성장하기까지, 결산 마감 운영을 익혀가며 회계 프로세스를 안정화시켜 온 과정",
      goals: [
        {
          text: "입사 초기 결산 마감 흐름을 익히고 운영 방식을 학습",
          chips: [
            { label: "처음엔 마감 한 번 칠 때마다 정신 없었어요", variant: "gray" },
            { label: "AI · 정확율 70%", variant: "blue" },
          ],
        },
        {
          text: "경력이 쌓이면서 자료 관리 방식 정립",
          chips: [
            { label: "나만의 정리 방식이 점점 생겼어요", variant: "gray" },
            { label: "AI · 정확율 60%", variant: "purple" },
          ],
        },
      ],
      roleAndResults: [
        {
          text: "12년에 걸쳐 회계 운영 방식을 단계적으로 다듬어옴",
          chips: [
            { label: "매년 더 빨라지고 정확해졌어요", variant: "gray" },
            { label: "AI · 정확율 55%", variant: "purple" },
          ],
        },
        {
          text: "담당자에서 과장으로 역할 확대, 후배 자료 검토 병행",
          chips: [
            { label: "후배 자료도 같이 봐주게 됐어요", variant: "gray" },
            { label: "AI · 정확율 65%", variant: "purple" },
          ],
        },
      ],
    },
  },
];

// 기존 editingSampleIndex(number)와 selectedDraft를 매핑.
export function findDraftBySampleIndex(index: number): Draft | undefined {
  return SAMPLE_DRAFTS[index];
}
