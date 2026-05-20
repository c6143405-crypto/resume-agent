// IT/전산 운영 직무 시나리오
// 사내 ERP·그룹웨어·보안 시스템을 12년간 운영해온 전산관리팀 과장.
// 3개 초안(성과/직무/경험)으로 동일 경력을 다른 방향으로 표현한다.

import type { Scenario } from "./types";

export const IT_OPERATIONS: Scenario = {
  scenarioId: "it-operations",
  jobTitle: "IT / 전산 운영",
  jobCategory: "IT/전산",
  persona: {
    company: "(주) H 테크놀로지 / 중견 제조·유통 기업",
    period: "2012.03 ~ 현재 (12년 2개월)",
    role: "전산관리팀 과장",
  },
  drafts: [
    // ─────────────────────────────────────────────
    // 1) 성과 중심 초안
    // ─────────────────────────────────────────────
    {
      draftId: "it-operations:draft-01",
      draftTitle: "성과 중심 초안",
      direction: "achievement",
      hashtags: ["시스템 안정성", "장애 대응 체계", "데이터 보안 관리"],
      project: {
        number: 1,
        title: "사내 ERP·그룹웨어·보안 시스템 운영",
        description:
          "사내 ERP, 그룹웨어, 홈페이지, 보안 시스템 운영을 담당하며 전산 장애와 업무 중단 리스크를 관리했습니다. 정기 점검과 장애 대응 프로세스를 정비해 주요 시스템 장애 발생을 최소화하고, 사용자 계정·권한 관리 및 데이터 백업 체계를 안정적으로 운영했습니다.",
      },
      tasks: [
        { text: "ERP, 그룹웨어, 홈페이지 등 주요 사내 시스템 운영 및 정기 점검", emoji: "🖥️" },
        { text: "임직원 계정 생성, 권한 변경, 퇴사자 계정 회수 프로세스 관리", emoji: "🔑" },
        { text: "PC, 프린터, 네트워크, 보안 솔루션 장애 접수 및 1차 대응", emoji: "🛠️" },
        { text: "중요 업무 데이터 백업 일정 관리 및 복구 테스트 지원", emoji: "💾" },
        { text: "외부 유지보수 업체와 장애 처리 일정 및 개선 요청 사항 조율", emoji: "🤝" },
      ],
      achievements: [
        { text: "주요 사내 시스템의 정기 점검 체계를 운영해 업무 중단 리스크 감소", emoji: "📉" },
        { text: "계정·권한 관리 기준을 정비해 보안 사고 가능성 완화", emoji: "🛡️" },
        { text: "반복 장애 유형을 정리해 사용자 문의 대응 시간 단축", emoji: "⚡" },
        { text: "데이터 백업 및 복구 점검 체계 운영으로 자료 유실 리스크 감소", emoji: "💾" },
        { text: "유지보수 업체와의 대응 프로세스 정리로 장애 처리 속도 개선", emoji: "🚀" },
      ],
      whyRecommended:
        "12년간의 전산 운영 경험을 안정성·보안·대응 속도라는 성과 축으로 정리했어요. 점검 체계, 권한 관리, 백업 운영을 핵심 성과로 강조했어요.",
      caution: "정량 수치(장애 건수, 대응 시간 단축률 등)가 있으면 더 설득력이 강해질 수 있어요.",
      refinementTarget: {
        originalSentence: "주요 사내 시스템의 정기 점검 체계를 운영해 업무 중단 리스크 감소",
        revisedSentence:
          "월 1회 정기 점검 체계를 운영해 주요 시스템의 계획 외 중단을 최소 수준으로 관리",
        changeReason:
          "\"리스크 감소\"가 추상적으로 들릴 수 있어 점검 주기와 결과를 함께 보여주는 표현으로 다듬었습니다.",
      },
    },

    // ─────────────────────────────────────────────
    // 2) 직무 적합 중심 초안
    // ─────────────────────────────────────────────
    {
      draftId: "it-operations:draft-02",
      draftTitle: "직무 적합 중심 초안",
      direction: "fit",
      hashtags: ["IT 운영 총괄", "사용자 지원", "협력업체 관리"],
      project: {
        number: 1,
        title: "사내 IT 운영 및 사용자 지원 업무 총괄",
        description:
          "전산관리 담당자로서 사내 ERP, 그룹웨어, PC·네트워크, 보안 솔루션, 데이터 백업, 사용자 지원 업무를 수행했습니다. 현업 부서가 안정적으로 업무를 처리할 수 있도록 시스템 운영, 장애 대응, 권한 관리, 협력업체 커뮤니케이션까지 IT 운영 전반을 관리했습니다.",
      },
      tasks: [
        { text: "ERP 및 그룹웨어 사용자 관리와 부서별 권한 설정", emoji: "👥" },
        { text: "사내 PC, 네트워크, 프린터, 공용 장비 운영 지원", emoji: "🖨️" },
        { text: "백신, 방화벽, 보안 업데이트 등 기본 보안 점검 수행", emoji: "🛡️" },
        { text: "시스템 장애 발생 시 원인 파악, 사용자 안내, 협력업체 이슈 전달", emoji: "🚨" },
        { text: "전산 자산 현황, 라이선스, 유지보수 계약 관리", emoji: "📋" },
      ],
      achievements: [
        { text: "사내 IT 인프라 운영과 사용자 지원 업무 전반 수행", emoji: "💼" },
        { text: "ERP, 그룹웨어, 네트워크, 보안 솔루션 운영 경험 확보", emoji: "🛠️" },
        { text: "권한 관리와 계정 회수 절차를 통해 기본 보안 관리 역량 강화", emoji: "🔐" },
        { text: "현업 부서와 외부 업체 사이에서 장애 대응 커뮤니케이션 수행", emoji: "🤝" },
        { text: "전산 자산과 유지보수 계약 관리를 통해 IT 운영 비용과 리스크 관리", emoji: "📊" },
      ],
      whyRecommended:
        "ERP·그룹웨어·네트워크·보안을 아우르는 사내 IT 운영 직무 전반 역량을 풀어냈어요. 시스템 운영뿐 아니라 사용자 지원과 협력업체 커뮤니케이션까지 강조했어요.",
      caution: "구체적인 성과 수치가 직무 서술 안에 묻혀 보일 수 있어요.",
      refinementTarget: {
        originalSentence: "권한 관리와 계정 회수 절차를 통해 기본 보안 관리 역량 강화",
        revisedSentence:
          "입사·퇴사·이동 시 권한 변경 절차를 표준화해 계정 관리 누락을 사전에 차단",
        changeReason:
          "\"역량 강화\"는 모호하게 들릴 수 있어 실제 수행한 행동(절차 표준화)으로 구체화했습니다.",
      },
    },

    // ─────────────────────────────────────────────
    // 3) 경험 서사 중심 초안
    // ─────────────────────────────────────────────
    {
      draftId: "it-operations:draft-03",
      draftTitle: "경험 서사 중심 초안",
      direction: "narrative",
      hashtags: ["업무 연속성 지원", "장애 흐름 정비", "12년 IT 운영"],
      project: {
        number: 1,
        title: "전산 운영 흐름 정비를 통한 업무 연속성 관리",
        description:
          "회사 업무가 전산 시스템에 점점 더 의존하면서 ERP, 그룹웨어, 네트워크 장애가 곧 업무 지연으로 이어지는 상황이 많아졌습니다. 전산관리 담당자로서 장애 접수, 원인 확인, 협력업체 조율, 사용자 안내, 재발 방지까지 운영 흐름을 정리하며 현업 부서의 업무 연속성을 지원했습니다.",
      },
      tasks: [
        { text: "현업 부서의 전산 문의와 장애 요청을 접수하고 우선순위 정리", emoji: "📥" },
        { text: "반복적으로 발생하는 오류 유형을 정리해 사용자 안내 자료 작성", emoji: "📝" },
        { text: "ERP와 그룹웨어 권한을 부서 업무 기준에 맞춰 조정", emoji: "🔑" },
        { text: "외부 업체와 장애 원인 및 조치 일정을 조율해 업무 지연 최소화", emoji: "📞" },
        { text: "백업, 보안 점검, 장비 관리 루틴을 정리해 전산 운영 안정성 확보", emoji: "🔁" },
      ],
      achievements: [
        { text: "전산 장애가 현업 업무에 미치는 영향을 이해하고 신속히 대응한 경험 축적", emoji: "⚡" },
        { text: "사용자 눈높이에 맞춘 안내와 반복 오류 정리로 내부 지원 품질 개선", emoji: "📘" },
        { text: "시스템 권한, 백업, 보안 점검을 루틴화해 안정적인 운영 체계 구축", emoji: "🛡️" },
        { text: "협력업체와 현업 부서 사이에서 문제 해결을 조율한 경험 확보", emoji: "🤝" },
        { text: "장기간 사내 전산 운영을 맡으며 업무 연속성과 조직 신뢰도를 높이는 IT 운영 역량 확보", emoji: "🏛️" },
      ],
      whyRecommended:
        "장애 접수 → 원인 확인 → 협력업체 조율 → 사용자 안내 → 재발 방지로 이어지는 운영 흐름을 시간 순으로 풀어냈어요. 업무 연속성을 지킨 12년 서사를 자연스럽게 보여줘요.",
      caution: "구체적 시스템 이름이 흐름에 묻혀서 직무 키워드가 약해 보일 수 있어요.",
      refinementTarget: {
        originalSentence: "반복적으로 발생하는 오류 유형을 정리해 사용자 안내 자료 작성",
        revisedSentence:
          "자주 발생하는 오류 유형을 카테고리별로 정리해 사내 안내 자료로 배포",
        changeReason:
          "\"정리해 작성\"이라는 행동에 \"카테고리·배포\"라는 구체 행위를 추가해 운영 흔적이 보이도록 다듬었습니다.",
      },
    },
  ],
  refinementTargets: [
    {
      title: "역할 범위 명확화",
      originalSentence: "사내 IT 인프라 운영과 사용자 지원 업무 전반 수행",
      revisedSentence:
        "사내 IT 인프라 운영과 사용자 지원 업무를 연결한 전산 운영 관리",
      changeReason:
        "\"전반 수행\"은 역할 범위가 과하게 넓어 보일 수 있습니다. IT 인프라 운영과 사용자 지원 경험은 유지하되, 실제 수행 범위가 자연스럽게 보이도록 조정했습니다.",
      originalTags: ["역할 과장"],
      revisedTags: ["명확성", "직무 적합성"],
      reasonTags: ["역할 범위 조정", "운영 역량 강화"],
      keywords: [
        { original: "사용자 지원 업무 전반 수행", revised: "사용자 지원 업무를 연결한 전산 운영 관리" },
      ],
      byDraft: {
        achievement: {
          originalSentence: "주요 사내 시스템의 정기 점검 체계를 운영해 업무 중단 리스크 감소",
          revisedSentence: "주요 사내 시스템 정기 점검 체계 운영을 통한 업무 중단 가능성 완화",
          keywords: [
            { original: "정기 점검 체계를 운영해", revised: "정기 점검 체계 운영을 통한" },
            { original: "리스크 감소", revised: "가능성 완화" },
          ],
        },
        fit: {
          originalSentence: "사내 IT 인프라 운영과 사용자 지원 업무 전반 수행",
          revisedSentence: "사내 IT 인프라 운영과 사용자 지원 업무를 연결한 전산 운영 관리",
          keywords: [
            { original: "사용자 지원 업무 전반", revised: "사용자 지원 업무를 연결한" },
            { original: "수행", revised: "전산 운영 관리" },
          ],
        },
        narrative: {
          originalSentence:
            "장기간 사내 전산 운영을 맡으며 업무 연속성과 조직 신뢰도를 높이는 IT 운영 역량 확보",
          revisedSentence:
            "사내 전산 운영 경험을 바탕으로 업무 연속성과 조직 신뢰도 유지에 기여",
          keywords: [
            {
              original: "장기간 사내 전산 운영을 맡으며",
              revised: "사내 전산 운영 경험을 바탕으로",
            },
            { original: "IT 운영 역량 확보", revised: "유지에 기여" },
          ],
        },
      },
    },
    // 2/2 — 다지선다: 사용자 지원 업무 구체화
    {
      title: "사용자 지원 업무 구체화",
      originalSentence: "현업 부서의 전산 문의와 장애 요청을 접수하고 우선순위 정리",
      options: [
        {
          label: "A",
          hint: "성과를 명확히 유지",
          text: "현업 부서의 전산 문의와 장애 요청 접수 및 처리 우선순위 관리",
          tags: ["성과 유지", "명확성"],
          keywords: [
            { original: "장애 요청을 접수하고", revised: "장애 요청 접수 및" },
            { original: "우선순위 정리", revised: "처리 우선순위 관리" },
          ],
        },
        {
          label: "B",
          hint: "더 신중하고 안전하게 표현",
          text: "현업 부서의 전산 문의와 장애 요청을 접수하고 처리 순서 조율",
          tags: ["안전한 표현", "자연스러움"],
          keywords: [
            { original: "우선순위 정리", revised: "처리 순서 조율" },
          ],
        },
        {
          label: "C",
          hint: "성과 중심으로 압축",
          text: "전산 문의 및 장애 요청 관리 체계 운영을 통한 내부 지원 효율 개선",
          tags: ["성과 압축", "지원 효율"],
          keywords: [
            { original: "현업 부서의 전산 문의와 장애 요청", revised: "전산 문의 및 장애 요청 관리 체계" },
            { original: "우선순위 정리", revised: "내부 지원 효율 개선" },
          ],
        },
      ],
      changeReason:
        "\"우선순위 정리\"는 실제 업무 내용이 다소 넓게 읽힐 수 있습니다. 접수, 조율, 관리 체계 중 어떤 방식으로 보여줄지 선택할 수 있도록 나눴습니다.",
      originalTags: ["모호한 표현"],
      revisedTags: ["구체화", "명확성"],
      reasonTags: ["업무 범위 구체화", "지원 역량 강조"],
      byDraft: {
        achievement: {
          originalSentence: "계정·권한 관리 기준을 정비해 보안 사고 가능성 완화",
          options: [
            {
              label: "A",
              hint: "성과를 명확히 유지",
              text: "계정·권한 관리 기준 정비를 통한 보안 사고 가능성 축소",
              tags: ["성과 유지", "정확성"],
              keywords: [
                { original: "기준을 정비해", revised: "기준 정비를 통한" },
                { original: "가능성 완화", revised: "가능성 축소" },
              ],
            },
            {
              label: "B",
              hint: "더 신중하고 안전하게 표현",
              text: "계정·권한 관리 기준 점검을 통한 보안 관리 리스크 완화",
              tags: ["안전한 표현", "리스크 완화"],
              keywords: [
                { original: "기준을 정비해", revised: "기준 점검을 통한" },
                { original: "보안 사고 가능성", revised: "보안 관리 리스크" },
              ],
            },
            {
              label: "C",
              hint: "성과 중심으로 압축",
              text: "계정·권한 관리 체계 운영을 통한 사내 보안 안정성 강화",
              tags: ["성과 압축", "신뢰도"],
              keywords: [
                { original: "관리 기준", revised: "관리 체계" },
                { original: "보안 사고 가능성 완화", revised: "사내 보안 안정성 강화" },
              ],
            },
          ],
        },
        fit: {
          originalSentence: "권한 관리와 계정 회수 절차를 통해 기본 보안 관리 역량 강화",
          options: [
            {
              label: "A",
              hint: "성과를 명확히 유지",
              text: "권한 관리와 계정 회수 절차 운영을 통한 기본 보안 관리 역량 강화",
              tags: ["성과 유지", "정확성"],
              keywords: [
                { original: "절차를 통해", revised: "절차 운영을 통한" },
                { original: "기본 보안 관리", revised: "기본 보안 관리 역량" },
              ],
            },
            {
              label: "B",
              hint: "더 신중하고 안전하게 표현",
              text: "권한 관리와 계정 회수 절차 점검을 통한 보안 관리 리스크 완화",
              tags: ["안전한 표현", "리스크 완화"],
              keywords: [
                { original: "절차를 통해", revised: "절차 점검을 통한" },
                { original: "역량 강화", revised: "리스크 완화" },
              ],
            },
            {
              label: "C",
              hint: "성과 중심으로 압축",
              text: "계정·권한 관리 체계 운영을 통한 사내 보안 안정성 강화",
              tags: ["성과 압축", "신뢰도"],
              keywords: [
                { original: "권한 관리와 계정 회수 절차", revised: "계정·권한 관리 체계" },
                { original: "기본 보안 관리 역량 강화", revised: "사내 보안 안정성 강화" },
              ],
            },
          ],
        },
        narrative: {
          originalSentence: "시스템 권한, 백업, 보안 점검을 루틴화해 안정적인 운영 체계 구축",
          options: [
            {
              label: "A",
              hint: "성과를 명확히 유지",
              text: "시스템 권한, 백업, 보안 점검 루틴화를 통한 안정적인 운영 기반 구축",
              tags: ["성과 유지", "정확성"],
              keywords: [
                { original: "점검을 루틴화해", revised: "점검 루틴화를 통한" },
                { original: "운영 체계", revised: "운영 기반" },
              ],
            },
            {
              label: "B",
              hint: "더 신중하고 안전하게 표현",
              text: "시스템 권한, 백업, 보안 점검 절차 정비를 통한 운영 리스크 완화",
              tags: ["안전한 표현", "리스크 완화"],
              keywords: [
                { original: "점검을 루틴화해", revised: "점검 절차 정비를 통한" },
                { original: "안정적인 운영 체계 구축", revised: "운영 리스크 완화" },
              ],
            },
            {
              label: "C",
              hint: "성과 중심으로 압축",
              text: "권한·백업·보안 점검 체계 운영을 통한 전산 운영 안정성 강화",
              tags: ["성과 압축", "신뢰도"],
              keywords: [
                {
                  original: "시스템 권한, 백업, 보안 점검",
                  revised: "권한·백업·보안 점검 체계",
                },
                { original: "안정적인 운영 체계 구축", revised: "전산 운영 안정성 강화" },
              ],
            },
          ],
        },
      },
    },
    // 추가 제안 — 리스크 표현 완화
    {
      title: "리스크 표현 완화",
      originalSentence: "데이터 백업 및 복구 점검 체계 운영으로 자료 유실 리스크 감소",
      revisedSentence:
        "데이터 백업 일정 관리 및 복구 점검을 통한 자료 유실 가능성 완화",
      changeReason:
        "\"리스크 감소\"는 결과가 강하게 단정되어 보일 수 있습니다. 실제 수행한 백업 일정 관리와 복구 점검 업무가 드러나도록 조정했습니다.",
      originalTags: ["강한 표현"],
      revisedTags: ["신뢰성", "안전/신뢰성"],
      reasonTags: ["과장 완화", "신뢰도 개선"],
      keywords: [
        { original: "복구 점검 체계 운영으로", revised: "복구 점검을 통한" },
        { original: "자료 유실 리스크 감소", revised: "자료 유실 가능성 완화" },
      ],
      byDraft: {
        achievement: {
          originalSentence: "데이터 백업 및 복구 점검 체계 운영으로 자료 유실 리스크 감소",
          revisedSentence:
            "데이터 백업 일정 관리 및 복구 점검을 통한 자료 유실 가능성 완화",
          keywords: [
            { original: "복구 점검 체계 운영으로", revised: "복구 점검을 통한" },
            { original: "자료 유실 리스크 감소", revised: "자료 유실 가능성 완화" },
          ],
        },
        fit: {
          originalSentence: "전산 자산과 유지보수 계약 관리를 통해 IT 운영 비용과 리스크 관리",
          revisedSentence:
            "전산 자산과 유지보수 계약 점검을 통한 IT 운영 비용 및 리스크 관리",
          keywords: [
            { original: "계약 관리를 통해", revised: "계약 점검을 통한" },
            { original: "비용과 리스크 관리", revised: "비용 및 리스크 관리" },
          ],
        },
        narrative: {
          originalSentence: "외부 업체와 장애 원인 및 조치 일정을 조율해 업무 지연 최소화",
          revisedSentence:
            "외부 업체와 장애 원인 및 조치 일정 조율을 통한 업무 지연 가능성 완화",
          keywords: [
            { original: "조치 일정을 조율해", revised: "조치 일정 조율을 통한" },
            { original: "업무 지연 최소화", revised: "업무 지연 가능성 완화" },
          ],
        },
      },
    },
  ],
};
