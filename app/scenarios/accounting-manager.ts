// app/scenarios/accounting-manager.ts
// 회계팀 과장 시나리오. 사용자가 정리한 정식 텍스트 기준.

import type { Scenario } from "./types";

export const ACCOUNTING_MANAGER: Scenario = {
  scenarioId: "accounting-manager",
  jobTitle: "회계팀 과장",
  jobCategory: "금융 / 재무 / 회계",
  persona: {
    company: "(주) A 의류 유통 기업",
    period: "2012.03 ~ 현재 (12년 2개월)",
    role: "회계팀 과장",
  },
  drafts: [
    // ─────────────────────────────────────────────
    // 1) 성과 중심 초안
    // ─────────────────────────────────────────────
    {
      draftId: "accounting-manager:draft-01",
      draftTitle: "성과 중심 초안",
      direction: "achievement",
      hashtags: ["감사 0건", "정확도 99%", "5영업일 마감"],
      project: {
        number: 1,
        title: "월·연 결산 마감 운영",
        description:
          "연매출 120억 원 규모의 의류 유통 기업에서 월·연 결산 마감을 12년간 전담하며 결산 정확도와 마감 안정성을 관리했습니다. 월평균 1,500여 건의 매입·매출 전표를 처리·검증하고, 외부 감사 12년 연속 주요 지적 사항 0건, 세무 신고 자료 정확도 99%, 결산 마감 평균 5영업일 이내 운영을 달성했습니다.",
      },
      tasks: [
        { text: "월·연 결산 마감 일정을 관리해 평균 5영업일 이내 마감 체계 유지", emoji: "📅" },
        { text: "월평균 1,500여 건의 매입·매출 전표 처리 및 오류 검증", emoji: "📊" },
        { text: "부가세·법인세 신고 자료를 정리해 세무 신고 데이터 정확도 99% 수준 유지", emoji: "💳" },
        { text: "외부 감사 요청 자료를 사전 검토해 12년 연속 주요 지적 사항 0건 유지", emoji: "🛡️" },
      ],
      achievements: [
        { text: "외부 회계 감사 12년 연속 주요 지적 사항 0건 유지", emoji: "✅" },
        { text: "월평균 1,500여 건의 매입·매출 전표 처리 및 검증", emoji: "📊" },
        { text: "부가세·법인세 신고 자료 정확도 99% 수준 유지", emoji: "🎯" },
        { text: "월·연 결산 마감 평균 5영업일 이내 관리", emoji: "⚡" },
      ],
      whyRecommended:
        "12년간의 결산·감사·세무 운영 성과를 정량 수치 중심으로 정리했어요. 감사 지적 0건, 정확도 99%, 5영업일 마감을 핵심 성과로 강조했어요.",
      caution: "정성적 개선 사례가 있으면 더 풍성해질 수 있어요.",
      refinementTarget: {
        originalSentence: "외부 회계 감사 12년 연속 주요 지적 사항 0건 유지",
        revisedSentence:
          "최근 10년간 외부 회계 감사에서 주요 지적 사항이 발생하지 않도록 결산 자료를 관리",
        changeReason:
          "\"12년 연속 0건\"은 검증 가능한 범위(최근 10년)로 보수적으로 표현해 신뢰성을 높였습니다.",
      },
    },

    // ─────────────────────────────────────────────
    // 2) 직무 적합 중심 초안
    // ─────────────────────────────────────────────
    {
      draftId: "accounting-manager:draft-02",
      draftTitle: "직무 적합 중심 초안",
      direction: "fit",
      hashtags: ["회계운영 총괄", "세무 리스크 관리", "감사 대응"],
      project: {
        number: 1,
        title: "회계 직무 전반 운영 및 감사·세무 대응 총괄",
        description:
          "연매출 120억 원 규모 기업의 월·연 결산, 세무 신고 자료 검증, 외부 회계 감사 대응, 경영진 재무 보고를 총괄하며 회계 직무 전반의 핵심 프로세스를 운영했습니다. 재무 데이터의 정확성, 세무 리스크 관리, 감사 대응력, 경영 의사결정 지원 역량을 기반으로 안정적인 회계 관리 체계를 유지했습니다.",
      },
      tasks: [
        { text: "월·연 결산 프로세스 수립 및 마감 일정 관리", emoji: "📐" },
        { text: "매입·매출 전표, 비용 자료, 세무 신고 기초 데이터 검토", emoji: "🔍" },
        { text: "부가세·법인세 신고를 위한 증빙 자료 정리 및 세무 리스크 점검", emoji: "📄" },
        { text: "외부 회계 감사 수검 대응 및 감사인 요청 자료 작성", emoji: "🛡️" },
        { text: "결산 종료 후 대표이사 보고용 재무 자료 작성", emoji: "📈" },
      ],
      achievements: [
        { text: "결산, 세무, 감사, 보고까지 이어지는 회계 운영 전 과정 담당", emoji: "💼" },
        { text: "전표 및 증빙 자료 검증 체계를 통해 회계 데이터 신뢰도 확보", emoji: "🔍" },
        { text: "세무 신고 기초 자료를 체계화해 신고 오류 및 누락 리스크 감소", emoji: "📋" },
        { text: "외부 감사 대응 프로세스를 안정적으로 운영해 감사 리스크 관리", emoji: "🛡️" },
        { text: "경영진 보고 자료 작성으로 재무 현황 기반 의사결정 지원", emoji: "📈" },
      ],
      whyRecommended:
        "결산·세무·감사·보고를 아우르는 회계 직무 전반 역량을 풀어냈어요. 회계 운영 체계와 리스크 관리 능력을 강조했어요.",
      caution: "정량 수치가 직무 서술 안에 묻혀 보일 수 있어요.",
      refinementTarget: {
        originalSentence: "세무 신고 기초 자료를 체계화해 신고 오류 및 누락 리스크 감소",
        revisedSentence:
          "세무 신고 전 항목별 증빙을 분류·점검해 신고 오류와 누락을 사전에 차단",
        changeReason:
          "\"체계화\"가 추상적으로 들릴 수 있어 실제 행동인 \"항목별 분류·점검\"으로 구체화했습니다.",
      },
    },

    // ─────────────────────────────────────────────
    // 3) 경험 서사 중심 초안
    // ─────────────────────────────────────────────
    {
      draftId: "accounting-manager:draft-03",
      draftTitle: "경험 서사 중심 초안",
      direction: "narrative",
      hashtags: ["반복 거래 정비", "결산 표준화", "12년 신뢰 운영"],
      project: {
        number: 1,
        title: "12년간 의류 유통업 회계 운영 흐름 정비",
        description:
          "의류 유통업 특성상 매입·매출 거래가 반복적으로 발생하고 월별 정산 변동성이 큰 환경에서 결산 지연과 데이터 오류를 줄이는 것이 중요했습니다. 회계 담당자로서 전표 검증, 세무 자료 정리, 감사 대응, 대표 보고까지 이어지는 결산 흐름을 정비하며 12년간 안정적인 재무 운영 체계를 유지했습니다.",
      },
      tasks: [
        { text: "월별 거래량과 정산 일정에 맞춰 결산 마감 순서를 정리", emoji: "📅" },
        { text: "매입·매출 전표와 증빙 자료를 반복 검증해 오류 가능성 축소", emoji: "🔍" },
        { text: "세무 신고 전 필요한 자료를 항목별로 분류해 누락 리스크 관리", emoji: "📂" },
        { text: "외부 감사 시 요청 자료를 신속히 정리하고 소명 자료를 준비", emoji: "🛡️" },
        { text: "결산 결과를 대표가 이해하기 쉬운 보고 자료로 정리", emoji: "📑" },
      ],
      achievements: [
        { text: "반복 거래가 많은 유통업 회계 환경에서 결산 마감 체계를 안정화", emoji: "🏗️" },
        { text: "전표 검증과 증빙 관리 기준을 정리해 회계 오류 발생 가능성 완화", emoji: "🔧" },
        { text: "세무 신고와 외부 감사에 필요한 자료 준비 흐름을 표준화", emoji: "📚" },
        { text: "결산 이후 대표 보고까지 이어지는 재무 보고 루틴을 정착", emoji: "📊" },
        { text: "12년간 결산·세무·감사 업무를 지속적으로 수행하며 회계 운영 신뢰도 확보", emoji: "🤝" },
      ],
      whyRecommended:
        "유통업의 반복 거래 환경에서 결산 흐름을 단계적으로 정비한 서사를 자연스럽게 풀어냈어요. 12년간 축적한 운영 안정성과 신뢰감을 강조했어요.",
      caution: "구체적 수치 성과가 서술 안에 묻혀 보일 수 있어요.",
      refinementTarget: {
        originalSentence: "반복 거래가 많은 유통업 회계 환경에서 결산 마감 체계를 안정화",
        revisedSentence:
          "매월 반복되는 매입·매출 거래를 일정에 맞춰 정리하며 결산 마감 흐름을 안정화",
        changeReason:
          "\"환경에서 안정화\"가 추상적으로 들릴 수 있어 실제 행동인 \"일정에 맞춰 정리\"로 풀어 표현했습니다.",
      },
    },
  ],
  refinementTargets: [
    {
      title: "감사 성과 표현 완화",
      originalSentence: "외부 회계 감사 12년 연속 주요 지적 사항 0건 유지",
      revisedSentence:
        "외부 회계 감사 대응 과정에서 주요 지적 사항 없이 결산 자료 신뢰도 유지",
      changeReason:
        "\"12년 연속\", \"0건\"은 강한 성과 표현이라 증빙이 부족하면 단정적으로 보일 수 있습니다. 감사 대응 성과는 유지하되, 더 신뢰감 있는 표현으로 조정했습니다.",
      originalTags: ["단정 표현"],
      revisedTags: ["신뢰성", "안전/신뢰성"],
      reasonTags: ["과장 완화", "신뢰도 개선"],
      keywords: [
        { original: "12년 연속", revised: "대응 과정에서" },
        { original: "주요 지적 사항 0건 유지", revised: "주요 지적 사항 없이 결산 자료 신뢰도 유지" },
      ],
      byDraft: {
        achievement: {
          originalSentence: "외부 회계 감사 12년 연속 주요 지적 사항 0건 유지",
          revisedSentence:
            "외부 회계 감사 대응 과정에서 주요 지적 사항 없이 결산 자료 신뢰도 유지",
          keywords: [
            { original: "12년 연속", revised: "대응 과정에서" },
            {
              original: "주요 지적 사항 0건 유지",
              revised: "주요 지적 사항 없이 결산 자료 신뢰도 유지",
            },
          ],
        },
        fit: {
          originalSentence: "외부 감사 대응 프로세스를 안정적으로 운영해 감사 리스크 관리",
          revisedSentence: "외부 감사 대응 프로세스 정비를 통한 감사 자료 신뢰도 유지",
          keywords: [
            { original: "안정적으로 운영해", revised: "정비를 통한" },
            { original: "감사 리스크 관리", revised: "감사 자료 신뢰도 유지" },
          ],
        },
        narrative: {
          originalSentence: "외부 감사 시 요청 자료를 신속히 정리하고 소명 자료를 준비",
          revisedSentence:
            "외부 감사 요청 자료 정리 및 소명 자료 준비를 통한 감사 대응 안정화",
          keywords: [
            {
              original: "외부 감사 시 요청 자료를 신속히 정리하고",
              revised: "외부 감사 요청 자료 정리 및",
            },
            { original: "소명 자료를 준비", revised: "소명 자료 준비를 통한 감사 대응 안정화" },
          ],
        },
      },
    },
    // 2/2 — 다지선다: 세무 신고 정확도 표현 수위 조정
    {
      title: "세무 신고 정확도 표현 수위 조정",
      originalSentence: "부가세·법인세 신고 자료 정확도 99% 수준 유지",
      options: [
        {
          label: "A",
          hint: "성과를 명확히 유지",
          text: "부가세·법인세 신고 자료 검증을 통한 정확도 99% 수준 유지",
          tags: ["성과 유지", "정확성"],
          keywords: [
            { original: "신고 자료 정확도 99% 수준 유지", revised: "신고 자료 검증을 통한 정확도 99% 수준 유지" },
          ],
        },
        {
          label: "B",
          hint: "더 신중하고 안전하게 표현",
          text: "부가세·법인세 신고 자료 정기 검토를 통한 신고 오류 및 누락 가능성 최소화",
          tags: ["안전한 표현", "리스크 완화"],
          keywords: [
            { original: "신고 자료 정확도 99% 수준 유지", revised: "신고 자료 정기 검토를 통한 신고 오류 및 누락 가능성 최소화" },
          ],
        },
        {
          label: "C",
          hint: "성과 중심으로 압축",
          text: "세무 신고 자료 검증 체계 운영을 통한 신고 데이터 신뢰도 강화",
          tags: ["성과 압축", "신뢰도"],
          keywords: [
            { original: "부가세·법인세 신고 자료", revised: "세무 신고 자료 검증 체계" },
            { original: "정확도 99% 수준 유지", revised: "신고 데이터 신뢰도 강화" },
          ],
        },
      ],
      changeReason:
        "\"정확도 99%\"는 산정 기준이 없으면 과장처럼 보일 수 있습니다. 수치를 유지할지, 안전하게 낮출지, 성과 중심으로 압축할지 선택할 수 있도록 나눴습니다.",
      originalTags: ["수치 근거 부족"],
      revisedTags: ["정확성", "신뢰성"],
      reasonTags: ["수치 부담 완화", "선택권 제공"],
      byDraft: {
        achievement: {
          originalSentence: "부가세·법인세 신고 자료 정확도 99% 수준 유지",
          options: [
            {
              label: "A",
              hint: "성과를 명확히 유지",
              text: "세무 신고 자료 검증을 통한 정확도 99% 수준 유지",
              tags: ["성과 유지", "정확성"],
              keywords: [
                { original: "부가세·법인세", revised: "세무 신고" },
                { original: "자료 정확도", revised: "자료 검증을 통한 정확도" },
              ],
            },
            {
              label: "B",
              hint: "더 신중하고 안전하게 표현",
              text: "부가세·법인세 신고 자료 정기 검토를 통한 오류 및 누락 가능성 완화",
              tags: ["안전한 표현", "리스크 완화"],
              keywords: [
                { original: "신고 자료 정확도", revised: "신고 자료 정기 검토" },
                { original: "99% 수준 유지", revised: "오류 및 누락 가능성 완화" },
              ],
            },
            {
              label: "C",
              hint: "성과 중심으로 압축",
              text: "세무 신고 자료 검증 체계 운영을 통한 신고 데이터 신뢰도 강화",
              tags: ["성과 압축", "신뢰도"],
              keywords: [
                { original: "부가세·법인세 신고 자료", revised: "세무 신고 자료 검증 체계" },
                { original: "정확도 99% 수준 유지", revised: "신고 데이터 신뢰도 강화" },
              ],
            },
          ],
        },
        fit: {
          originalSentence:
            "세무 신고 기초 자료를 체계화해 신고 오류 및 누락 리스크 감소",
          options: [
            {
              label: "A",
              hint: "성과를 명확히 유지",
              text: "세무 신고 기초 자료 체계화를 통한 신고 오류 및 누락 리스크 완화",
              tags: ["성과 유지", "정확성"],
              keywords: [
                { original: "자료를 체계화해", revised: "자료 체계화를 통한" },
                { original: "리스크 감소", revised: "리스크 완화" },
              ],
            },
            {
              label: "B",
              hint: "더 신중하고 안전하게 표현",
              text: "세무 신고 기초 자료 정기 검토를 통한 신고 오류 및 누락 가능성 완화",
              tags: ["안전한 표현", "리스크 완화"],
              keywords: [
                { original: "자료를 체계화해", revised: "자료 정기 검토를 통한" },
                { original: "누락 리스크 감소", revised: "누락 가능성 완화" },
              ],
            },
            {
              label: "C",
              hint: "성과 중심으로 압축",
              text: "세무 신고 자료 검증 체계 운영을 통한 신고 데이터 신뢰도 강화",
              tags: ["성과 압축", "신뢰도"],
              keywords: [
                { original: "세무 신고 기초 자료", revised: "세무 신고 자료 검증 체계" },
                {
                  original: "신고 오류 및 누락 리스크 감소",
                  revised: "신고 데이터 신뢰도 강화",
                },
              ],
            },
          ],
        },
        narrative: {
          originalSentence:
            "세무 신고 전 필요한 자료를 항목별로 분류해 누락 리스크 관리",
          options: [
            {
              label: "A",
              hint: "성과를 명확히 유지",
              text: "세무 신고 자료 항목별 분류를 통한 누락 리스크 완화",
              tags: ["성과 유지", "정확성"],
              keywords: [
                { original: "세무 신고 전 필요한 자료를", revised: "세무 신고 자료" },
                {
                  original: "항목별로 분류해 누락 리스크 관리",
                  revised: "항목별 분류를 통한 누락 리스크 완화",
                },
              ],
            },
            {
              label: "B",
              hint: "더 신중하고 안전하게 표현",
              text: "세무 신고 자료 정기 검토를 통한 누락 가능성 완화",
              tags: ["안전한 표현", "리스크 완화"],
              keywords: [
                { original: "세무 신고 전 필요한 자료를", revised: "세무 신고 자료" },
                { original: "누락 리스크 관리", revised: "누락 가능성 완화" },
              ],
            },
            {
              label: "C",
              hint: "성과 중심으로 압축",
              text: "세무 신고 자료 분류 체계 운영을 통한 신고 누락 리스크 완화",
              tags: ["성과 압축", "신뢰도"],
              keywords: [
                { original: "세무 신고 전 필요한 자료", revised: "세무 신고 자료 분류 체계" },
                { original: "누락 리스크 관리", revised: "신고 누락 리스크 완화" },
              ],
            },
          ],
        },
      },
    },
    // 추가 제안 — 역할 범위 명확화
    {
      title: "역할 범위 명확화",
      originalSentence: "결산, 세무, 감사, 보고까지 이어지는 회계 운영 전 과정 담당",
      revisedSentence:
        "결산, 세무, 감사, 보고 업무를 연결해 회계 운영 프로세스 관리",
      changeReason:
        "\"전 과정 담당\"은 역할 범위가 과하게 넓어 보일 수 있습니다. 회계 직무의 연결성과 운영 역량은 유지하되, 실제 수행 범위가 자연스럽게 보이도록 조정했습니다.",
      originalTags: ["역할 과장"],
      revisedTags: ["명확성", "직무 적합성"],
      reasonTags: ["역할 범위 조정", "자연스러운 표현"],
      keywords: [
        { original: "회계 운영 전 과정 담당", revised: "회계 운영 프로세스 관리" },
      ],
      byDraft: {
        achievement: {
          originalSentence:
            "월·연 결산 마감 일정을 관리해 평균 5영업일 이내 마감 체계 유지",
          revisedSentence:
            "월·연 결산 마감 일정 관리 및 평균 5영업일 이내 운영 체계 유지",
          keywords: [
            { original: "일정을 관리해", revised: "일정 관리 및" },
            { original: "마감 체계 유지", revised: "운영 체계 유지" },
          ],
        },
        fit: {
          originalSentence:
            "결산, 세무, 감사, 보고까지 이어지는 회계 운영 전 과정 담당",
          revisedSentence:
            "결산, 세무, 감사, 보고 업무를 연결한 회계 운영 프로세스 관리",
          keywords: [
            { original: "보고까지 이어지는", revised: "보고 업무를 연결한" },
            { original: "회계 운영 전 과정 담당", revised: "회계 운영 프로세스 관리" },
          ],
        },
        narrative: {
          originalSentence:
            "12년간 결산·세무·감사 업무를 지속적으로 수행하며 회계 운영 신뢰도 확보",
          revisedSentence:
            "결산·세무·감사 업무 수행 경험을 바탕으로 회계 운영 신뢰도 강화",
          keywords: [
            { original: "지속적으로 수행하며", revised: "수행 경험을 바탕으로" },
            { original: "회계 운영 신뢰도 확보", revised: "회계 운영 신뢰도 강화" },
          ],
        },
      },
    },
  ],
};
