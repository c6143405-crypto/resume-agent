// app/scenarios/planning-strategy.ts
// 기획/전략 직무 시나리오.

import type { Scenario } from "./types";

export const PLANNING_STRATEGY: Scenario = {
  scenarioId: "planning-strategy",
  jobTitle: "전략기획팀 과장",
  jobCategory: "기획 / 전략",
  persona: {
    company: "(주) E 글로벌 비즈니스 전략 그룹 / 모빌리티 테크",
    period: "2012.03 ~ 현재 (12년 2개월)",
    role: "전략기획팀 과장",
  },
  drafts: [
    // ─────────────────────────────────────────────
    // 1) 성과 중심 초안
    // ─────────────────────────────────────────────
    {
      draftId: "planning-strategy:draft-01",
      draftTitle: "성과 중심 초안",
      direction: "achievement",
      hashtags: ["조달분쟁 0건", "예산 낭비 차단", "의사결정 병목 완화"],
      project: {
        number: 1,
        title: "신사업 파이프라인 및 IR·전사 성과 관리 체계 정비",
        description:
          "연매출 120억 원 규모의 모빌리티 테크 기업에서 신사업 파이프라인 구축, IR 자료 기획, 사업성 검토, 전사 성과 관리 체계 정비를 담당했습니다. 투자사 및 이해관계자 대상 조달 분쟁 0건을 유지하고, 시장·타깃 데이터 검토 체계를 정비했으며, 사업 기획 및 예산 심사 프로세스를 표준화해 경영 의사결정 병목을 줄였습니다.",
      },
      tasks: [
        { text: "신규 비즈니스 모델 후보군을 발굴하고 PEST, 5-Force 기반 시장·산업 분석 수행", emoji: "🔬" },
        { text: "연평균 1,500여 건의 시장 트렌드 및 타깃 데이터를 검토해 신사업 후보군 정리", emoji: "📊" },
        { text: "신규 프로젝트별 손익 추정, 예산 시나리오, 투자 리스크 검토 자료 작성", emoji: "💰" },
        { text: "투자사 및 VC 대상 IR 피치덱, 실사 대응 자료, 투자 조건 검토 자료 기획", emoji: "🤝" },
        { text: "자금, 손익, KPI 지표를 통합한 경영진 의사결정용 대시보드 기획", emoji: "📈" },
      ],
      achievements: [
        { text: "투자사 및 금융 이해관계자와의 조달 관련 분쟁 0건 유지", emoji: "✅" },
        { text: "연평균 1,500여 건의 시장·타깃 데이터 검토 체계 운영", emoji: "📊" },
        { text: "사업성 검토 과정에서 예산 낭비 가능성이 높은 프로젝트를 사전 선별", emoji: "🔍" },
        { text: "사업 기획 및 예산 심사 프로세스 표준화로 의사결정 병목 구간 완화", emoji: "⚡" },
        { text: "신사업 검토 자료와 경영 지표 대시보드 체계화로 보고 효율 개선", emoji: "📋" },
      ],
      whyRecommended:
        "신사업·IR·성과 관리 체계의 정량 성과를 중심으로 정리했어요. 분쟁 0건, 데이터 검토 1,500건, 프로세스 표준화를 핵심 성과로 강조했어요.",
      caution: "정성적 개선 사례가 있으면 더 풍성해질 수 있어요.",
      refinementTarget: {
        originalSentence: "투자사 및 금융 이해관계자와의 조달 관련 분쟁 0건 유지",
        revisedSentence:
          "최근 10년간 투자 조달 과정에서 주요 분쟁이 발생하지 않도록 IR 자료와 계약 조건을 관리",
        changeReason:
          "\"분쟁 0건\"은 검증 가능한 범위(최근 10년)와 관리 행동으로 표현해 신뢰성을 높였습니다.",
      },
    },

    // ─────────────────────────────────────────────
    // 2) 직무 적합 중심 초안
    // ─────────────────────────────────────────────
    {
      draftId: "planning-strategy:draft-02",
      draftTitle: "직무 적합 중심 초안",
      direction: "fit",
      hashtags: ["신사업 발굴", "사업성 분석", "OKR 운영"],
      project: {
        number: 1,
        title: "신사업·사업성·IR·OKR을 아우르는 전략기획 직무 운영",
        description:
          "모빌리티 테크 기업의 전략기획 담당자로서 신규 비즈니스 모델 발굴, 시장·산업 분석, 사업 타당성 검토, IR 피치덱 기획, OKR 운영 체계 설계를 수행했습니다. 시장 진입 전략, 투자 검토, 예산 시나리오, 전사 목표 관리까지 전략기획 직무의 핵심 영역을 연결해 경영진 의사결정을 지원했습니다.",
      },
      tasks: [
        { text: "중장기 사업 포트폴리오와 신규 비즈니스 모델 발굴 전략 수립", emoji: "🚀" },
        { text: "시장 규모, 경쟁 환경, 고객 세그먼트, 진입 장벽 분석을 통한 사업 기회 검토", emoji: "🔍" },
        { text: "NPV, Payback Period, 손익 시나리오 기반 사업 타당성 분석 자료 작성", emoji: "💰" },
        { text: "투자 계약 조건 변경에 따른 재무·경영권 리스크 검토 및 소명 자료 준비", emoji: "📄" },
        { text: "전사 목표와 부서별 실행 과제를 연결하는 OKR 운영 양식 및 보고 체계 기획", emoji: "🎯" },
      ],
      achievements: [
        { text: "신규 사업 발굴부터 사업성 검토, IR, OKR 운영까지 전략기획 전 과정 수행", emoji: "💼" },
        { text: "시장·산업 분석을 기반으로 사업 기회와 진입 리스크를 구조화", emoji: "📐" },
        { text: "투자 검토 자료와 재무 시나리오를 작성해 자금 조달 및 투자 의사결정 지원", emoji: "💰" },
        { text: "전사 OKR 거버넌스를 설계해 목표와 실행 과제 간 정합성 강화", emoji: "🎯" },
        { text: "경영진 보고 자료 작성으로 중장기 전략 및 자원 배분 의사결정 지원", emoji: "📈" },
      ],
      whyRecommended:
        "신사업 발굴부터 IR, OKR 운영까지 전략기획 직무 전 영역을 풀어냈어요. 분석·구조화·의사결정 지원 역량을 강조했어요.",
      caution: "정량 수치가 직무 서술 안에 묻혀 보일 수 있어요.",
      refinementTarget: {
        originalSentence: "전사 OKR 거버넌스를 설계해 목표와 실행 과제 간 정합성 강화",
        revisedSentence:
          "전사 목표와 부서별 OKR을 분기 단위로 점검하며 목표·실행 과제의 정합성을 단계적으로 강화",
        changeReason:
          "\"거버넌스 설계\"가 추상적으로 들릴 수 있어 실제 행동인 \"분기 단위 점검\"으로 구체화했습니다.",
      },
    },

    // ─────────────────────────────────────────────
    // 3) 경험 서사 중심 초안
    // ─────────────────────────────────────────────
    {
      draftId: "planning-strategy:draft-03",
      draftTitle: "경험 서사 중심 초안",
      direction: "narrative",
      hashtags: ["시장 변화 대응", "전략 구체화", "실행 연결"],
      project: {
        number: 1,
        title: "모빌리티 시장 변화 속 신사업·전략 흐름 정립",
        description:
          "모빌리티 시장의 변화가 빨라지면서 기존 사업만으로는 성장 한계와 투자 리스크를 동시에 관리해야 하는 상황이었습니다. 전략기획 담당자로서 시장 분석, 신사업 후보 검토, IR 자료 준비, 사업성 모델링, OKR 체계 정비를 하나의 흐름으로 연결하며 회사의 성장 방향을 구체화했습니다.",
      },
      tasks: [
        { text: "시장 변화와 경쟁 구도를 분석해 신규 사업 후보군을 발굴", emoji: "🔍" },
        { text: "사업 아이디어를 수익성, 실행 가능성, 투자 리스크 기준으로 선별", emoji: "🎯" },
        { text: "투자자 관점에서 필요한 사업 논리와 재무 가정을 IR 자료로 구조화", emoji: "📑" },
        { text: "현업 부서의 실행 과제를 전사 목표와 연결해 OKR 관리 체계로 정리", emoji: "🔗" },
        { text: "경영진이 빠르게 판단할 수 있도록 핵심 지표 중심의 보고 자료 작성", emoji: "📊" },
      ],
      achievements: [
        { text: "시장 변화 속에서 신사업 후보를 검토하며 성장 가능성과 리스크를 함께 판단한 경험 축적", emoji: "🌱" },
        { text: "투자자, 경영진, 현업 부서의 관점 차이를 조율하며 실행 가능한 전략으로 구체화", emoji: "🤝" },
        { text: "사업성 분석과 재무 가정을 반복 검토해 의사결정의 불확실성 완화", emoji: "🔍" },
        { text: "OKR 체계를 통해 전사 전략이 부서별 실행 과제로 이어지도록 운영 기준 정립", emoji: "🔗" },
        { text: "전략 기획, IR, 사업 검토, 성과 관리가 연결되는 경영기획 실무 경험 확보", emoji: "💼" },
      ],
      whyRecommended:
        "빠르게 변하는 모빌리티 시장에서 성장 방향을 구체화한 12년의 흐름을 자연스럽게 풀어냈어요. 다양한 이해관계자 조율과 전략-실행 연결 경험을 강조했어요.",
      caution: "구체적 수치 성과가 서술 안에 묻혀 보일 수 있어요.",
      refinementTarget: {
        originalSentence: "투자자, 경영진, 현업 부서의 관점 차이를 조율하며 실행 가능한 전략으로 구체화",
        revisedSentence:
          "투자자·경영진·현업 부서의 의견을 회의·자료 검토 단계에서 조율하며 실행 가능한 전략으로 정리",
        changeReason:
          "\"관점 차이 조율\"이 추상적으로 들릴 수 있어 \"회의·자료 검토 단계에서 조율\"로 구체화했습니다.",
      },
    },
  ],
  refinementTargets: [
    {
      title: "조달 성과 표현 완화",
      originalSentence: "투자사 및 금융 이해관계자와의 조달 관련 분쟁 0건 유지",
      revisedSentence:
        "투자사 및 금융 이해관계자 대응 과정에서 조달 관련 리스크 관리",
      changeReason:
        "\"분쟁 0건\"은 강한 성과 표현이라 증빙이 부족하면 단정적으로 보일 수 있습니다. 조달 대응 경험은 유지하되, 명사형 구조에 맞춰 더 신뢰감 있는 표현으로 조정했습니다.",
      originalTags: ["단정 표현"],
      revisedTags: ["신뢰성", "안전/신뢰성"],
      reasonTags: ["과장 완화", "신뢰도 개선"],
      keywords: [
        { original: "조달 관련 분쟁 0건 유지", revised: "조달 관련 리스크 관리" },
        { original: "투자사 및 금융 이해관계자와의", revised: "투자사 및 금융 이해관계자 대응 과정에서" },
      ],
      byDraft: {
        achievement: {
          originalSentence: "투자사 및 금융 이해관계자와의 조달 관련 분쟁 0건 유지",
          revisedSentence: "투자사 및 금융 이해관계자 대응 과정에서 조달 관련 리스크 관리",
          keywords: [
            { original: "금융 이해관계자와의", revised: "금융 이해관계자 대응 과정에서" },
            { original: "분쟁 0건 유지", revised: "리스크 관리" },
          ],
        },
        fit: {
          originalSentence:
            "투자 검토 자료와 재무 시나리오를 작성해 자금 조달 및 투자 의사결정 지원",
          revisedSentence:
            "투자 검토 자료와 재무 시나리오 작성을 통한 자금 조달 및 투자 의사결정 지원",
          keywords: [
            { original: "시나리오를 작성해", revised: "시나리오 작성을 통한" },
            { original: "자금 조달 및", revised: "자금 조달 및 투자" },
          ],
        },
        narrative: {
          originalSentence:
            "투자자, 경영진, 현업 부서의 관점 차이를 조율하며 실행 가능한 전략으로 구체화",
          revisedSentence:
            "투자자, 경영진, 현업 부서의 요구를 조율해 실행 가능한 전략 방향으로 구체화",
          keywords: [
            { original: "관점 차이를", revised: "요구를" },
            { original: "전략으로 구체화", revised: "전략 방향으로 구체화" },
          ],
        },
      },
    },
    // 2/2 — 다지선다: 전략기획 역할 표현 수위 조정
    {
      title: "전략기획 역할 표현 수위 조정",
      originalSentence: "신규 사업 발굴부터 사업성 검토, IR, OKR 운영까지 전략기획 전 과정 수행",
      options: [
        {
          label: "A",
          hint: "성과를 명확히 유지",
          text: "신규 사업 발굴, 사업성 검토, IR 자료 작성, OKR 운영을 포함한 전략기획 업무 수행",
          tags: ["성과 유지", "직무 전문성"],
          keywords: [
            { original: "IR", revised: "IR 자료 작성" },
            { original: "전 과정 수행", revised: "업무 수행" },
          ],
        },
        {
          label: "B",
          hint: "더 신중하고 안전하게 표현",
          text: "신규 사업 검토, IR 자료 준비, OKR 운영 지원을 통한 전략기획 업무 수행",
          tags: ["안전한 표현", "역할 조정"],
          keywords: [
            { original: "신규 사업 발굴부터 사업성 검토", revised: "신규 사업 검토" },
            { original: "전 과정 수행", revised: "업무 수행" },
          ],
        },
        {
          label: "C",
          hint: "성과 중심으로 압축",
          text: "신사업·IR·OKR 운영 경험을 바탕으로 전략기획 실행력 강화",
          tags: ["성과 압축", "전략기획"],
          keywords: [
            { original: "신규 사업 발굴부터 사업성 검토, IR, OKR 운영까지", revised: "신사업·IR·OKR 운영 경험" },
            { original: "전략기획 전 과정 수행", revised: "전략기획 실행력 강화" },
          ],
        },
      ],
      changeReason:
        "\"전 과정 수행\"은 역할 범위가 과하게 넓어 보일 수 있습니다. 전략기획 경험은 유지하되, 직접 수행 범위를 얼마나 강하게 표현할지 선택할 수 있도록 나눴습니다.",
      originalTags: ["역할 과장"],
      revisedTags: ["명확성", "직무 적합성"],
      reasonTags: ["역할 범위 조정", "전략 역량 강조"],
      byDraft: {
        achievement: {
          originalSentence: "연평균 1,500여 건의 시장·타깃 데이터 검토 체계 운영",
          options: [
            {
              label: "A",
              hint: "성과를 명확히 유지",
              text: "연평균 1,500여 건의 시장·타깃 데이터 점검 체계 운영을 통한 신사업 후보군 정리",
              tags: ["성과 유지", "정확성"],
              keywords: [
                { original: "검토", revised: "점검" },
                { original: "체계 운영", revised: "체계 운영을 통한 신사업 후보군 정리" },
              ],
            },
            {
              label: "B",
              hint: "더 신중하고 안전하게 표현",
              text: "시장·타깃 데이터 정기 검토를 통한 신사업 후보군 선별 기준 정비",
              tags: ["안전한 표현", "리스크 완화"],
              keywords: [
                { original: "연평균 1,500여 건의", revised: "정기" },
                { original: "검토 체계 운영", revised: "선별 기준 정비" },
              ],
            },
            {
              label: "C",
              hint: "성과 중심으로 압축",
              text: "시장·타깃 데이터 검토 기반의 신사업 기회 발굴 역량 강화",
              tags: ["성과 압축", "신뢰도"],
              keywords: [
                { original: "검토 체계 운영", revised: "검토 기반의" },
                { original: "시장·타깃 데이터", revised: "신사업 기회" },
              ],
            },
          ],
        },
        fit: {
          originalSentence:
            "신규 사업 발굴부터 사업성 검토, IR, OKR 운영까지 전략기획 전 과정 수행",
          options: [
            {
              label: "A",
              hint: "성과를 명확히 유지",
              text: "신규 사업 발굴, 사업성 검토, IR 자료 작성, OKR 운영을 포함한 전략기획 업무 수행",
              tags: ["성과 유지", "직무 전문성"],
              keywords: [
                { original: "IR", revised: "IR 자료 작성" },
                { original: "전 과정 수행", revised: "업무 수행" },
              ],
            },
            {
              label: "B",
              hint: "더 신중하고 안전하게 표현",
              text: "신규 사업 검토, IR 자료 준비, OKR 운영 지원을 통한 전략기획 업무 수행",
              tags: ["안전한 표현", "역할 조정"],
              keywords: [
                { original: "신규 사업 발굴부터 사업성 검토", revised: "신규 사업 검토" },
                { original: "OKR 운영까지", revised: "OKR 운영 지원을 통한" },
              ],
            },
            {
              label: "C",
              hint: "성과 중심으로 압축",
              text: "신사업·IR·OKR 운영 경험을 바탕으로 전략기획 실행력 강화",
              tags: ["성과 압축", "전략기획"],
              keywords: [
                {
                  original: "신규 사업 발굴부터 사업성 검토, IR, OKR 운영까지",
                  revised: "신사업·IR·OKR 운영 경험",
                },
                { original: "전략기획 전 과정 수행", revised: "전략기획 실행력 강화" },
              ],
            },
          ],
        },
        narrative: {
          originalSentence:
            "사업성 분석과 재무 가정을 반복 검토해 의사결정의 불확실성 완화",
          options: [
            {
              label: "A",
              hint: "성과를 명확히 유지",
              text: "사업성 분석과 재무 가정 반복 검토를 통한 의사결정 불확실성 완화",
              tags: ["성과 유지", "정확성"],
              keywords: [
                { original: "재무 가정을 반복 검토해", revised: "재무 가정 반복 검토를 통한" },
                { original: "의사결정의", revised: "의사결정" },
              ],
            },
            {
              label: "B",
              hint: "더 신중하고 안전하게 표현",
              text: "사업성 분석과 재무 가정 검토를 통한 의사결정 리스크 완화",
              tags: ["안전한 표현", "리스크 완화"],
              keywords: [
                { original: "반복 검토해", revised: "검토를 통한" },
                { original: "불확실성 완화", revised: "리스크 완화" },
              ],
            },
            {
              label: "C",
              hint: "성과 중심으로 압축",
              text: "사업성·재무 가정 검토 기반의 전략 의사결정 신뢰도 강화",
              tags: ["성과 압축", "신뢰도"],
              keywords: [
                { original: "사업성 분석과 재무 가정", revised: "사업성·재무 가정" },
                {
                  original: "의사결정의 불확실성 완화",
                  revised: "전략 의사결정 신뢰도 강화",
                },
              ],
            },
          ],
        },
      },
    },
    // 추가 제안 — 전문 용어 완화
    {
      title: "전문 용어 완화",
      originalSentence:
        "신규 비즈니스 모델 후보군을 발굴하고 PEST, 5-Force 기반 시장·산업 분석 수행",
      revisedSentence:
        "신규 비즈니스 모델 후보군 발굴 및 시장 환경·경쟁 구조 기반의 산업 분석 수행",
      changeReason:
        "\"PEST\", \"5-Force\"는 전략기획 전문성이 보이지만 일부 사용자에게는 어렵게 느껴질 수 있습니다. 분석 역량은 유지하되, 더 쉽게 이해되는 표현으로 조정했습니다.",
      originalTags: ["어려운 표현"],
      revisedTags: ["명확성", "자연스러움"],
      reasonTags: ["전문 용어 완화", "이해도 개선"],
      keywords: [
        { original: "후보군을 발굴하고", revised: "후보군 발굴 및" },
        { original: "PEST, 5-Force 기반", revised: "시장 환경·경쟁 구조 기반의" },
      ],
      byDraft: {
        achievement: {
          originalSentence:
            "신규 비즈니스 모델 후보군을 발굴하고 PEST, 5-Force 기반 시장·산업 분석 수행",
          revisedSentence:
            "신규 비즈니스 모델 후보군 발굴 및 시장 환경·경쟁 구조 기반의 산업 분석 수행",
          keywords: [
            { original: "후보군을 발굴하고", revised: "후보군 발굴 및" },
            { original: "PEST, 5-Force 기반", revised: "시장 환경·경쟁 구조 기반의" },
          ],
        },
        fit: {
          originalSentence:
            "NPV, Payback Period, 손익 시나리오 기반 사업 타당성 분석 자료 작성",
          revisedSentence:
            "투자 회수 기간과 손익 시나리오 기반의 사업 타당성 분석 자료 작성",
          keywords: [
            { original: "NPV, Payback Period", revised: "투자 회수 기간" },
            { original: "시나리오 기반", revised: "시나리오 기반의" },
          ],
        },
        narrative: {
          originalSentence: "투자자 관점에서 필요한 사업 논리와 재무 가정을 IR 자료로 구조화",
          revisedSentence: "투자자 관점의 사업 논리와 재무 가정을 투자 검토 자료로 구조화",
          keywords: [
            { original: "필요한 사업 논리", revised: "사업 논리" },
            { original: "IR 자료", revised: "투자 검토 자료" },
          ],
        },
      },
    },
  ],
};
