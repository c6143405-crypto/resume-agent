"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, X, ChevronDown, ChevronUp, Info, Send } from "lucide-react";
import type {
  CurrentStep,
  PrototypeType,
  UserIntent,
  DecisionStatus,
  SelectedDraft,
  Draft,
} from "../agent-state";
import { DEFAULT_AGENT_STATE } from "../agent-state";
import { classifyUserIntent } from "../classify-intent";
import { useScenario } from "../hooks/useScenario";
import type { Draft as ScenarioDraft, ScenarioPersona } from "../scenarios";
import { B_TYPE_PROMPT } from "./style-prompt";

// ─── 배경 그라데이션 원 (A 페이지와 동일) ──────────────────────────────
function BackgroundEllipses() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute rounded-full"
        style={{
          width: 340,
          height: 331,
          top: 219,
          left: -107,
          background: "#EEF7F3",
          filter: "blur(87px)",
          transform: "rotate(12.917deg)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 310,
          height: 294,
          top: 144,
          left: 115,
          background: "#DBE9FB",
          filter: "blur(87px)",
          transform: "rotate(12.917deg)",
        }}
      />
    </div>
  );
}

// ─── 시나리오 → 기존 Draft 어댑터 ──────────────────────────────
// scenarios/types.ts의 Draft (ScenarioDraft 별칭) 를
// agent-state.ts의 Draft 형식(B 페이지가 사용 중인 형식)으로 변환한다.
function toLegacyDraft(s: ScenarioDraft, persona: ScenarioPersona): Draft {
  return {
    draftId: s.draftId,
    draftTitle: s.draftTitle,
    draftDirection: s.draftTitle,
    draftContent: `${persona.company}에서 ${persona.period} (${persona.role}) 근무. ${s.project.description}`,
    whyRecommended: s.whyRecommended,
    caution: s.caution,
    body: {
      company: persona.company,
      period: `${persona.period} · ${persona.role}`,
      projectTitle: `프로젝트 ${s.project.number} · ${s.project.title}`,
      overview: s.project.description,
      goals: s.tasks.map((t) => ({ text: t.text, emoji: t.emoji })),
      roleAndResults: s.achievements.map((a) => ({ text: a.text, emoji: a.emoji })),
    },
    refinementTarget: s.refinementTarget,
  };
}
import { OrbCanvas } from "../components/OrbCanvas";
import { TypewriterText } from "../components/TypewriterText";
import { StartScreen } from "../components/StartScreen";
import { AiOrb } from "../components/AiOrb";
import { StatusBar } from "../components/StatusBar";
import { PageTitleBar } from "../components/PageTitleBar";
import { useSyncBodyBackground } from "../hooks/useSyncBodyBackground";

const USE_AI = process.env.NEXT_PUBLIC_USE_AI === "true";

const ROLE_OPTIONS = [
  {
    id: "accounting",
    match: "직무 매칭률 87%",
    title: "옵션 A. 회계담당자",
    tags: [
      "월말 마감 치는 일 → 결산 마감 프로세스 운영",
      "세무사 자료 두 번 확인 → 세무 협업 검증",
    ],
  },
  {
    id: "finance",
    match: "직무 매칭률 82%",
    title: "옵션 B. 재무관리자",
    tags: [
      "12년 동안 장부 매기는 일 → 재무 데이터 통합 관리",
      "거래처 결제·미수금 추적 → 자금 흐름 데이터 관리",
    ],
  },
];

type CardOption = {
  emoji: string;
  title: string;
  description: string;
};

type StageCard = {
  title: string;
  subtitle: string;
  options: CardOption[];
};

const STAGES: Record<string, { triggers: string[]; response: string; chips?: string[]; card?: StageCard }> = {
  stage1: {
    triggers: ["샘플 경력기술서 1을 고치고 싶어", "샘플 경력기술서 2를 고치고 싶어"],
    response: "좋아요. 선택한 샘플 경력기술서를 어떤 방식으로 다듬을지 골라주세요.",
    chips: ["AI가 추정한 표현 확인하기", "빠진 경험 보강하기", "문장 표현 다듬기"],
  },
  stage2a: {
    triggers: ["AI가 추정한 표현 확인하기", "👀 AI 추정 부분 다듬기"],
    response: "샘플 경력기술서에서 AI가 추정한 부분이 두 곳 있어요. 어느 부분부터 다듬을까요?",
    chips: ["✅ 정합성 100% 유지 (AI · 정확율 70%)", "❗ 12년 연속 0건 (AI · 정확율 50%)", "✅ 월 평균 1,500여 건 (AI · 정확율 80%)"],
  },
  stage2b: {
    triggers: ["빠진 경험 보강하기", "✏️ 빠진 경험 추가하기"],
    response: "어떤 경험을 추가하고 싶으세요? 직접 말씀해주시거나 아래에서 골라주세요.",
    chips: ["📊 프로젝트 성과 수치 추가", "🤝 협업 경험 추가", "🎓 교육/자격증 추가"],
  },
  stage2c: {
    triggers: ["문장 표현 다듬기", "💭 표현을 더 간결하게"],
    response: "어떤 부분을 간결하게 다듬을까요?",
    chips: ["✂️ 중복된 표현 줄이기", "📝 문장 길이 짧게", "🎯 핵심만 남기기"],
  },
  stage4: {
    triggers: [
      "❗ 12년 연속 0건 (AI · 정확율 50%)",
      "❗ 12년 연속 0건",
    ],
    response: '먼저 "12년 연속 0건" 부분부터 다듬어드릴게요.',
    chips: [],
    card: {
      title: "12년 연속 마감 지연 0건",
      subtitle: "이력서 '목표' 섹션의 기존 표현",
      options: [
        {
          emoji: "🚀",
          title: "안정적인 결산 마감 프로세스 운영",
          description: "보수적 표현 · 수치 대신 안정성으로",
        },
        {
          emoji: "📊",
          title: "최근 10년 결산 마감 지연 0건",
          description: "기간 한정 · 헤맸던 2년 제외",
        },
        {
          emoji: "⭐",
          title: "꼼꼼한 자료 검증을 통한 결산 정확도",
          description: "강점 중심 · 0건 대신 일하는 방식",
        },
      ],
    },
  },
};

// [B 타입 — 초안별 시각 메타데이터]
// draftId 기반으로 컬러 배지(이모지+톤)와 키워드 태그를 부여한다.
// 실제 draft 콘텐츠는 ../drafts.ts(공통)에서 오고, 여기는 *시각 표현 약속*만 정의한다.
const DRAFT_VISUAL_META: Record<
  string,
  {
    emoji: string;
    badgeLabel: string;
    badgeColor: string;     // 텍스트 컬러
    badgeBg: string;        // 배경
    tags: string[];
  }
> = {
  "draft-01": {
    emoji: "\ud83d\udcca",
    badgeLabel: "데이터",
    badgeColor: "#0066FF",
    badgeBg: "rgba(0,102,255,0.10)",
    tags: ["표현 설득력 \u2191", "직무 적합성 \u2191", "과장 위험 \u26a0"],
  },
  "draft-02": {
    emoji: "\ud83d\udcbc",
    badgeLabel: "전문적",
    badgeColor: "#00875A",
    badgeBg: "rgba(0,135,90,0.10)",
    tags: ["직무 적합성 \u2191\u2191", "경험 반영도 \u2191", "표현 설득력 \u2191"],
  },
  "draft-03": {
    emoji: "\u2728",
    badgeLabel: "스토리텔링",
    badgeColor: "#8E5BFF",
    badgeBg: "rgba(142,91,255,0.12)",
    tags: ["경험 반영도 \u2191\u2191", "선택 용이성 \u2191", "직무 적합성 \u25b3"],
  },
};

const DRAFT_CARD_META: Record<string, { title: string; description: string; chips: string[] }> = {
  "draft-01": {
    title: "성과 중심 초안",
    description: "월·연 결산 운영 경험을 성과 중심으로 정리했어요",
    chips: ["수치", "임팩트", "결과"],
  },
  "draft-02": {
    title: "직무 적합 중심 초안",
    description: "회계 실무 경험을 지원 직무와 연결해 정리했어요",
    chips: ["역량", "직무", "기술"],
  },
  "draft-03": {
    title: "경험 서사 초안",
    description: "일해온 과정과 성장 흐름이 드러나도록 정리했어요",
    chips: ["과정", "성장", "초안"],
  },
};

const DRAFT_DETAIL_CHIPS: Record<string, string[]> = {
  "draft-01": ["전표 1,500건", "자료 정확도 99%", "회계관리"],
  "draft-02": ["결산 마감", "감사 대응", "세무 협업"],
  "draft-03": ["12년 경험", "성장 과정", "협업 경험"],
};

const DRAFT_DETAIL_BODY: Record<
  string,
  {
    projectTitle: string;
    overview: string;
    goals: string[];
    roleAndResults: string[];
  }
> = {
  "draft-01": {
    projectTitle: "[프로젝트 1] 월·연 결산 마감 프로세스 운영",
    overview:
      "직원 30명 연매출 120억 원 규모의 의류 유통 기업에서 월·연 결산 마감을 12년간 전담했습니다.",
    goals: [
      "📊 매월 결산 마감 일정 관리",
      "📌 외부 회계 감사 대응",
      "💳 부가세·법인세 신고 자료 정리",
      "📝 결산 종료 후 대표 보고 자료 작성",
    ],
    roleAndResults: [
      "📆 1,500건 전표 월평균 처리 → 정확도 99.8%",
      "📈 외부 감사 12년 연속 주요 지적 사항 0건 유지",
      "🚨 신고 자료 정확도 99% 수준 유지",
      "🧾 결산 마감 일정을 평균 5영업일 이내로 관리",
    ],
  },
  "draft-02": {
    projectTitle: "[프로젝트 1] 회계 데이터 검증 및 세무 협업 운영",
    overview:
      "의류 유통 기업의 월 회계 운영에서 세무사·대표·외부 감사·거래처와의 협업 체계를 유지하고, 자료 정합성 검증과 후배 검토까지 책임졌습니다.",
    goals: [
      "🤝 세무사 협업 전 회계 자료 사전 검토",
      "📅 결산 마감 일정에 맞춘 자료 정리 및 공유",
      "📌 외부 회계 감사 질의 응답 대응",
      "🗂️ 법무·노무 자료와 회계 자료의 일관성 확인",
    ],
    roleAndResults: [
      "🧾 매입·매출 전표 검증 및 세무 자료 정리 담당",
      "📊 대표 보고용 결산 자료 작성 및 공유",
      "☎️ 거래처 마감 자료 차이 발생 시 직접 컨택",
      "✅ 후배 사원 자료 검토를 병행하며 검증 절차 표준화",
    ],
  },
  "draft-03": {
    projectTitle: "[프로젝트 1] 입사 후 회계 운영을 다듬어 온 12년의 흐름",
    overview:
      "2012년 회계 담당으로 입사해 과장으로 성장하기까지, 결산 마감 운영을 익히고 자료 정리 방식과 외부 협업 방식을 꾸준히 안정화해 왔습니다.",
    goals: [
      "🌱 입사 초기 결산 마감 흐름 학습",
      "🗃️ 경력이 쌓이며 자료 관리 방식 정립",
      "🔄 회계 시스템 전환 시기 자료 변환 및 검증 수행",
      "🤝 외부 감사·세무사 협업 과정에서 자료 신뢰도 책임",
    ],
    roleAndResults: [
      "📈 12년간 회계 운영에서 매년 자료 정리 방식을 점검하고 보완",
      "👥 담당자에서 과장으로 역할 확대, 후배 자료 검토 병행",
      "🗓️ 결산 시즌마다 우선순위와 일정 관리를 직접 정리",
      "💬 부서 외부와의 보고·소통 채널을 이어가며 회계 신뢰 기반 유지",
    ],
  },
};

const CM02_REVIEW_META: Record<
  string,
  {
    introTitle: string;
    reviewTitle: string;
    issueBadges: string[];
    original: string;
    revisedBadge: string;
    revised: string;
    guideBadge: string;
    guide: string;
  }
> = {
  "draft-01": {
    introTitle: "성과 중심 초안",
    reviewTitle: "첫 번째(1/2): 외부 감사 기간 표현",
    issueBadges: ["표현이 강해요", "0건이 부정적으로 보여요"],
    original: "외부 회계 감사 12년 연속 주요 지적 사항 0건 유지",
    revisedBadge: "정확성을 통해 안전/신뢰성을 높였어요",
    revised: "외부 회계 감사 대응 과정에서 주요 지적 사항 없이 결산 자료의 정확성을 유지",
    guideBadge: "확실한 수치 유지가 중요해요",
    guide:
      "기간을 명시하지 않고 성과 중심으로 표현하면 더 안전하고 신뢰성 있습니다. 만약 확실한 수치라면 유지해도 좋아요.",
  },
  "draft-02": {
    introTitle: "직무 적합 중심 초안",
    reviewTitle: "첫 번째(1/2): 세무 협업 표현",
    issueBadges: ["표현이 추상적이에요", "수행 방식이 덜 보여요"],
    original: "세무 협업을 통한 회계 자료 정합성 확보",
    revisedBadge: "실제 수행 행동이 더 구체적으로 보여요",
    revised: "매월 세무사에게 자료를 전달하기 전 두 차례 검토해 자료 정합성을 확인",
    guideBadge: "직무 역량은 행동으로 보여주는 게 좋아요",
    guide:
      "지원 직무와 연결할 때는 추상적인 역량 표현보다 실제로 어떤 방식으로 검토하고 협업했는지를 드러내면 더 설득력 있어요.",
  },
  "draft-03": {
    introTitle: "경험 서사 중심 초안",
    reviewTitle: "첫 번째(1/2): 성장 과정 표현",
    issueBadges: ["표현이 모호해요", "구체 행동이 부족해요"],
    original: "12년에 걸쳐 회계 운영 방식을 단계적으로 다듬어옴",
    revisedBadge: "성장 흐름과 실제 행동이 함께 보여요",
    revised: "12년간 회계 운영에서 매년 자료 정리 방식을 점검하고 보완해 옴",
    guideBadge: "서사는 구체적인 반복 행동과 연결하면 좋아요",
    guide:
      "경험의 흐름을 보여줄 때도 막연한 성장 표현보다 매년 반복해 온 점검·보완 행동을 함께 쓰면 더 신뢰감 있게 읽혀요.",
  },
};

const CM02_SECOND_REVIEW_META = {
  reviewTitle: "두 번째(2/2): 프로젝트 기간 표기",
  issueBadge: "강한 표현",
  original: "담당 업무 · 2010.03 ~ 2012.02 (24개월)",
  revisedBadges: ["정확성", "안전/신뢰성"],
  options: [
    "A 정확한 기간 (24개월 운영)",
    "B 연도만 (2010~2012년)",
    "C 기간 생략하고 성과 중심",
  ],
};

// [B 타입 — 문장별 실질 키워드]
// 각 draft의 goals / roleAndResults 문장에서 뽑은 핵심 표현. 파란 chip으로 노출.
const SENTENCE_KEYWORDS: Record<
  string,
  { goals: string[]; roleAndResults: string[] }
> = {
  "draft-01": {
    goals: ["결산 마감", "외부 감사", "세무 신고", "대표 보고"],
    roleAndResults: ["전표 처리", "감사 대응", "세무 협업"],
  },
  "draft-02": {
    goals: ["세무 협업", "결산 마감", "감사 응대", "자료 일관성"],
    roleAndResults: ["전표 검증", "대표 보고", "거래처 컨택", "검토 표준화"],
  },
  "draft-03": {
    goals: ["결산 학습", "자료 관리", "시스템 전환", "신뢰 관리"],
    roleAndResults: ["회계 운영", "역할 확대", "일정 관리", "외부 소통"],
  },
};

// [B 타입 — 키워드별 툴팁 문구]
// 어떤 직무를 선택했는지에 따라 일부 문구는 동적으로 직무명을 끼워 넣는다.
function tooltipForKeyword(keyword: string, roleLabel: string): string {
  switch (keyword) {
    case "결산 마감":
    case "결산 학습":
      return `최근 선택하신 ${roleLabel} 직무에서 자주 활용되는 표현이에요.`;
    case "외부 감사":
    case "세무 협업":
    case "감사 응대":
    case "감사 대응":
      return "외부 협업·검증 경험을 강조하는 표현이에요.";
    case "전표 처리":
    case "전표 검증":
      return "실무 처리량과 정확성을 구체적으로 보여주는 표현이에요.";
    case "대표 보고":
      return "내부 보고·커뮤니케이션 경험을 보여주는 표현이에요.";
    case "자료 관리":
      return "체계적인 자료 관리 능력을 보여주는 표현이에요.";
    case "회계 운영":
      return "장기 경력의 연속성을 자연스럽게 보여주는 표현이에요.";
    case "역할 확대":
      return "직무 성장 흐름을 자연스럽게 보여주는 표현이에요.";
    case "세무 신고":
      return "정확한 세무 신고 처리 경험을 보여주는 표현이에요.";
    case "자료 일관성":
      return "여러 부서 자료를 통합적으로 관리해온 경험을 보여주는 표현이에요.";
    case "거래처 컨택":
      return "거래처와의 자료 정합성을 직접 챙겨온 경험을 보여주는 표현이에요.";
    case "검토 표준화":
      return "내부 검증 절차를 정립한 경험을 보여주는 표현이에요.";
    case "시스템 전환":
      return "회계 시스템 변화에 대응한 경험을 보여주는 표현이에요.";
    case "신뢰 관리":
      return "외부 협업에서 자료 신뢰를 책임진 경험을 보여주는 표현이에요.";
    case "일정 관리":
      return "팀 운영의 우선순위·일정을 직접 챙긴 경험을 보여주는 표현이에요.";
    case "외부 소통":
      return "부서 밖과의 보고·소통 경험을 보여주는 표현이에요.";
    default:
      return `최근 선택하신 ${roleLabel} 직무에서 자주 활용되는 표현이에요.`;
  }
}

function ChevronRightIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 5L16 12L9 19" stroke="#C4C6CA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg className="animate-spin" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="loadingGradient" x1="10" y1="2" x2="10" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00ADFF" />
          <stop offset="1" stopColor="#0066FF" />
        </linearGradient>
      </defs>
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke="url(#loadingGradient)"
        strokeLinecap="round"
        strokeWidth="1.5"
        strokeDasharray="32 12"
      />
    </svg>
  );
}

function ResumeRow({
  index,
  label,
  onClick,
}: {
  index: number;
  label: string;
  onClick: (index: number) => void;
}) {
  return (
    <button
      className="flex h-[52px] w-full items-center justify-between border-b border-[#70737C29]"
      onClick={() => onClick(index)}
      type="button"
    >
      <div className="flex items-center gap-[8px]">
        <FileText className="h-[20px] w-[20px] text-black" strokeWidth={1.8} aria-hidden="true" />
        <span className="text-[16px] font-medium leading-[24px] tracking-[0.57px] text-black">
          {label}
        </span>
      </div>
      <ChevronRightIcon />
    </button>
  );
}

function Chip({
  children,
  variant = "gray",
}: {
  children: React.ReactNode;
  variant?: "gray" | "blue" | "purple";
}) {
  const variantClassName = {
    gray: "bg-[rgba(55,56,60,0.06)] text-[rgba(55,56,60,0.61)]",
    blue: "border border-[rgba(0,102,255,0.24)] bg-[rgba(0,102,255,0.08)] text-[#0066FF]",
    purple: "border border-[rgba(101,65,242,0.24)] bg-[rgba(101,65,242,0.08)] text-[#6541F2]",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-[4px] rounded-[6px] px-[7px] py-[4px] text-[12px] font-medium leading-none ${variantClassName}`}
    >
      {children}
    </span>
  );
}

function Cm02ReviewCard({
  draftId,
  onApply,
  onKeep,
}: {
  draftId?: string;
  onApply: () => void;
  onKeep: () => void;
}) {
  const reviewMeta = CM02_REVIEW_META[draftId ?? "draft-01"] ?? CM02_REVIEW_META["draft-01"];

  return (
    <div className="flex flex-col gap-[28px]">
      <section className="flex flex-col gap-[12px]">
        <p className="text-[16px] font-medium leading-[26px] tracking-[0.091px] text-[#171719]">
          {reviewMeta.reviewTitle}
        </p>
        <div className="h-px w-full bg-[#70737C29]" />
      </section>

      <section className="flex flex-col gap-[12px]">
        <div className="flex flex-wrap gap-[8px]">
          {reviewMeta.issueBadges.map((badge) => (
            <span
              key={badge}
              className="rounded-[8px] bg-[#FEECEC] px-[8px] py-[5px] text-[14px] font-medium leading-[20px] tracking-[0.203px] text-[#FF4242]"
            >
              {badge}
            </span>
          ))}
        </div>
        <p className="text-[16px] font-normal leading-[26px] tracking-[0.091px] text-[rgba(46,47,51,0.88)]">
          {reviewMeta.original}
        </p>
      </section>

      <section className="flex flex-col gap-[12px]">
        <div>
          <span className="rounded-[8px] bg-[rgba(0,102,255,0.08)] px-[8px] py-[5px] text-[14px] font-medium leading-[20px] tracking-[0.203px] text-[#005EEB]">
            {reviewMeta.revisedBadge}
          </span>
        </div>
        <p className="text-[16px] font-normal leading-[26px] tracking-[0.091px] text-[#171719]">
          {reviewMeta.revised}
        </p>
      </section>

      <section className="flex flex-col gap-[12px]">
        <div>
          <span className="rounded-[8px] bg-[#F7F7F8] px-[8px] py-[5px] text-[14px] font-medium leading-[20px] tracking-[0.203px] text-[rgba(55,56,60,0.61)]">
            {reviewMeta.guideBadge}
          </span>
        </div>
        <p className="text-[16px] font-normal leading-[26px] tracking-[0.091px] text-[#171719]">
          {reviewMeta.guide}
        </p>
      </section>

      <div className="h-px w-full bg-[#70737C29]" />

      <div className="flex gap-[8px]">
        <button
          type="button"
          onClick={onApply}
          className="rounded-[10px] bg-[#0066FF] px-[20px] py-[12px] text-[16px] font-semibold leading-[24px] tracking-[0.57px] text-white transition-all duration-150 ease-out hover:bg-[#005BE6] hover:shadow-[0_8px_18px_rgba(0,102,255,0.22)] active:scale-[0.98] active:bg-[#004FCC] active:shadow-[0_3px_8px_rgba(0,102,255,0.18)]"
        >
          수정 문장 채택
        </button>
        <button
          type="button"
          onClick={onKeep}
          className="rounded-[10px] border border-[#0066FF] bg-white px-[20px] py-[12px] text-[16px] font-semibold leading-[24px] tracking-[0.57px] text-[#0066FF] transition-all duration-150 ease-out hover:bg-[#F5F9FF] hover:shadow-[0_6px_14px_rgba(0,102,255,0.12)] active:scale-[0.98] active:bg-[#EAF2FE] active:shadow-[0_2px_6px_rgba(0,102,255,0.1)]"
        >
          기존 유지
        </button>
      </div>

      <p className="text-[16px] font-semibold leading-[26px] tracking-[0.57px] text-[#171719]">
        수정하고 싶은 내용을 직접 입력해주셔도 좋아요.
      </p>
    </div>
  );
}

function Cm02SecondReviewCard({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="flex flex-col gap-[20px]">
      <p className="text-[16px] font-semibold leading-[24px] tracking-[0.091px] text-[#171719]">
        {CM02_SECOND_REVIEW_META.reviewTitle}
      </p>

      <section className="flex flex-col gap-[8px]">
        <p className="text-[14px] font-medium leading-[20px] tracking-[0.203px] text-[#FF4242]">
          기존 문장
        </p>
        <div className="flex flex-col gap-[8px]">
          <span className="self-start rounded-[8px] bg-[#FEECEC] px-[8px] py-[5px] text-[13px] font-semibold leading-[18px] tracking-[0.194px] text-[#FF4242]">
            {CM02_SECOND_REVIEW_META.issueBadge}
          </span>
          <p className="text-[16px] font-semibold leading-[24px] tracking-[0.091px] text-[#FF4242]">
            {CM02_SECOND_REVIEW_META.original}
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-[8px]">
        <p className="text-[14px] font-medium leading-[20px] tracking-[0.203px] text-[#0066FF]">
          수정 문장
        </p>
        <div className="flex flex-wrap gap-[4px]">
          {CM02_SECOND_REVIEW_META.revisedBadges.map((badge) => (
            <span
              key={badge}
              className="rounded-[8px] bg-[#EAF2FE] px-[8px] py-[5px] text-[13px] font-semibold leading-[18px] tracking-[0.194px] text-[#0066FF]"
            >
              {badge}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-[8px]">
          {CM02_SECOND_REVIEW_META.options.map((option) => (
            <button
              key={option}
              type="button"
              className="self-start text-left text-[16px] font-semibold leading-[24px] tracking-[0.091px] text-[#0066FF]"
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-[#70737C29]" />

      <div className="grid grid-cols-4 gap-[8px]">
        {["A 채택", "B 채택", "C 채택", "기존 유지"].map((label) => (
          <button
            key={label}
            type="button"
            onClick={onComplete}
            className={`rounded-[10px] px-[10px] py-[12px] text-[15px] font-semibold leading-[24px] tracking-[0.96px] transition-all duration-150 ease-out active:scale-[0.98] ${
              label === "기존 유지"
                ? "border border-[#0066FF] bg-white text-[#0066FF] hover:bg-[#F5F9FF] hover:shadow-[0_6px_14px_rgba(0,102,255,0.12)] active:bg-[#EAF2FE] active:shadow-[0_2px_6px_rgba(0,102,255,0.1)]"
                : "bg-[#0066FF] text-white hover:bg-[#005BE6] hover:shadow-[0_8px_18px_rgba(0,102,255,0.22)] active:bg-[#004FCC] active:shadow-[0_3px_8px_rgba(0,102,255,0.18)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-[16px] font-semibold leading-[26px] tracking-[0.57px] text-[#171719]">
        수정하고 싶은 내용을 직접 입력해주셔도 좋아요.
      </p>
    </div>
  );
}

function Cm02ConfirmCard({
  onReviewMore,
  onFinalize,
}: {
  onReviewMore: () => void;
  onFinalize: () => void;
}) {
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="h-px w-full bg-[#70737C29]" />
      <section className="flex flex-col gap-[8px]">
        <p className="text-[13px] font-medium leading-[18px] tracking-[0.252px] text-[#0066FF]">
          초안 미리보기
        </p>
        <button
          type="button"
          className="w-full overflow-hidden rounded-[12px] border border-[#EAF2FE] bg-white text-left shadow-[0_1px_2px_-1px_rgba(23,23,23,0.1)]"
        >
          <div className="flex gap-[8px] bg-[#EAF2FE] px-[20px] py-[10px]">
            {["수치", "임팩트", "결과"].map((chip) => (
              <span
                key={chip}
                className="rounded-[8px] bg-white px-[8px] py-[5px] text-[13px] font-semibold leading-[18px] tracking-[0.194px] text-[#0066FF]"
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between px-[20px] py-[20px]">
            <p className="text-[18px] font-semibold leading-[26px] tracking-[-0.02px] text-[#171719]">
              성과 중심 초안
            </p>
            <FileText className="h-[22px] w-[22px] text-[rgba(55,56,60,0.24)]" strokeWidth={1.5} aria-hidden="true" />
          </div>
        </button>
      </section>
      <div className="h-px w-full bg-[#70737C29]" />
      <div className="flex gap-[8px]">
        <button
          type="button"
          onClick={onReviewMore}
          className="rounded-[10px] bg-[#0066FF] px-[18px] py-[12px] text-[16px] font-semibold leading-[24px] tracking-[0.091px] text-white transition-all duration-150 ease-out hover:bg-[#005BE6] hover:shadow-[0_8px_18px_rgba(0,102,255,0.22)] active:scale-[0.98] active:bg-[#004FCC] active:shadow-[0_3px_8px_rgba(0,102,255,0.18)]"
        >
          추가 검토하기
        </button>
        <button
          type="button"
          onClick={onFinalize}
          className="rounded-[10px] border border-[#0066FF] bg-white px-[18px] py-[12px] text-[16px] font-semibold leading-[24px] tracking-[0.091px] text-[#0066FF] transition-all duration-150 ease-out hover:bg-[#F5F9FF] hover:shadow-[0_6px_14px_rgba(0,102,255,0.12)] active:scale-[0.98] active:bg-[#EAF2FE] active:shadow-[0_2px_6px_rgba(0,102,255,0.1)]"
        >
          최종 단계로 넘어가기
        </button>
      </div>
    </div>
  );
}

function BottomSheet({
  isOpen,
  onClose,
  onSelect,
  draft,
  appliedRevision: _appliedRevision,
  selectedRoleTitle: _selectedRoleTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (draft: Draft) => void;
  draft: Draft | null;
  appliedRevision: {
    originalSentence: string;
    revisedSentence: string;
    changeReason: string;
  } | null;
  selectedRoleTitle: string;
}) {
  // 3.7: BottomSheet 본문을 A 모달과 동일한 디자인으로 통일.
  // - 헤더: A 스타일 (단, B는 번호 인디케이터 없이)
  // - 본문: A의 DraftCriteriaCard / DraftDetailBody 구조 + B 특이성(chips, bullet emoji)
  // - 푸터: A 스타일 "이 초안 선택하기" 버튼
  const [isRationaleOpen, setIsRationaleOpen] = useState(false);
  const chips = draft?.draftId ? DRAFT_DETAIL_CHIPS[draft.draftId] ?? [] : [];

  return (
    <div
      className={`absolute inset-0 z-50 flex justify-center transition-opacity duration-300 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        aria-label="닫기"
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        type="button"
      />
      <section
        className={`absolute bottom-0 left-0 flex h-[89dvh] w-full flex-col rounded-t-[12px] bg-white font-['Pretendard',sans-serif] transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-line-solid-strong" />
        </div>

        {/* Header — A 스타일, 번호 없음 */}
        <div className="flex items-center justify-between px-4 py-6">
          <h2 className="text-heading-2 font-bold text-label-strong">
            {draft?.draftTitle ?? "—"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-label-strong"
            aria-label="닫기"
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto px-5"
          style={{ scrollbarGutter: "stable" }}
        >
          {/* 초안 작성 기준 카드 */}
          <div
            className="flex w-full flex-col rounded-xl border p-4 transition-colors"
            style={{
              borderColor: "#EAF2FE",
              background:
                "linear-gradient(0deg, #F7F9FF 0%, #FCFDFE 100%), #FFF",
            }}
          >
            <button
              type="button"
              onClick={() => setIsRationaleOpen((v) => !v)}
              className="flex w-full items-center gap-3 text-left"
              aria-expanded={isRationaleOpen}
            >
              <AiOrb size={20} />
              <span className="flex-1 text-body-1 font-medium text-label-normal">
                초안 작성 기준
              </span>
              <ChevronDown
                className={`h-5 w-5 text-label-neutral transition-transform duration-300 ease-out ${
                  isRationaleOpen ? "rotate-180" : ""
                }`}
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>
            <div
              className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
                isRationaleOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
              aria-hidden={!isRationaleOpen}
            >
              <div className="min-h-0">
                <div className="mt-4 h-px w-full bg-line-solid-normal" />
                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <p className="text-body-2-reading text-label-neutral mb-1">
                      적용된 점
                    </p>
                    <p className="text-body-1-reading text-label-normal">
                      {draft?.whyRecommended ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-body-2-reading text-label-neutral mb-1">
                      보완하면 좋은 점
                    </p>
                    <p className="text-body-1-reading text-label-normal">
                      {draft?.caution ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 본문 — A의 DraftDetailBody 구조 + B 특이성(chips, emoji) */}
          <div className="flex flex-col gap-6 pb-2 pt-9">
            {/* 회사명 + 기간 + chips */}
            <div className="flex flex-col gap-1 px-1">
              <h3 className="text-headline-1 font-bold text-label-normal">
                {draft?.body.company.split("—")[0].trim() ?? "—"}
              </h3>
              <p className="text-body-2-reading text-label-neutral">
                {draft?.body.period ?? "—"}
              </p>
              {chips.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-lg bg-[rgba(0,102,255,0.08)] px-2.5 py-1.5 text-body-2-reading font-semibold text-[#0066FF]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-5 h-px w-full bg-line-solid-normal" />
            </div>

            {/* 프로젝트 */}
            <div className="flex flex-col gap-3 px-1">
              <h3 className="text-headline-1 font-bold text-label-normal">
                {draft?.body.projectTitle.replace("프로젝트 1 ·", "[프로젝트 1]") ?? "—"}
              </h3>
              <p className="text-body-1-reading text-label-normal">
                {draft?.body.overview ?? "—"}
              </p>
            </div>

            {/* 업무 상세 */}
            <div className="flex flex-col gap-1 px-1">
              <h4 className="text-headline-1 font-bold text-label-normal">
                업무 상세
              </h4>
              <ul className="flex flex-col gap-1 pt-3">
                {(draft?.body.goals ?? []).map((bullet, i) => (
                  <li
                    key={i}
                    className="text-body-1-reading text-label-normal flex gap-2 px-1"
                  >
                    <span aria-hidden="true">{bullet.emoji ?? "•"}</span>
                    <span className="flex-1">{bullet.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 역할 및 성과 */}
            <div className="flex flex-col gap-1 px-1">
              <h4 className="text-headline-1 font-bold text-label-normal">
                역할 및 성과
              </h4>
              <ul className="flex flex-col gap-1 pt-3">
                {(draft?.body.roleAndResults ?? []).map((bullet, i) => (
                  <li
                    key={i}
                    className="text-body-1-reading text-label-normal flex gap-2 px-1"
                  >
                    <span aria-hidden="true">{bullet.emoji ?? "•"}</span>
                    <span className="flex-1">{bullet.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA + 흰색 fade */}
        <div className="relative w-full">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 left-0 right-0 h-10"
            style={{
              background:
                "linear-gradient(0deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)",
            }}
/>
          <div className="px-7 py-3.5">
            <button
              type="button"
              disabled={!draft}
              onClick={() => {
                if (draft) onSelect(draft);
              }}
              className="w-full self-stretch rounded-xl bg-primary-normal px-7 py-3.5 text-center text-headline-2 font-bold text-static-white transition-colors hover:bg-primary-strong active:bg-primary-heavy disabled:bg-[#C4C6CA]"
            >
              이 초안 선택하기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// [A 타입 sections 라벨 → 스타일 매핑]
// CM2 카드("기존 문장" / "AI 수정안")와 챗 sections에서 *같은 라벨이면 같은 시각 스타일*로
// 일관되게 그리기 위한 매핑 함수.
function getSectionVariant(label: string): "strikethrough" | "underline" | "plain" {
  // 회색 + 취소선 — 옛 표현
  if (label === "기존 문장" || label === "유지된 문장") {
    return "strikethrough";
  }
  // 검정 + 파란 밑줄 — AI가 새로 만든 수정안
  // "AI 수정안", "수정 문장", "N차 수정안" (1~3), "수정안 N안" (1~9) 모두 포함
  const fixedUnderlineLabels = [
    "AI 수정안",
    "수정 문장",
    "1차 수정안",
    "2차 수정안",
    "3차 수정안",
  ];
  const isParallelOption = /^수정 \d+안$/.test(label);
  if (fixedUnderlineLabels.includes(label) || isParallelOption) {
    return "underline";
  }
  // 평문 — 변경 이유, 판단 근거, 확인 필요, 대안 제안, 적용된 표현, 쉽게 보면, 추천, 다음 선택지 등
  return "plain";
}

export default function Page() {
  const MAX_REFINEMENT_TURNS = 8;
  const MAX_AI_CALLS_PER_SESSION = 8;
  const handleContinueToNextStepB = () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const s = params.get("s") ?? "accounting-manager";
    const done = params.get("done") ?? "";
    const doneTypes = done.split(",").filter(Boolean);
    const currentType = "B";
    const newDone = doneTypes.includes(currentType) ? done : [...doneTypes, currentType].join(",");
    window.location.href = `/next-step?from=${currentType}&s=${s}&done=${newDone}`;
  };

  const [view, setView] = useState<"start" | "home" | "selected" | "chat" | "complete">("start");
  const [messages, setMessages] = useState<
    {
      type: "user" | "agent";
      text: string;
      displayStyle?: "header" | "bubble";
      stageId?: string;
      chips?: string[];
      card?: {
        title: string;
        subtitle: string;
        options: { emoji: string; title: string; description: string }[];
      } | null;
      resultCard?: {
        previous: string;
        revised: string;
        message: string;
      };
      // [CM2] 수정 카드: 기존 문장 / AI 수정안 / 변경 이유를 한 카드로 보여줌.
      refinementCard?: {
        draftTitle: string;
        originalSentence: string;
        revisedSentence: string;
        changeReason: string;
      };
      secondReviewCard?: boolean;
      confirmCard?: boolean;
      // [A 타입 챗] 라벨드 섹션 배열 — 소타이틀 + 내용을 반복 렌더.
      sections?: { label: string; content: string }[];
    }[]
  >([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedRewriteOption, setSelectedRewriteOption] = useState<number | null>(null);
  const [editingSampleIndex, setEditingSampleIndex] = useState<number | null>(null);
  const [refinementTurnCount, setRefinementTurnCount] = useState(0);
  const [isFlowComplete, setIsFlowComplete] = useState(false);
  const [aiCallCount, setAiCallCount] = useState(0);
  const [hasFinalizedRevision, setHasFinalizedRevision] = useState(false);
  const [hasShownSampleReview, setHasShownSampleReview] = useState(false);
  // [임시 숨김] 직무 선택(selectRole) 화면만 숨김. 로딩(loadingDraft) → 초안(draftReady) 흐름은 유지.
  // 마크업/로직은 모두 보존되어 있고, 초기값만 "loadingDraft"로 바꿔 진입 시 selectRole만 건너뛴다.
  // 되살리려면 아래 초기값을 "selectRole"로 바꾸기만 하면 된다.
  const [flowStep, setFlowStep] = useState<"selectRole" | "loadingDraft" | "draftReady">("selectRole");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // [판단보조형 Agent 상태값] T3 단계, CM1/CM2 흐름에서 추적
  // 현재는 선언만 해두고, AI 응답 로직과 묶는 작업은 다음 단계에서 진행한다.
  const [currentStep, setCurrentStep] = useState<CurrentStep>(
    DEFAULT_AGENT_STATE.currentStep
  );
  // B 페이지에서는 prototypeType 초기값을 "B"로 고정한다.
  const [prototypeType, setPrototypeType] = useState<PrototypeType>("B");
  const [userIntent, setUserIntent] = useState<UserIntent | null>(
    DEFAULT_AGENT_STATE.userIntent
  );
  const [decisionStatus, setDecisionStatus] = useState<DecisionStatus>(
    DEFAULT_AGENT_STATE.decisionStatus
  );
  // CM1에서 사용자가 비교 가능한 전체 초안 목록.
  // ─── 시나리오 데이터 어댑터 ─────────────────────────────────
  // URL 파라미터(?s=<scenarioId>)에서 현재 시나리오를 받아 scenarioDrafts에 담는다.
  const scenario = useScenario();
  const scenarioDrafts = useMemo<Draft[]>(
    () => scenario.drafts.map((d) => toLegacyDraft(d, scenario.persona)),
    [scenario]
  );

  const [draftOptions, setDraftOptions] = useState<Draft[]>(scenarioDrafts);
  // CM1에서 사용자가 선택한 '전체 초안'. CM2로 진입할 때 채워진다.
  const [selectedDraft, setSelectedDraft] = useState<SelectedDraft>(
    DEFAULT_AGENT_STATE.selectedDraft
  );
  // [CM1 라디오 후보] '이 초안 선택하기' 버튼을 누르기 전, 임시로 골라둔 초안.
  const [cm1Candidate, setCm1Candidate] = useState<Draft | null>(null);
  // [B 타입 — 초안 상세 펼침] draftId 별로 펼침/접힘 상태 관리.
  const [expandedDrafts, setExpandedDrafts] = useState<Record<string, boolean>>({});
  const toggleDraftExpanded = (draftId: string) => {
    setExpandedDrafts((prev) => ({ ...prev, [draftId]: !prev[draftId] }));
  };
  // [바텀시트 대상] 어느 초안의 상세를 시트에 띄울지.
  const [bottomSheetDraft, setBottomSheetDraft] = useState<Draft | null>(null);
  // [CM1 안내 타이핑 완료 플래그] 4줄이 모두 타이핑된 후에 초안 리스트 + 하단 버튼 노출.
  const [cm1IntroDone, setCm1IntroDone] = useState(false);
  // [CM1 안내 노출 단계] 1=첫 줄 / 2=두 번째 줄 ... / 4=네 번째 줄. 각 줄은 자기 step일 때 등장+타이핑.
  const [cm1IntroStep, setCm1IntroStep] = useState(0);
  // [refinementCard 필드 단계] 메시지 index → 현재까지 등장한 카드 필드 수 (0~4).
  // 1: 선택한 초안 / 2: 기존 문장 / 3: AI 수정안 / 4: 변경 이유
  const [refinementCardStep, setRefinementCardStep] = useState<Record<number, number>>({});
  // [B 타입 — 인라인 팝오버] 어떤 message index의 refinementCard popover가 열려있는지.
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null);
  // [메시지별 스트리밍 완료 플래그] 챗 메시지의 모든 타이핑이 끝났을 때 true.
  // 이 시점에 chips, refinementCard 버튼 등이 등장.
  const [messageDone, setMessageDone] = useState<Record<number, boolean>>({});
  // [타이프라이터 스트리밍] AI 응답을 글자/섹션 단위로 점진적으로 그린다.
  const [streamingMessageIndex, setStreamingMessageIndex] = useState<number | null>(null);
  const [streamedCharCount, setStreamedCharCount] = useState(0);
  const [streamedSectionCount, setStreamedSectionCount] = useState(0);
  // [CM2 수정 카드의 결정 결과] "apply" | "keep" | "retry" — 한 번 누르면 그 카드의 버튼들은 비활성된다.
  const [refinementCardOutcome, setRefinementCardOutcome] = useState<
    "apply" | "keep" | "retry" | null
  >(null);
  // [적용된 수정안] 수정안 적용 시 어떤 문장이 어떻게 바뀌었고 왜 바뀌었는지 기억.
  // BottomSheet가 이 정보를 보고 해당 문장에 노란 하이라이트 + 변경 이유 파란 글씨를 렌더한다.
  const [appliedRevision, setAppliedRevision] = useState<{
    originalSentence: string;
    revisedSentence: string;
    changeReason: string;
  } | null>(null);

  // [API payload용 보조 상태값]
  // 아직 UI 흐름과 연결하지 않고 빈 문자열 기본값으로만 둔다. 다음 단계에서 채운다.
  const [currentAiDraft, setCurrentAiDraft] = useState<string>("");
  const [userExperienceRaw, setUserExperienceRaw] = useState<string>("");

  // dev: 상태 변화 시 콘솔 로그
  useEffect(() => {
    console.log("[AgentState]", {
      currentStep,
      prototypeType,
      userIntent,
      decisionStatus,
      selectedDraft: selectedDraft?.draftId ?? null,
    });
  }, [currentStep, prototypeType, userIntent, decisionStatus, selectedDraft]);

  // 미사용 경고 방지(현재 단계에서 직접 호출하지 않는 setter들)
  void setPrototypeType;
  void setUserExperienceRaw;
  void setDraftOptions;

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].type === "user") {
      const container = scrollContainerRef.current;
      const target = lastUserMessageRef.current;

      if (container && target) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const offset = targetRect.top - containerRect.top + container.scrollTop;

        container.scrollTo({
          top: Math.max(0, offset - 20),
          behavior: "smooth",
        });
      }
    }
  }, [messages]);

  useEffect(() => {
    if (view !== "chat") return;
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const shouldFollowAgent =
      lastMessage?.type === "agent" &&
      (streamingMessageIndex !== null ||
        isLoading ||
        messageDone[messages.length - 1] === false);

    if (!shouldFollowAgent) return;

    const frame = requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [
    view,
    messages.length,
    streamingMessageIndex,
    streamedCharCount,
    streamedSectionCount,
    refinementCardStep,
    messageDone,
    isLoading,
  ]);

  useEffect(() => {
    if (flowStep !== "loadingDraft") {
      return;
    }

    const timer = setTimeout(() => {
      setFlowStep("draftReady");
    }, 3000);

    return () => clearTimeout(timer);
  }, [flowStep]);

  // [CM1 안내 4줄 sequential] draftReady 진입 시 step 기반으로 한 줄씩 등장.
  // 1줄 타이핑 끝나면 step 2로 → 2줄 등장, ... 4줄 끝나면 cm1IntroDone=true.
  useEffect(() => {
    if (flowStep !== "draftReady") return;
    setCm1IntroDone(false);
    setCm1IntroStep(1);
    const SPEED = 30;
    const GAP = 200;
    const lines = [
      `아래 ${scenarioDrafts.length}가지 방향의 경력기술서 초안을 준비했습니다.`,
      "각 초안은 같은 경험을 바탕으로 하지만, 강조하는 방향이 다릅니다.",
      "먼저 전체 흐름을 읽어보시고, 본인에게 가장 맞는 방향을 하나 선택해 주세요.",
      "선택한 뒤에는 다음 단계에서 문장 표현을 더 담백하게 바꾸거나, 실제 경험과 맞지 않는 부분을 수정할 수 있습니다.",
    ];
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;
    for (let i = 0; i < lines.length; i++) {
      cumulative += lines[i].length * SPEED + GAP;
      const targetStep = i + 2;
      const isLast = i === lines.length - 1;
      timers.push(
        setTimeout(() => {
          setCm1IntroStep(targetStep);
          if (isLast) setCm1IntroDone(true);
        }, cumulative)
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [flowStep]);

  // [타이프라이터 스트리밍] 새 agent 메시지가 추가되면 처음부터 다시 그림.
  useEffect(() => {
    if (messages.length === 0) return;
    const lastIdx = messages.length - 1;
    const lastMsg = messages[lastIdx];
    if (lastMsg.type !== "agent") return;
    // 새 refinementCard가 도착하면 이전 카드 액션 가드(refinementCardOutcome)를 푼다.
    if (lastMsg.refinementCard) {
      setRefinementCardOutcome(null);
    }
    setStreamingMessageIndex(lastIdx);
    setStreamedCharCount(0);
    setStreamedSectionCount(0);

    // [메시지 전체 done 타이머] text + sections + refinementCard 4 필드 누적 시간 계산.
    // 이 시간이 지나야 chips/refinementCard 버튼이 노출됨.
    const SPEED = 30;
    const GAP = 200;
    let totalMs = (lastMsg.text?.length ?? 0) * SPEED;
    for (const s of lastMsg.sections ?? []) {
      totalMs += GAP + (s.content?.length ?? 0) * SPEED;
    }
    if (lastMsg.refinementCard) {
      const rc = lastMsg.refinementCard;
      totalMs += GAP + (rc.draftTitle?.length ?? 0) * SPEED;
      totalMs += GAP + (rc.originalSentence?.length ?? 0) * SPEED;
      totalMs += GAP + (rc.revisedSentence?.length ?? 0) * SPEED;
      totalMs += GAP + (rc.changeReason?.length ?? 0) * SPEED;
    }
    totalMs += 200; // 약간의 여유

    setMessageDone((prev) => ({ ...prev, [lastIdx]: false }));
    const doneTimer = setTimeout(() => {
      setMessageDone((prev) => ({ ...prev, [lastIdx]: true }));
    }, totalMs);

    // [refinementCard 필드 reveal 스케줄] 각 필드(라벨+내용)가 자기 시점에 등장.
    const cardTimers: ReturnType<typeof setTimeout>[] = [];
    if (lastMsg.refinementCard) {
      const rc = lastMsg.refinementCard;
      setRefinementCardStep((prev) => ({ ...prev, [lastIdx]: 0 }));
      const textLen = lastMsg.text?.length ?? 0;
      let cum = textLen * SPEED + GAP;
      // step 1: 선택한 초안 + draftTitle
      cardTimers.push(setTimeout(() => {
        setRefinementCardStep((prev) => ({ ...prev, [lastIdx]: 1 }));
      }, cum));
      cum += (rc.draftTitle?.length ?? 0) * SPEED + GAP;
      // step 2: 기존 문장 + originalSentence
      cardTimers.push(setTimeout(() => {
        setRefinementCardStep((prev) => ({ ...prev, [lastIdx]: 2 }));
      }, cum));
      cum += (rc.originalSentence?.length ?? 0) * SPEED + GAP;
      // step 3: AI 수정안 + revisedSentence
      cardTimers.push(setTimeout(() => {
        setRefinementCardStep((prev) => ({ ...prev, [lastIdx]: 3 }));
      }, cum));
      cum += (rc.revisedSentence?.length ?? 0) * SPEED + GAP;
      // step 4: 변경 이유 + changeReason
      cardTimers.push(setTimeout(() => {
        setRefinementCardStep((prev) => ({ ...prev, [lastIdx]: 4 }));
      }, cum));
    }

    return () => {
      clearTimeout(doneTimer);
      cardTimers.forEach(clearTimeout);
    };
  }, [messages.length]);

  // [타이프라이터 진행] text 한 글자씩 → sections 하나씩 → 완료.
  useEffect(() => {
    if (streamingMessageIndex === null) return;
    const msg = messages[streamingMessageIndex];
    if (!msg || msg.type !== "agent") {
      setStreamingMessageIndex(null);
      return;
    }
    // 1단계: text 글자 타이프라이터 (30ms/글자) — ChatGPT 같은 자연스러운 흐름
    if (streamedCharCount < (msg.text || "").length) {
      const timer = setTimeout(() => {
        setStreamedCharCount((c) => c + 1);
      }, 30);
      return () => clearTimeout(timer);
    }
    // 2단계: sections sequential — 이전 section 콘텐츠 타이핑 끝나야 다음 등장
    const SPEED = 30;
    const GAP = 200;
    const totalSections = msg.sections?.length ?? 0;
    if (streamedSectionCount < totalSections) {
      const prevContentLen =
        streamedSectionCount > 0
          ? (msg.sections?.[streamedSectionCount - 1].content.length ?? 0)
          : 0;
      const waitTime = streamedSectionCount === 0 ? GAP : prevContentLen * SPEED + GAP;
      const timer = setTimeout(() => {
        setStreamedSectionCount((s) => s + 1);
      }, waitTime);
      return () => clearTimeout(timer);
    }
    // 3단계: 마지막 section 콘텐츠 타이핑 끝날 때까지 대기
    if (totalSections > 0 && streamedSectionCount === totalSections) {
      const lastContent = msg.sections?.[totalSections - 1].content ?? "";
      const lastWait = lastContent.length * SPEED + GAP;
      const timer = setTimeout(() => setStreamingMessageIndex(null), lastWait);
      return () => clearTimeout(timer);
    }
    // 완료 (sections 없는 메시지)
    setStreamingMessageIndex(null);
  }, [streamingMessageIndex, streamedCharCount, streamedSectionCount, messages]);

  const sendMessage = (overrideMessage?: string, options?: { displayStyle?: "header" | "bubble" }) => {
    const trimmedMessage = (overrideMessage ?? message).trim();

    if (!trimmedMessage) {
      return;
    }

    console.log("[DEBUG] sendMessage 실행", { text: trimmedMessage });

    // [3단계] 사용자 입력 → userIntent 분류 (키워드 기반)
    // 아직 API/Agent 로직과는 연결하지 않고, state에만 반영한다.
    const classifiedIntent = classifyUserIntent(trimmedMessage);
    setUserIntent(classifiedIntent);
    console.log("[UserIntent]", {
      message: trimmedMessage,
      intent: classifiedIntent,
    });

    // [CM1 → CM2 전이]
    // 사용자가 두 초안 중 하나를 '고치고 싶다'고 선택한 순간 CM2로 넘어간다.
    // selectedDraft / currentAiDraft / decisionStatus를 함께 갱신한다.
    // findDraftBySampleIndex는 Draft | undefined를 반환하므로 가드 필요.
    if (trimmedMessage.includes("샘플 경력기술서 1")) {
      const draft = scenarioDrafts[0];
      if (draft) {
        setEditingSampleIndex(0);
        setSelectedDraft(draft);
        setCurrentStep("CM2");
        setCurrentAiDraft(draft.draftContent);
        setDecisionStatus("selected");
      }
    } else if (trimmedMessage.includes("샘플 경력기술서 2")) {
      const draft = scenarioDrafts[1];
      if (draft) {
        setEditingSampleIndex(1);
        setSelectedDraft(draft);
        setCurrentStep("CM2");
        setCurrentAiDraft(draft.draftContent);
        setDecisionStatus("selected");
      }
    }

    if (trimmedMessage === "수정안 확정하기") {
      setMessages((prevMessages) => {
        const nextMessages = [
          ...prevMessages,
          { type: "user" as const, text: trimmedMessage, displayStyle: options?.displayStyle ?? "bubble" },
        ];

        if (hasFinalizedRevision) {
          return nextMessages;
        }

        return [
          ...nextMessages,
          {
            type: "agent" as const,
            text: "테스트 흐름에 따라 수정안을 확정했어요. 수정된 샘플 경력기술서를 다시 확인해보세요.",
            resultCard: {
              previous: "기존 표현을 기반으로 한 초안",
              revised: "사용자 피드백을 반영한 수정안",
              message: "테스트 흐름에 따라 수정안을 확정했어요. 수정된 샘플 경력기술서를 다시 확인해보세요.",
            },
          },
        ];
      });
      setView("chat");
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      setHasFinalizedRevision(true);
      setIsFlowComplete(true);
      setIsLoading(false);
      return;
    }

    if (trimmedMessage === "샘플 경력기술서 다시 보기") {
      setMessages((prevMessages) => {
        const nextMessages = [
          ...prevMessages,
          { type: "user" as const, text: trimmedMessage, displayStyle: options?.displayStyle ?? "bubble" },
        ];

        if (hasShownSampleReview) {
          return nextMessages;
        }

        return [
          ...nextMessages,
          {
            type: "agent" as const,
            text: "수정 중인 샘플 경력기술서를 다시 열어볼 수 있어요.",
            chips: [],
            card: null,
          },
        ];
      });
      setView("chat");
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      setHasShownSampleReview(true);
      setIsLoading(false);
      return;
    }

    const limitGuideText =
      "테스트 흐름상 여기까지의 답변을 바탕으로 수정안을 확정해볼게요. 아래 선택지 중 하나를 골라주세요.";
    const shouldCountRefinementTurn =
      view === "chat" &&
      !isFlowComplete &&
      trimmedMessage !== "수정안 확정하기" &&
      trimmedMessage !== "샘플 경력기술서 다시 보기";
    const nextRefinementTurnCount = shouldCountRefinementTurn
      ? refinementTurnCount + 1
      : refinementTurnCount;
    const hasReachedRefinementLimit =
      shouldCountRefinementTurn && nextRefinementTurnCount >= MAX_REFINEMENT_TURNS;

    if (shouldCountRefinementTurn) {
      setRefinementTurnCount(nextRefinementTurnCount);
    }

    setMessages((prevMessages) => {
      const nextMessages = [
        ...prevMessages,
        { type: "user" as const, text: trimmedMessage, displayStyle: options?.displayStyle ?? "bubble" },
      ];
      const alreadyShowingLimitGuide = prevMessages.some(
        (prevMessage) => prevMessage.type === "agent" && prevMessage.text === limitGuideText
      );

      if ((hasReachedRefinementLimit || isFlowComplete) && !alreadyShowingLimitGuide) {
        return [
          ...nextMessages,
          {
            type: "agent" as const,
            text: limitGuideText,
            chips: ["수정안 확정하기", "샘플 경력기술서 다시 보기"],
            card: null,
          },
        ];
      }

      return nextMessages;
    });
    setView("chat");
    console.log("[DEBUG] view 전환 완료");
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    if (hasReachedRefinementLimit || isFlowComplete) {
      setIsFlowComplete(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const matched = Object.entries(STAGES).find(([, stage]) =>
      stage.triggers.includes(trimmedMessage)
    );

    if (matched) {
      setTimeout(() => {
        const [, stage] = matched;
        setMessages((prev) => [
          ...prev,
          {
            type: "agent",
            text: stage.response,
            chips: stage.chips ?? [],
            card: stage.card ?? null,
          },
        ]);
        setIsLoading(false);
      }, 1200);
      return;
    }

    if (!USE_AI) {
      // STAGES 모드 — 트리거 매칭으로 즉시 응답 (1.2초 딜레이로 자연스러운 "생각 중" 느낌)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: "agent",
            text: "좋아요. 그 부분 한 번 같이 다듬어볼까요?",
            chips: [],
            card: null,
          },
        ]);
        setIsLoading(false);
      }, 1200);
      return;
    }

    (async () => {
      try {
        // 새 messages 상태로 push된 직후 그 messages를 API에 보냄
        const updatedMessages = [...messages, { type: "user", text: trimmedMessage }];
        const aiLimitGuideText =
          "이번 테스트에서 사용할 수 있는 AI 응답 횟수에 도달했어요. 지금까지의 내용을 바탕으로 수정안을 확정해볼게요.";

        if (aiCallCount >= MAX_AI_CALLS_PER_SESSION) {
          setMessages((prev) => {
            const alreadyShowingAiLimitGuide = prev.some(
              (prevMessage) => prevMessage.type === "agent" && prevMessage.text === aiLimitGuideText
            );

            if (alreadyShowingAiLimitGuide) {
              return prev;
            }

            return [
              ...prev,
              {
                type: "agent",
                text: aiLimitGuideText,
                chips: ["수정안 확정하기", "샘플 경력기술서 다시 보기"],
                card: null,
              },
            ];
          });
          setIsFlowComplete(true);
          setIsLoading(false);
          return;
        }

        setAiCallCount((prev) => prev + 1);

        // [판단보조형 Agent payload] 기존 messages는 그대로 유지하고,
        // 상태값/컨텍스트를 함께 보낸다. 없는 값은 빈 문자열을 기본값으로.
        const targetJob =
          ROLE_OPTIONS.find((role) => role.id === selectedRoleId)?.title ?? "";

        const payload = {
          messages: updatedMessages, // 기존 호환 유지
          currentStep,
          prototypeType,
          // 방금 분류한 intent(상태 반영 전이라도 최신 값 사용)
          userIntent: classifiedIntent,
          decisionStatus,
          userMessage: trimmedMessage,
          currentAiDraft,
          userExperienceRaw,
          targetJob,
          draftOptions, // CM1 비교 대상 초안 전체
          selectedDraft, // CM2면 채워져 있고, CM1이면 null
          // [타입별 스타일 프롬프트] 이 페이지(A)의 응답 형식 규칙을 함께 전달.
          typeStylePrompt: B_TYPE_PROMPT,
        };

        console.log("[api/chat payload]", payload);

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`API 응답 에러: ${response.status}`);
        }

        const data = await response.json();

        setMessages((prev) => [
          ...prev,
          {
            type: "agent",
            text: data.text,
            chips: Array.isArray(data.chips) ? data.chips : [],
            card: data.card ?? null,
            sections: Array.isArray(data.sections) ? data.sections : [],
          },
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error("AI 호출 에러:", error);
        setMessages((prev) => [
          ...prev,
          {
            type: "agent",
            text: "죄송해요, 답변을 가져오지 못했어요. 다시 시도해주세요.",
          },
        ]);
        setIsLoading(false);
      }
    })();
  };

  const openBottomSheet = (index: number) => {
    console.log("샘플 경력기술서 클릭됨", index);
    const draft = scenarioDrafts[index] ?? selectedDraft ?? null;
    if (draft) setBottomSheetDraft(draft);
    setIsOpen(true);
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // IME(한글 등) composition 중에는 Enter 무시 — 마지막 글자가 별도로 한 번 더 전송되는 버그 방지
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // [A 타입 CM1 헬퍼들]
  // 라디오 선택 — 임시 후보만 갱신. 확정은 commitCm1Selection에서.
  const handlePickDraftCandidate = (draft: Draft) => {
    setCm1Candidate(draft);
  };

  // 행 또는 chevron 탭 — 기존 바텀시트를 그대로 띄우되, 어떤 초안인지 함께 전달.
  const openBottomSheetWith = (draft: Draft) => {
    setBottomSheetDraft(draft);
    setIsOpen(true);
  };

  const handleDraftSelectFromSheet = (draft: Draft) => {
    setCm1Candidate(draft);
    setBottomSheetDraft(draft);
    setIsOpen(false);
    setView("selected");
  };

  // 확정 버튼 — 라디오로 골라둔 후보를 CM2 selectedDraft로 커밋.
  // sendMessage 흐름(STAGES/AI) 대신, CM2 진입에 맞는 안내 + 수정 카드를 직접 push한다.
  const commitCm1Selection = () => {
    if (!cm1Candidate) return;
    const index = scenarioDrafts.findIndex((d) => d.draftId === cm1Candidate.draftId);
    if (index >= 0) setEditingSampleIndex(index);
    setSelectedDraft(cm1Candidate);
    setCurrentStep("CM2");
    setCurrentAiDraft(cm1Candidate.draftContent);
    setDecisionStatus("selected");
    setRefinementCardOutcome(null);

    setMessages([
      {
        type: "user",
        text: `${cm1Candidate.draftTitle}을(를) 고치고 싶어`,
        displayStyle: "header",
      },
      {
        type: "agent",
        text:
          `선택하신 ${CM02_REVIEW_META[cm1Candidate.draftId]?.introTitle ?? DRAFT_CARD_META[cm1Candidate.draftId]?.title ?? cm1Candidate.draftTitle}을 검토했어요.\n총 2개 항목에 대해 확인이 필요해요.`,
        refinementCard: {
          draftTitle: cm1Candidate.draftTitle,
          originalSentence: cm1Candidate.refinementTarget.originalSentence,
          revisedSentence: cm1Candidate.refinementTarget.revisedSentence,
          changeReason: cm1Candidate.refinementTarget.changeReason,
        },
      },
    ]);
    setView("chat");
  };

  // [CM2 수정 카드 버튼 핸들러들] — 각 버튼은 사용자 메시지로 환산되어 흐름에 들어간다.
  const handleRefinementApply = () => {
    if (refinementCardOutcome) return;

    // 최신 refinementCard를 가진 메시지에서 수정안 데이터를 꺼낸다.
    const latestRc = (() => {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].refinementCard) return messages[i].refinementCard!;
      }
      return null;
    })();
    if (!latestRc) return;

    setRefinementCardOutcome("apply");
    setDecisionStatus("modified");
    setUserIntent("ACCEPT");
    setAppliedRevision({
      originalSentence: latestRc.originalSentence,
      revisedSentence: latestRc.revisedSentence,
      changeReason: latestRc.changeReason,
    });

    // 사용자 메시지를 즉시 push (sendMessage 흐름 우회).
    setMessages((prev) => [
      ...prev,
      { type: "user" as const, text: "수정안 적용하기", displayStyle: "bubble" },
    ]);

    // 1.2초 뒤 다음 검토 항목 안내.
    setIsLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "agent" as const,
          text: "좋아요. 다음 항목을 볼게요.",
          secondReviewCard: true,
        },
      ]);
      setIsLoading(false);
    }, 1200);
  };

  const handleRefinementKeep = () => {
    if (refinementCardOutcome) return;

    // 가장 최근 refinementCard를 찾아 원본 문장을 그대로 결과 카드에 담는다.
    const latestRc = (() => {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].refinementCard) return messages[i].refinementCard!;
      }
      return null;
    })();
    if (!latestRc) return;

    setRefinementCardOutcome("keep");
    setDecisionStatus("rejected");
    setUserIntent("REJECT");
    // 하이라이트 없이 원본 그대로 보여주기 위해 appliedRevision은 null로 유지.
    setAppliedRevision(null);

    setMessages((prev) => [
      ...prev,
      { type: "user" as const, text: "기존 문장 유지하기", displayStyle: "bubble" },
    ]);

    setIsLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "agent" as const,
          text: "좋아요. 다음 항목을 볼게요.",
          secondReviewCard: true,
        },
      ]);
      setIsLoading(false);
    }, 1200);
  };

  const handleFinalize = () => {
    if (isFlowComplete) return;

    setMessages((prev) => [
      ...prev,
      { type: "user" as const, text: "최종 확정", displayStyle: "bubble" },
    ]);

    setIsLoading(true);
    setTimeout(() => {
      setMessages((prev) => {
        // 직전까지의 적용 상태(가장 최근 resultCard 또는 refinementCard)를 그대로 재사용.
        const lastResultCard = (() => {
          for (let i = prev.length - 1; i >= 0; i--) {
            if (prev[i].resultCard) return prev[i].resultCard!;
          }
          return null;
        })();
        const latestRc = (() => {
          for (let i = prev.length - 1; i >= 0; i--) {
            if (prev[i].refinementCard) return prev[i].refinementCard!;
          }
          return null;
        })();

        return [
          ...prev,
          {
            type: "agent" as const,
            text:
              "수고하셨어요. 1차 최종 초안이 완성되었어요. " +
              "아래에서 최종 경력기술서를 확인해보세요.",
            resultCard:
              lastResultCard ?? {
                previous: latestRc?.originalSentence ?? "",
                revised: latestRc?.revisedSentence ?? latestRc?.originalSentence ?? "",
                message: "1차 최종 초안이 완성되었어요.",
              },
          },
        ];
      });
      setIsLoading(false);
      setIsFlowComplete(true);
      setView("complete");
    }, 1200);
  };

  const handleRefinementRetry = () => {
    if (refinementCardOutcome) return;
    setRefinementCardOutcome("retry");
    sendMessage("다시 수정해줘", { displayStyle: "bubble" });
  };

  const handleSecondReviewComplete = () => {
    setMessages((prev) => [
      ...prev,
      { type: "user" as const, text: "A 채택", displayStyle: "bubble" },
    ]);

    setIsLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "agent" as const,
          text:
            "2가지 수정 사항이 모두 반영되었어요.\n" +
            "초안을 더 수정할까요?\n" +
            "최종 마무리 단계로 넘어갈까요?",
          confirmCard: true,
        },
      ]);
      setIsLoading(false);
    }, 800);
  };

  const handleRewriteOptionSelect = (optionIndex: number, optionTitle: string) => {
    if (selectedRewriteOption !== null) {
      return;
    }

    setSelectedRewriteOption(optionIndex);
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: optionTitle,
        displayStyle: "bubble",
      },
    ]);

    setTimeout(() => {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.type === "agent" && lastMessage.resultCard) {
          return prev;
        }

        return [
          ...prev,
          {
            type: "agent",
            text: "말씀해주신 표현으로 변경되었어요. 수정된 샘플 경력기술서를 다시 확인해보세요.",
            resultCard: {
              previous: "12년 연속 마감 지연 0건",
              revised: optionTitle,
              message: "말씀해주신 표현으로 변경되었어요. 수정된 샘플 경력기술서를 다시 확인해보세요.",
            },
          },
        ];
      });
    }, 500);
  };

  const lastUserMessageIndex = (() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].type === "user") {
        return index;
      }
    }
    return -1;
  })();
  // 인라인 "이 초안 선택하기" 버튼이 대체하므로 하단 quick 버튼은 노출하지 않는다.
  const showDraftQuickButtons = false;
  const resultSampleIndex = editingSampleIndex ?? 0;
  const screenBackground =
    view === "start" || view === "complete"
      ? "linear-gradient(184deg, #FAFFFC 0.96%, #F3FBFF 49.34%, #E8F4FF 97.71%)"
      : "#FFFFFF";
  const screenThemeColor = view === "start" || view === "complete" ? "#FAFFFC" : "#FFFFFF";

  useSyncBodyBackground(screenBackground, screenThemeColor);

  return (
    <main className="min-h-screen font-['Pretendard',sans-serif]" style={{ background: screenBackground }}>
      <section
        className="relative isolate mx-auto flex h-[100dvh] max-h-[932px] w-full max-w-[480px] flex-col overflow-hidden"
        style={{ background: screenBackground }}
      >
        {(view === "home" || view === "selected" || view === "chat") && <BackgroundEllipses />}
        <StatusBar />
        <PageTitleBar />

        <div
          ref={scrollContainerRef}
          className={`relative flex-1 ${view === "start" ? "flex flex-col overflow-hidden" : "overflow-y-auto"}`}
        >
          {view === "chat" && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 right-0 top-0 z-10"
              style={{
                height: 24,
                background: "linear-gradient(to bottom, #FFF 0%, #FFF 60%, rgba(255,255,255,0) 100%)",
              }}
            />
          )}
          {view === "start" ? (
            <StartScreen
              onStart={() => {
                setFlowStep("draftReady");
                setView("home");
              }}
            />
          ) : view === "complete" ? (
            <div className="relative min-h-full overflow-hidden bg-[linear-gradient(188.833deg,#FAFFFC_0.958%,#F3FBFF_49.336%,#E8F4FF_97.714%)] text-center">
              <div
                aria-hidden="true"
                className="absolute h-[474px] w-[590px]"
                style={{
                  left: -107,
                  top: 56,
                  background:
                    "radial-gradient(circle at 40% 58%, rgba(0,102,255,0.18) 0%, rgba(58,230,194,0.14) 18%, rgba(255,255,255,0) 46%)",
                  filter: "blur(34px)",
                }}
              />
              <div className="absolute left-0 top-0 flex w-full flex-col items-center justify-center gap-[20px] px-[20px] py-[48px]">
                <AiOrb size={40} />
                <div className="flex w-full flex-col items-center gap-[8px]">
                  <h2 className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[22px] font-semibold leading-[30px] tracking-[-0.427px] text-black">
                    경력기술서 초안 작성을 완료했어요
                  </h2>
                  <p className="w-full text-[16px] font-normal leading-[26px] tracking-[0.091px] text-[rgba(46,47,51,0.88)]">
                    다음 단계에서 경력기술서를 최종 마무리할게요
                  </p>
                </div>
              </div>
              <div className="absolute left-0 top-[220px] h-[470px] w-full overflow-hidden bg-[rgba(255,0,0,0.8)]">
                <div className="absolute left-[54.4px] top-[30.24px] flex h-[364.036px] w-[267.664px] items-center justify-center">
                  <div className="flex h-[351.454px] w-[249.612px] rotate-[-3deg] items-center justify-center overflow-hidden rounded-[19.969px] bg-black shadow-[0px_4.992px_29.953px_rgba(116,191,250,0.05)] backdrop-blur-[2px]">
                    <div className="rotate-[3deg] text-center text-[19.969px] font-semibold leading-[28px] tracking-[-0.24px] text-white/20">
                      <p>{`'성과 중심 초안'`}</p>
                      <p>관련</p>
                      <p>그래픽 디자인</p>
                      <p>(완성 ver.)</p>
                    </div>
                  </div>
                </div>
                <p className="absolute left-1/2 top-[183px] -translate-x-1/2 whitespace-nowrap text-center text-[56px] font-bold leading-[72px] tracking-[-1.786px] text-white">
                  TBD
                </p>
              </div>
              <div className="absolute bottom-0 left-0 flex w-full flex-col px-[20px] pb-[34px] pt-[20px]">
                <button
                  type="button"
                  onClick={handleContinueToNextStepB}
                  className="flex w-full items-center justify-center rounded-[12px] bg-[#0066FF] px-[28px] py-[14px] text-[17px] font-semibold leading-[24px] text-white transition-all duration-150 ease-out hover:bg-[#005BE6] active:scale-[0.98] active:bg-[#004FCC]"
                >
                  다음 타입 시작하기
                </button>
              </div>
            </div>
          ) : view === "selected" ? (
            <div className="relative min-h-full overflow-hidden bg-[linear-gradient(188.833deg,#FAFFFC_0.958%,#F3FBFF_49.336%,#E8F4FF_97.714%)]">
              <div className="absolute left-0 top-[48px] flex w-full flex-col items-center justify-center gap-[20px] px-[20px] text-center">
                <AiOrb size={40} />
                <div className="flex w-full flex-col items-center gap-[8px]">
                  <h2 className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[22px] font-semibold leading-[30px] tracking-[-0.427px] text-black">
                    {`${Math.max(1, scenarioDrafts.findIndex((d) => d.draftId === cm1Candidate?.draftId) + 1)}번 초안을 선택했어요`}
                  </h2>
                  <p className="w-full text-[16px] font-normal leading-[26px] tracking-[0.091px] text-[rgba(46,47,51,0.88)]">
                    내용을 AI와 함께 더 다듬을 수 있어요
                  </p>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="absolute h-[474px] w-[590px]"
                style={{
                  left: -107,
                  top: 44,
                  background:
                    "radial-gradient(circle at 40% 58%, rgba(0,102,255,0.18) 0%, rgba(58,230,194,0.14) 18%, rgba(255,255,255,0) 46%)",
                  filter: "blur(34px)",
                }}
              />

              <div className="absolute left-0 top-[272px] flex h-[378px] w-full items-start justify-center">
                <div className="h-[330px] w-[211px] overflow-hidden rounded-[16.5px] border-[3.3px] border-[#0066FF] bg-[rgba(175,207,255,0.12)] shadow-[0_12px_62px_rgba(23,23,23,0.16)] backdrop-blur-[41px]">
                  <div className="relative flex h-[277px] flex-col justify-between overflow-hidden px-[23px] py-[40px]">
                    <div
                      aria-hidden="true"
                      className="absolute inset-[-30px] opacity-80"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(232,246,255,0.78) 42%, rgba(211,239,255,0.72) 100%)",
                      }}
                    />
                    <div className="relative z-10 flex flex-col gap-[13px]">
                      <div className="flex h-[23px] w-[23px] items-center justify-center rounded-full bg-[#171719] text-[14px] font-semibold leading-[18px] tracking-[0.349px] text-white">
                        1
                      </div>
                      <p className="whitespace-pre-line text-[20px] font-bold leading-[26px] tracking-[-0.455px] text-[#171719]">
                        {"결과가 강조되는\n성과 중심 초안"}
                      </p>
                    </div>
                    <div className="relative z-10 ml-auto mr-[2px] h-[74px] w-[92px]">
                      <div className="absolute bottom-[2px] left-[2px] h-[34px] w-[70px] rounded-[50%] bg-[#0066FF] shadow-[0_12px_18px_rgba(0,102,255,0.32)]" />
                      <div className="absolute bottom-[18px] left-[16px] h-[38px] w-[70px] rotate-[-8deg] rounded-[50%] bg-[linear-gradient(135deg,#F8FCFF_0%,#DCEEFF_100%)] shadow-[0_10px_18px_rgba(23,23,23,0.14)]" />
                      <div className="absolute bottom-[31px] left-[39px] h-[10px] w-[24px] rotate-[16deg] rounded-full border-[3px] border-[#0066FF]" />
                      <div className="absolute bottom-[31px] left-[27px] h-[10px] w-[24px] rotate-[-16deg] rounded-full border-[3px] border-[#0066FF]" />
                    </div>
                  </div>
                  <div className="flex h-[53px] items-center justify-end bg-[linear-gradient(125.139deg,#0066FF_0%,#3AE6C2_103.29%)] px-[24px] py-[16.5px]">
                    <span className="text-[13px] font-semibold leading-[22px] tracking-[0.075px] text-white">
                      V.01
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 flex w-full flex-col">
                <div className="flex w-full flex-col gap-[8px] px-[20px] py-[20px]">
                  <button
                    type="button"
                    onClick={commitCm1Selection}
                    className="flex w-full items-center justify-center rounded-[12px] bg-[#0066FF] px-[28px] py-[14px] text-[17px] font-semibold leading-[24px] text-white transition-all duration-150 ease-out hover:bg-[#005BE6] hover:shadow-[0_8px_18px_rgba(0,102,255,0.22)] active:scale-[0.98] active:bg-[#004FCC] active:shadow-[0_3px_8px_rgba(0,102,255,0.18)]"
                  >
                    초안 내용 다듬기
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalize}
                    className="flex w-full items-center justify-center rounded-[12px] border border-[rgba(112,115,124,0.16)] bg-white px-[28px] py-[12px] text-[16px] font-semibold leading-[24px] tracking-[0.091px] text-[#0066FF] transition-all duration-150 ease-out hover:bg-[#F5F9FF] hover:shadow-[0_6px_14px_rgba(0,102,255,0.12)] active:scale-[0.98] active:bg-[#EAF2FE] active:shadow-[0_2px_6px_rgba(0,102,255,0.1)]"
                  >
                    최종 마무리 단계로 넘어가기
                  </button>
                </div>
                <div className="h-[34px] w-full" />
              </div>
            </div>
          ) : view === "home" ? (
            flowStep === "loadingDraft" ? (
              <div
                className="relative flex min-h-full flex-col items-center justify-center overflow-hidden px-[20px] pb-[140px] text-center"
                style={{
                  animation: "loadingDraftFadeIn 800ms ease-out both",
                  background:
                    "radial-gradient(circle at 50% 42%, rgba(101,65,242,0.07) 0%, rgba(255,255,255,0) 42%), #FFFFFF",
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute rounded-full"
                  style={{
                    left: -40,
                    bottom: 180,
                    width: 220,
                    height: 220,
                    background: "rgba(255,178,188,0.22)",
                    filter: "blur(80px)",
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute rounded-full"
                  style={{
                    right: -60,
                    top: 140,
                    width: 240,
                    height: 240,
                    background: "rgba(145,221,255,0.2)",
                    filter: "blur(90px)",
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute rounded-full"
                  style={{
                    left: 98,
                    bottom: 250,
                    width: 180,
                    height: 180,
                    background: "rgba(101,65,242,0.14)",
                    filter: "blur(80px)",
                  }}
                />
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    aria-hidden="true"
                    className="absolute rounded-full"
                    style={{
                      top: -54,
                      width: 190,
                      height: 190,
                      background:
                        "radial-gradient(circle, rgba(0,102,255,0.2) 0%, rgba(101,65,242,0.14) 36%, rgba(255,116,188,0.1) 58%, rgba(255,255,255,0) 74%)",
                      filter: "blur(32px)",
                      opacity: 0.85,
                    }}
                  />
                  <div
                    style={{
                      animation: "loadingDraftOrbIn 850ms cubic-bezier(0.16, 1, 0.3, 1) both",
                    }}
                  >
                    <OrbCanvas size={220} />
                  </div>
                  <p className="mt-[22px] whitespace-pre-line text-[18px] font-semibold leading-[26px] text-black">
                    {"김효원님의 경험에 딱 맞는\n경력기술서를 정리해드릴게요"}
                  </p>
                  <p className="mt-[8px] text-[13px] font-normal leading-[18px] text-[rgba(55,56,60,0.61)]">
                    앞에서 말씀해주신 경험들을 기반으로 초안을 만듭니다.
                  </p>
                </div>
              </div>
            ) : flowStep === "draftReady" ? (
              <div className="relative min-h-full">
                <div className="relative z-10 min-h-full w-full px-5 pb-7">
                  <section className="relative z-10 flex flex-col items-center gap-5 px-0 py-12">
                    <AiOrb size={40} />
                    <div className="flex flex-col items-center gap-2">
                      <h2 className="text-heading-1 text-center font-bold text-label-strong">
                        3가지 초안을 완성했어요
                      </h2>
                      <p className="text-body-1-reading text-center text-label-neutral">
                        내 경험에 더 가까운 초안을 선택해주세요<br />
                        부족한 부분은 AI와 함께 수정할 수 있어요
                      </p>
                    </div>
                  </section>

                  <section className="flex flex-col gap-2">
                  {scenarioDrafts.map((draft, idx) => {
                    // 카드 본문은 BottomSheet의 "초안 작성 기준 → 적용된 점"(whyRecommended) 첫 문장을 자동 인용한다.
                    const firstSentenceMatch = draft.whyRecommended.match(/^[^.!?]+[.!?]/);
                    const firstSentence = firstSentenceMatch ? firstSentenceMatch[0] : draft.whyRecommended;
                    // chips는 초안 인덱스(=direction)에 따라 고정. 어떤 직무든 동일 매핑.
                    // 0=성과(achievement), 1=직무(fit), 2=경험(narrative)
                    const chipsByIndex: string[][] = [
                      ["수치", "임팩트"],
                      ["역량", "직무"],
                      ["과정", "성장"],
                    ];
                    const baseMeta = DRAFT_CARD_META[draft.draftId];
                    const draftCardMeta = {
                      title: baseMeta?.title ?? draft.draftTitle,
                      description: firstSentence,
                      chips: chipsByIndex[idx] ?? ["수치", "임팩트"],
                    };
                    return (
                      <button
                        key={draft.draftId}
                        type="button"
                        onClick={() => openBottomSheetWith(draft)}
                        className="flex w-full flex-col gap-3 rounded-2xl border border-[#E8EEF5] bg-white p-5 text-left transition-colors hover:bg-[#FAFBFC]"
                      >
                        <h3 className="text-body-1 font-bold text-label-normal">
                          {draftCardMeta.title}
                        </h3>
                        <p className="text-label-1-reading text-label-neutral">
                          {draftCardMeta.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {draftCardMeta.chips.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-[rgba(0,94,235,0.08)] px-1.5 py-1 text-caption-1 font-medium text-[#005EEB]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </section>
              </div>
              </div>
            ) : (
              <div className="flex min-h-full flex-col px-[20px] pt-[36px]">
                <section>
                  <div className="flex items-center gap-[8px]">
                    <AiOrb size={20} />
                    <h2 className="text-[16px] font-semibold leading-[24px] tracking-[0.57px] text-black">
                      에이전트 답변
                    </h2>
                  </div>
                  <div className="mt-[12px] h-px w-full bg-[#70737C29]" />
                  <p className="mt-[13px] text-[16px] font-normal leading-[26px] tracking-[0.57px] text-[#171719]">
                    김효원님의 경험을 분석해보니, 두 가지 직무 방향으로 정리할 수 있어요. 어느 쪽이 더 가까우세요?
                  </p>
                </section>

                <section
                  className="mt-[16px] flex flex-col gap-[10px] rounded-[16px] border border-[#EAF2FE] p-[16px]"
                  style={{ background: "linear-gradient(0deg, #F7F9FF 0%, #FCFDFE 100%)" }}
                >
                  {ROLE_OPTIONS.map((roleOption) => {
                    const isSelected = selectedRoleId === roleOption.id;

                    return (
                      <button
                        className="flex w-full flex-col items-start gap-[10px] rounded-[12px] border bg-white p-[16px] text-left transition"
                        key={roleOption.id}
                        onClick={() => {
                          setSelectedRoleId(roleOption.id);
                          setFlowStep("loadingDraft");
                        }}
                        style={{
                          borderColor: isSelected ? "#0066FF" : "#EAF2FE",
                          boxShadow: isSelected ? "0 8px 20px rgba(0,102,255,0.08)" : "none",
                        }}
                        type="button"
                      >
                        <div className="flex flex-col gap-[4px]">
                          <span className="text-[12px] font-semibold leading-[16px] text-[#0066FF]">
                            {roleOption.match}
                          </span>
                          <span className="text-[15px] font-semibold leading-[22px] text-[#171719]">
                            {roleOption.title}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-[6px]">
                          {roleOption.tags.map((tag) => (
                            <span
                              className="inline-flex rounded-[6px] bg-[rgba(55,56,60,0.06)] px-[7px] py-[4px] text-[12px] font-medium leading-none text-[rgba(55,56,60,0.61)]"
                              key={tag}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </section>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-5 p-5">
              {messages.length === 0 && (
                <p className="text-center text-sm text-gray-400">
                  [DEBUG] 메시지가 없습니다. view: chat
                </p>
              )}
              {(() => {
                console.log("[DEBUG] messages 현재 상태:", messages, "view:", view);
                return null;
              })()}
              {messages.map((chatMessage, index) =>
                chatMessage.type === "user" ? (
                  chatMessage.displayStyle === "header" ? (
                    <div
                      key={`${chatMessage.type}-${index}`}
                      ref={index === lastUserMessageIndex ? lastUserMessageRef : null}
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        lineHeight: "26px",
                        letterSpacing: "-0.004px",
                        color: "#000",
                      }}
                    >
                      {chatMessage.text}
                    </div>
                  ) : (
                    <div
                      className="flex justify-end"
                      key={`${chatMessage.type}-${index}`}
                      ref={index === lastUserMessageIndex ? lastUserMessageRef : null}
                    >
                      <div
                        className="max-w-[300px] rounded-2xl px-4 py-3 text-black"
                        style={{
                          background: "#F4F4F5",
                          fontSize: 16,
                          fontWeight: 400,
                          lineHeight: "26px",
                          letterSpacing: "0.091px",
                        }}
                      >
                        {chatMessage.text}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col" key={`${chatMessage.type}-${index}`}>
                    <div className="flex items-center gap-2">
                      <AiOrb size={20} />
                      <span style={{ fontSize: 15, fontWeight: 600 }}>
                        에이전트 답변
                      </span>
                    </div>
                    <div className="mt-3 h-px" style={{ background: "#E5E5E5" }} />
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 16,
                        fontWeight: 400,
                        lineHeight: "24px",
                        color: "#000",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {streamingMessageIndex === index
                        ? chatMessage.text.slice(0, streamedCharCount)
                        : chatMessage.text}
                    </div>
                    {chatMessage.sections && chatMessage.sections.length > 0 &&
                      (streamingMessageIndex !== index ||
                        streamedCharCount >= (chatMessage.text?.length ?? 0)) && (
                      <div className="mt-4 flex flex-col gap-[16px]">
                        {chatMessage.sections
                          .slice(
                            0,
                            streamingMessageIndex === index
                              ? Math.min(streamedSectionCount, chatMessage.sections.length)
                              : chatMessage.sections.length
                          )
                          .map((section, sIdx) => {
                          const variant = getSectionVariant(section.label);
                          return (
                            <div key={`section-${sIdx}`}>
                              <div
                                style={{
                                  fontSize: 12,
                                  lineHeight: "18px",
                                  color: variant === "underline"
                                    ? "#0066FF"
                                    : "rgba(55,56,60,0.61)",
                                }}
                              >
                                {section.label}
                              </div>
                              {variant === "strikethrough" ? (
                                <p
                                  style={{
                                    marginTop: 4,
                                    fontSize: 15,
                                    lineHeight: "22px",
                                    color: "rgba(55,56,60,0.61)",
                                    whiteSpace: "pre-line",
                                  }}
                                >
                                  <span
                                    style={{
                                      background: "rgba(55,56,60,0.12)",
                                      padding: "1px 4px",
                                      borderRadius: 2,
                                      boxDecorationBreak: "clone",
                                      WebkitBoxDecorationBreak: "clone",
                                    }}
                                  >
                                    <TypewriterText text={section.content} />
                                  </span>
                                </p>
                              ) : variant === "underline" ? (
                                <p
                                  style={{
                                    marginTop: 4,
                                    fontSize: 15,
                                    lineHeight: "22px",
                                    color: "#171719",
                                    whiteSpace: "pre-line",
                                  }}
                                >
                                  <span
                                    style={{
                                      background: "rgba(0,102,255,0.10)",
                                      padding: "1px 4px",
                                      borderRadius: 2,
                                      boxDecorationBreak: "clone",
                                      WebkitBoxDecorationBreak: "clone",
                                    }}
                                  >
                                    <TypewriterText text={section.content} />
                                  </span>
                                </p>
                              ) : (
                                <p
                                  style={{
                                    marginTop: 4,
                                    fontSize: 15,
                                    fontWeight: 400,
                                    lineHeight: "22px",
                                    color: "#171719",
                                    whiteSpace: "pre-line",
                                  }}
                                >
                                  <TypewriterText text={section.content} />
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {chatMessage.refinementCard && (
                      <div className="mt-[28px]">
                        <Cm02ReviewCard
                          draftId={selectedDraft?.draftId}
                          onApply={handleRefinementApply}
                          onKeep={handleRefinementKeep}
                        />
                      </div>
                    )}
                    {chatMessage.secondReviewCard && (
                      <div className="mt-[20px]">
                        <Cm02SecondReviewCard onComplete={handleSecondReviewComplete} />
                      </div>
                    )}
                    {chatMessage.confirmCard && (
                      <div className="mt-[20px]">
                        <Cm02ConfirmCard
                          onReviewMore={() => sendMessage("추가 검토하기", { displayStyle: "bubble" })}
                          onFinalize={handleFinalize}
                        />
                      </div>
                    )}
                    {!isLoading && (() => {
                        const card = chatMessage.card
                          ?? (chatMessage.stageId ? STAGES[chatMessage.stageId]?.card : undefined);
                        if (!card) return null;
                        return (
                          <div
                            className="mt-3 w-full"
                            style={{
                              padding: 20,
                              borderRadius: 16,
                              border: "1px solid #EAF2FE",
                              background: "linear-gradient(0deg, #F7F9FF 0%, #FCFDFE 100%)",
                            }}
                          >
                            <div
                              style={{
                                fontFamily: "Pretendard",
                                fontSize: 15,
                                fontWeight: 600,
                                lineHeight: "22px",
                                letterSpacing: "0.144px",
                                color: "#000",
                              }}
                            >
                              {card.title}
                            </div>
                            <div
                              style={{
                                marginTop: 4,
                                fontFamily: "Pretendard",
                                fontSize: 12,
                                fontWeight: 400,
                                lineHeight: "16px",
                                letterSpacing: "0.302px",
                                color: "#999",
                              }}
                            >
                              {card.subtitle}
                            </div>
                            <div
                              className="mb-3 mt-3"
                              style={{
                                height: 1,
                                background: "#EAF2FE",
                              }}
                            />
                            <div className="flex flex-col gap-2">
                              {card.options.map((option, optionIndex) => {
                                const isSelected = selectedRewriteOption === optionIndex;

                                return (
                                  <button
                                    className="flex w-full text-left"
                                    disabled={selectedRewriteOption !== null}
                                    key={optionIndex}
                                    onClick={() => handleRewriteOptionSelect(optionIndex, option.title)}
                                    style={{
                                      padding: 20,
                                      borderRadius: 10,
                                      border: isSelected ? "1px solid #0066FF" : "1px solid #EAF2FE",
                                      background: "#FFF",
                                      boxShadow: isSelected ? "0 8px 20px rgba(0, 102, 255, 0.08)" : "none",
                                      gap: 12,
                                      alignItems: "flex-start",
                                      cursor: selectedRewriteOption !== null ? "default" : "pointer",
                                    }}
                                    type="button"
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        width: 16,
                                        height: 20,
                                        fontSize: 16,
                                        lineHeight: "20px",
                                        flexShrink: 0,
                                        textAlign: "center",
                                      }}
                                    >
                                      {option.emoji}
                                    </div>
                                    <div className="flex flex-col" style={{ gap: 4, flex: 1 }}>
                                      <div
                                        style={{
                                          fontFamily: "Pretendard",
                                          fontSize: 14,
                                          fontWeight: 600,
                                          lineHeight: "20px",
                                          letterSpacing: "0.203px",
                                          color: "#000",
                                        }}
                                      >
                                        {option.title}
                                      </div>
                                      <div
                                        style={{
                                          fontFamily: "Pretendard",
                                          fontSize: 12,
                                          fontWeight: 400,
                                          lineHeight: "16px",
                                          letterSpacing: "0.302px",
                                          color: "#999",
                                        }}
                                      >
                                        {option.description}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    {false && chatMessage.refinementCard && (() => {
                      const rc = chatMessage.refinementCard!;
                      const decided = refinementCardOutcome !== null;
                      const SPEED = 30;
                      const isMessageDone = messageDone[index] === true;
                      const cardStep = refinementCardStep[index] ?? 0;
                      const isPopoverOpen = openPopoverIndex === index;
                      const draftMeta =
                        DRAFT_VISUAL_META[selectedDraft?.draftId ?? ""] ?? {
                          emoji: "\u2728",
                          badgeLabel: rc.draftTitle,
                          badgeColor: "#171719",
                          badgeBg: "rgba(55,56,60,0.06)",
                          tags: [] as string[],
                        };
                      const buttonBase: React.CSSProperties = {
                        height: 44,
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 500,
                        lineHeight: "22px",
                        fontFamily: "Pretendard",
                        textAlign: "center",
                      };
                      return (
                        <div className="mt-3 w-full flex flex-col gap-[14px]">
                          {/* 헤더: 선택한 초안 컬러 배지 (cardStep >= 1) */}
                          {cardStep >= 1 && (
                            <div className="flex flex-wrap items-center gap-[8px]">
                              <span
                                className="inline-flex items-center gap-[6px] rounded-[999px] px-[10px] py-[5px] text-[12px] font-semibold leading-[16px]"
                                style={{ background: draftMeta.badgeBg, color: draftMeta.badgeColor }}
                              >
                                <span aria-hidden="true">{draftMeta.emoji}</span>
                                <span>{draftMeta.badgeLabel}</span>
                              </span>
                              <span className="text-[12px] font-medium leading-[16px] text-[rgba(55,56,60,0.61)]">
                                선택한 초안
                              </span>
                            </div>
                          )}

                          {/* 원문 카드 + 하이라이트 chip (cardStep >= 2) */}
                          {cardStep >= 2 && (
                            <div
                              className="rounded-[14px] border border-[#EAEAEA] bg-white p-[14px]"
                              style={{ position: "relative" }}
                            >
                              <div className="text-[12px] font-medium leading-[18px] text-[rgba(55,56,60,0.61)]">
                                원문
                              </div>
                              <p className="mt-[6px] text-[14px] leading-[22px] text-[#171719]">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenPopoverIndex(isPopoverOpen ? null : index)
                                  }
                                  className="inline text-left align-baseline"
                                >
                                  <span
                                    style={{
                                      background: "rgba(255,204,77,0.45)",
                                      padding: "1px 4px",
                                      borderRadius: 4,
                                      boxDecorationBreak: "clone",
                                      WebkitBoxDecorationBreak: "clone",
                                    }}
                                  >
                                    <TypewriterText text={rc.originalSentence} speed={SPEED} />
                                  </span>
                                  <span
                                    className="ml-[6px] inline-flex items-center gap-[3px] rounded-[6px] px-[6px] py-[2px] text-[11px] font-semibold align-middle"
                                    style={{ background: "#0066FF", color: "#FFFFFF" }}
                                  >
                                    수정 제안
                                  </span>
                                </button>
                              </p>

                              {!isPopoverOpen && cardStep >= 2 && (
                                <p className="mt-[8px] text-[12px] font-medium leading-[18px]" style={{ color: "#0066FF" }}>
                                  \u2191 노란 부분을 누르면 수정안을 볼 수 있어요.
                                </p>
                              )}

                              {/* 인라인 팝오버 — 원문 카드 아래에 absolute로 띄움 */}
                              {isPopoverOpen && (
                                <div
                                  className="rounded-[14px] border bg-white p-[14px]"
                                  style={{
                                    position: "absolute",
                                    left: 0,
                                    right: 0,
                                    top: "calc(100% + 8px)",
                                    zIndex: 50,
                                    boxShadow: "0 12px 28px rgba(0,102,255,0.18)",
                                    borderColor: "#EAF2FE",
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[12px] font-semibold leading-[18px]" style={{ color: "#0066FF" }}>
                                      AI 수정안
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setOpenPopoverIndex(null)}
                                      aria-label="팝오버 닫기"
                                      className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] hover:bg-[#F4F4F5]"
                                    >
                                      <X className="h-[14px] w-[14px] text-[#70737C]" strokeWidth={1.8} aria-hidden="true" />
                                    </button>
                                  </div>
                                  <p className="mt-[6px] text-[14px] font-medium leading-[22px] text-[#171719]">
                                    <span
                                      style={{
                                        background: "rgba(0,102,255,0.12)",
                                        padding: "1px 4px",
                                        borderRadius: 4,
                                        boxDecorationBreak: "clone",
                                        WebkitBoxDecorationBreak: "clone",
                                      }}
                                    >
                                      {rc.revisedSentence}
                                    </span>
                                  </p>
                                  <div className="mt-[10px] rounded-[10px] bg-[#F9FAFB] p-[10px]">
                                    <div className="text-[12px] font-semibold leading-[18px] text-[rgba(55,56,60,0.78)]">
                                      변경 이유
                                    </div>
                                    <p className="mt-[2px] text-[13px] leading-[20px] text-[#171719]">
                                      {rc.changeReason}
                                    </p>
                                  </div>

                                  {isMessageDone ? (
                                    <div className="mt-[12px] flex flex-col gap-[8px]">
                                      <button
                                        type="button"
                                        disabled={decided}
                                        onClick={handleRefinementApply}
                                        className="transition-all duration-150 ease-out hover:-translate-y-[1px] hover:bg-[#F9FAFB] hover:shadow-[0_6px_14px_rgba(23,23,23,0.08)] active:translate-y-0 active:scale-[0.98] active:bg-[#F4F4F5] active:shadow-[0_2px_6px_rgba(23,23,23,0.08)] disabled:hover:translate-y-0 disabled:hover:bg-white disabled:hover:shadow-none disabled:active:scale-100"
                                        style={{
                                          ...buttonBase,
                                          background: refinementCardOutcome === "apply" ? "#171719" : "#FFFFFF",
                                          color:
                                            refinementCardOutcome === "apply"
                                              ? "#FFFFFF"
                                              : decided
                                              ? "rgba(55,56,60,0.4)"
                                              : "#171719",
                                          border:
                                            "1px solid " +
                                            (refinementCardOutcome === "apply" ? "#171719" : "#E5E5E5"),
                                          cursor: decided ? "default" : "pointer",
                                        }}
                                      >
                                        수정안 적용하기
                                      </button>
                                      <button
                                        type="button"
                                        disabled={decided}
                                        onClick={handleRefinementKeep}
                                        className="transition-all duration-150 ease-out hover:-translate-y-[1px] hover:bg-[#F9FAFB] hover:shadow-[0_6px_14px_rgba(23,23,23,0.08)] active:translate-y-0 active:scale-[0.98] active:bg-[#F4F4F5] active:shadow-[0_2px_6px_rgba(23,23,23,0.08)] disabled:hover:translate-y-0 disabled:hover:bg-white disabled:hover:shadow-none disabled:active:scale-100"
                                        style={{
                                          ...buttonBase,
                                          background: refinementCardOutcome === "keep" ? "#171719" : "#FFFFFF",
                                          color:
                                            refinementCardOutcome === "keep"
                                              ? "#FFFFFF"
                                              : decided
                                              ? "rgba(55,56,60,0.4)"
                                              : "#171719",
                                          border:
                                            "1px solid " +
                                            (refinementCardOutcome === "keep" ? "#171719" : "#E5E5E5"),
                                          cursor: decided ? "default" : "pointer",
                                        }}
                                      >
                                        기존 문장 유지하기
                                      </button>
                                      <button
                                        type="button"
                                        disabled={decided}
                                        onClick={handleRefinementRetry}
                                        className="transition-all duration-150 ease-out hover:-translate-y-[1px] hover:bg-[#F9FAFB] hover:shadow-[0_6px_14px_rgba(23,23,23,0.08)] active:translate-y-0 active:scale-[0.98] active:bg-[#F4F4F5] active:shadow-[0_2px_6px_rgba(23,23,23,0.08)] disabled:hover:translate-y-0 disabled:hover:bg-white disabled:hover:shadow-none disabled:active:scale-100"
                                        style={{
                                          ...buttonBase,
                                          background: refinementCardOutcome === "retry" ? "#171719" : "#FFFFFF",
                                          color:
                                            refinementCardOutcome === "retry"
                                              ? "#FFFFFF"
                                              : decided
                                              ? "rgba(55,56,60,0.4)"
                                              : "#171719",
                                          border:
                                            "1px solid " +
                                            (refinementCardOutcome === "retry" ? "#171719" : "#E5E5E5"),
                                          cursor: decided ? "default" : "pointer",
                                        }}
                                      >
                                        다시 수정하기
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="mt-[12px] text-[12px] leading-[18px] text-[rgba(55,56,60,0.61)]">
                                      잠시만요 \u00B7 분석 중...
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    {/* [A 타입 디자인 통일] resultCard 박스(기존 표현/바뀐 표현)는 제거.
                        결과 비교는 BottomSheet에서 노란 하이라이트 + 파란 변경 이유로 일원화. */}
                    {chatMessage.resultCard && (
                      <div className="mt-4">
                        <ResumeRow
                          index={resultSampleIndex}
                          label={selectedDraft?.draftTitle ?? `샘플 경력기술서 0${resultSampleIndex + 1}`}
                          onClick={openBottomSheet}
                        />
                      </div>
                    )}
                    {index === messages.length - 1 &&
                      !isLoading &&
                      messageDone[index] === true &&
                      (() => {
                        // AI가 보낸 chips 우선, 없으면 STAGES fallback
                        const chips = (chatMessage.chips && chatMessage.chips.length > 0)
                          ? chatMessage.chips
                          : (chatMessage.stageId && STAGES[chatMessage.stageId]?.chips) || [];
                        if (chips.length === 0) return null;
                        return (
                          <div className="mt-5 flex flex-col items-start gap-2">
                            {chips.map((chipLabel, chipIndex) => (
                              <button
                                className="inline-flex cursor-pointer items-center transition-all duration-150 ease-out hover:-translate-y-[1px] hover:bg-[#F9F9F9] hover:shadow-[0_5px_12px_rgba(23,23,23,0.07)] active:translate-y-0 active:scale-[0.97] active:bg-[#F4F4F5] active:shadow-[0_2px_5px_rgba(23,23,23,0.06)]"
                                key={chipIndex}
                                onClick={() => {
                                  if (chipLabel === "수정안 적용하기") return handleRefinementApply();
                                  if (chipLabel === "기존 문장 유지하기") return handleRefinementKeep();
                                  if (chipLabel === "최종 확정") return handleFinalize();
                                  sendMessage(chipLabel, { displayStyle: "bubble" });
                                }}
                                style={{
                                  padding: "8px 10px",
                                  borderRadius: 10,
                                  border: "1px solid #E5E5E5",
                                  background: "#FFF",
                                  fontSize: 14,
                                  fontWeight: 500,
                                  lineHeight: "22px",
                                  letterSpacing: "0.203px",
                                  color: "#000",
                                  fontFamily: "Pretendard",
                                }}
                                type="button"
                              >
                                {chipLabel}
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                  </div>
                ),
              )}
              {isLoading && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <AiOrb size={20} />
                    <span style={{ fontSize: 15, fontWeight: 600 }}>에이전트 답변</span>
                  </div>
                  <div className="h-px" style={{ background: "#E5E5E5" }} />
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <defs>
                        <linearGradient id="loadingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#00ADFF" />
                          <stop offset="1" stopColor="#0066FF" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="10"
                        cy="10"
                        r="8.25"
                        stroke="url(#loadingGradient)"
                        strokeWidth="1.5"
                        fill="none"
                        strokeDasharray="38"
                        strokeDashoffset="19"
                      />
                    </svg>
                    <span
                      style={{
                        fontFamily: "Pretendard",
                        fontSize: 16,
                        fontWeight: 400,
                        lineHeight: "26px",
                        letterSpacing: "0.091px",
                        background: "linear-gradient(180deg, #00ADFF 0%, #0066FF 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        color: "transparent",
                      }}
                    >
                      에이전트가 답변을 준비하고 있어요.
                    </span>
                  </div>
                </div>
              )}
              <div aria-hidden="true" className="h-[12px] shrink-0" />
            </div>
          )}
        </div>

        {/* [하단 영역]
            - CM1(초안 선택 화면)에서는 채팅창 숨기고 '이 초안 선택하기' 버튼만 노출
            - 그 외(CM2 챗, selectRole 등)에서는 기존 채팅 입력창을 그대로 유지 */}
        {false ? (
          <div className="flex flex-shrink-0 flex-col px-[20px] pb-[16px]">
            <button
              type="button"
              onClick={commitCm1Selection}
              disabled={!cm1Candidate}
              className="h-[48px] w-full rounded-[10px] text-[15px] font-medium leading-[22px]"
              style={{
                background: cm1Candidate ? "#171719" : "#F4F4F5",
                color: cm1Candidate ? "#FFFFFF" : "rgba(55,56,60,0.4)",
                cursor: cm1Candidate ? "pointer" : "default",
              }}
            >
              이 초안 선택하기
            </button>
          </div>
        ) : view !== "start" && view !== "home" && view !== "selected" && flowStep !== "loadingDraft" && (
          <div className="flex flex-shrink-0 flex-col px-[20px] pb-[12px]">
            {showDraftQuickButtons && (
              <div className="mb-[12px] flex flex-col items-end gap-[8px]">
                <button
                  className="h-[38px] rounded-[10px] border border-[#70737C29] bg-white px-[10px] text-[14px] font-medium leading-[22px] tracking-[1.45px] text-black"
                  onClick={() => {
                    setEditingSampleIndex(0);
                    sendMessage("샘플 경력기술서 1을 고치고 싶어", { displayStyle: "header" });
                  }}
                  type="button"
                >
                  샘플 경력기술서 1을 고치고 싶어
                </button>
                <button
                  className="h-[38px] rounded-[10px] border border-[#70737C29] bg-white px-[10px] text-[14px] font-medium leading-[22px] tracking-[1.45px] text-black"
                  onClick={() => {
                    setEditingSampleIndex(1);
                    sendMessage("샘플 경력기술서 2를 고치고 싶어", { displayStyle: "header" });
                  }}
                  type="button"
                >
                  샘플 경력기술서 2를 고치고 싶어
                </button>
              </div>
            )}
            <div className="relative max-h-[140px] rounded-[12px] border border-[#70737C29] bg-white/85 px-[15px] py-[13px] shadow-[0_1px_2px_-1px_rgba(23,23,23,0.1)] backdrop-blur-[32px]">
              <textarea
                autoComplete="off"
                className="placeholder:text-[#37383C47]"
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력해 주세요."
                ref={textareaRef}
                rows={1}
                style={{
                  width: "100%",
                  minHeight: 24,
                  maxHeight: 120,
                  resize: "none",
                  overflow: "auto",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 16,
                  fontWeight: 400,
                  lineHeight: "24px",
                  color: "#171719",
                  fontFamily: "Pretendard",
                  paddingRight: 44,
                }}
                value={message}
              />
              <button
                className="absolute right-[12px] top-1/2 flex h-[32px] w-[32px] -translate-y-1/2 items-center justify-center rounded-full bg-[#0066FF] shadow-[0_6px_14px_rgba(0,102,255,0.24)] transition-all duration-150 ease-out hover:bg-[#005BE6] active:scale-90 active:bg-[#004FCC] active:shadow-[0_2px_6px_rgba(0,102,255,0.2)]"
                onClick={() => sendMessage()}
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="h-[34px] shrink-0" />
        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSelect={handleDraftSelectFromSheet}
          draft={bottomSheetDraft}
          appliedRevision={appliedRevision}
          selectedRoleTitle={ROLE_OPTIONS.find((role) => role.id === selectedRoleId)?.title ?? ""}
        />
      </section>
    </main>
  );
}
