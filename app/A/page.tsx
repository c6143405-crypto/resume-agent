"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, X } from "lucide-react";
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
import { findDraftBySampleIndex, SAMPLE_DRAFTS } from "../drafts";
import { A_TYPE_PROMPT } from "./style-prompt";
import { OrbCanvas } from "../components/OrbCanvas";
import { TypewriterText } from "../components/TypewriterText";

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

function AiOrbLogo({ size, animated = false }: { size: number; animated?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`ai-orb relative flex-shrink-0 overflow-hidden rounded-full ${animated ? "ai-orb-animated" : ""}`}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 36% 26%, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.5) 24%, rgba(234,242,254,0.3) 48%, rgba(255,255,255,0.12) 100%)",
        boxShadow: "0 10px 34px rgba(0,102,255,0.14), 0 4px 22px rgba(101,65,242,0.12)",
      }}
    >
      <div
        className={`ai-orb-layer ai-orb-layer-blue absolute rounded-full ${animated ? "ai-orb-layer-drift-a" : "blur-[10px]"}`}
        style={{
          width: size * 0.88,
          height: size * 0.72,
          left: -size * 0.08,
          top: size * 0.2,
          background: "radial-gradient(circle, rgba(0,102,255,0.58) 0%, rgba(0,173,255,0.3) 42%, rgba(0,102,255,0) 72%)",
        }}
      />
      <div
        className={`ai-orb-layer ai-orb-layer-purple absolute rounded-full ${animated ? "ai-orb-layer-drift-b" : "blur-[10px]"}`}
        style={{
          width: size * 0.76,
          height: size * 0.76,
          right: -size * 0.14,
          top: size * 0.02,
          background: "radial-gradient(circle, rgba(101,65,242,0.46) 0%, rgba(181,128,255,0.24) 44%, rgba(101,65,242,0) 72%)",
        }}
      />
      <div
        className="ai-orb-layer absolute rounded-full blur-[14px]"
        style={{
          width: size * 0.72,
          height: size * 0.64,
          right: size * 0.02,
          bottom: -size * 0.14,
          background: "radial-gradient(circle, rgba(255,116,188,0.34) 0%, rgba(255,178,188,0.22) 48%, rgba(255,116,188,0) 74%)",
        }}
      />
      <div
        className={`ai-orb-band absolute ${animated ? "ai-orb-band-flow" : ""}`}
        style={{
          left: -size * 0.08,
          bottom: size * 0.22,
          width: size * 1.18,
          height: size * 0.34,
          borderRadius: "999px",
          background:
            "linear-gradient(100deg, rgba(0,102,255,0) 0%, rgba(0,102,255,0.46) 32%, rgba(0,173,255,0.38) 58%, rgba(255,116,188,0.12) 100%)",
          filter: "blur(8px)",
          transform: "rotate(-14deg)",
        }}
      />
      <div
        className="absolute rounded-full bg-white/45"
        style={{
          width: size * 0.34,
          height: size * 0.18,
          left: size * 0.2,
          top: size * 0.16,
          filter: "blur(7px)",
          transform: "rotate(-18deg)",
        }}
      />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="relative h-[44px] w-full bg-white">
      <div className="absolute left-[30px] top-[13px] text-center text-[15px] font-semibold leading-[18px] tracking-[-0.237px] text-black">
        9:41
      </div>
      <div className="absolute right-[14px] top-[17px] flex items-center gap-[5px]">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
          <rect x="1" y="7" width="3" height="4" rx="1" fill="black" />
          <rect x="5.5" y="5" width="3" height="6" rx="1" fill="black" />
          <rect x="10" y="3" width="3" height="8" rx="1" fill="black" />
          <rect x="14.5" y="1" width="3" height="10" rx="1" fill="black" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
          <path d="M1 4.4C4.9 1.2 11.1 1.2 15 4.4" stroke="black" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 7.2C6.2 5.5 9.8 5.5 12 7.2" stroke="black" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M7.15 10.1C7.65 9.75 8.35 9.75 8.85 10.1" stroke="black" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
          <rect x="0.75" y="1.25" width="21" height="9.5" rx="2.25" stroke="black" strokeWidth="1.5" />
          <rect x="2.75" y="3.25" width="17" height="5.5" rx="1.25" fill="black" />
          <path d="M23 4V8" stroke="black" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
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

function BottomSheet({
  isOpen,
  onClose,
  draft,
}: {
  isOpen: boolean;
  onClose: () => void;
  draft: Draft | null;
}) {
  // 근거 보기 아코디언은 시트 내부 로컬 상태로 관리.
  // 다른 초안 시트를 열면 이전 펼침은 유지되지만, 시트가 다시 열릴 때 명시적으로 접고 싶다면
  // useEffect로 isOpen/draft 변할 때 false로 리셋하면 된다.
  const [isRationaleOpen, setIsRationaleOpen] = useState(false);
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
        className={`absolute bottom-0 left-0 h-[88dvh] w-full rounded-t-[40px] bg-white px-[20px] py-[20px] font-['Pretendard',sans-serif] transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mb-[16px] flex h-[44px] w-[335px] items-center justify-center">
          <h2 className="text-center text-[17px] font-semibold leading-[24px] text-black">
            {draft?.draftTitle ?? "샘플 경력기술서"}
          </h2>
          <button
            aria-label="닫기"
            className="absolute right-[20px] top-[30px] flex h-[24px] w-[24px] items-center justify-center"
            onClick={onClose}
            type="button"
          >
            <X className="h-[24px] w-[24px] text-black" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[620px] overflow-y-scroll pr-[10px] [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#7D7D7D] [&::-webkit-scrollbar-track]:bg-transparent">
          {/* [근거 보기 아코디언] 초안의 방향·추천 이유·주의점을 시트 상단에서 보여줌 */}
          <div>
            <button
              type="button"
              onClick={() => setIsRationaleOpen((v) => !v)}
              className="flex w-full items-center justify-between py-[4px] text-left"
              aria-expanded={isRationaleOpen}
            >
              <span className="text-[14px] font-medium leading-[20px] text-black">
                이 표현의 이유 보기
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                style={{
                  transform: isRationaleOpen ? "rotate(180deg)" : "none",
                  transition: "transform 120ms ease",
                }}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="#999"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {isRationaleOpen && (
              <div
                className="mt-[8px] rounded-[16px] border border-[#EAF2FE] px-[12px] py-[10px]"
                style={{
                  background: "linear-gradient(0deg, #F7F9FF 0%, #FCFDFE 100%)",
                }}
              >
                <div className="text-[12px] font-medium leading-[18px] text-[rgba(55,56,60,0.61)]">
                  이 초안의 방향
                </div>
                <p className="mt-[2px] text-[13px] leading-[20px] text-black">
                  {draft?.draftDirection ?? "—"}
                </p>

                <div className="mt-[8px] text-[12px] font-medium leading-[18px] text-[rgba(55,56,60,0.61)]">
                  추천 이유
                </div>
                <p className="mt-[2px] text-[13px] leading-[20px] text-black">
                  {draft?.whyRecommended ?? "—"}
                </p>

                <div className="mt-[8px] text-[12px] font-medium leading-[18px] text-[rgba(55,56,60,0.61)]">
                  주의할 점
                </div>
                <p className="mt-[2px] text-[13px] leading-[20px] text-black">
                  {draft?.caution ?? "—"}
                </p>
              </div>
            )}
          </div>

          <div className="my-[12px] h-px w-full bg-[#E5E5E5]" />

          {/* [동적 본문]
              - 회사/프로젝트/개요/목표/역할 및 성과 — draft.body 기준
              - A 타입: AI 정확율 칩(blue/purple)은 렌더 안 함.
                gray 칩(사용자 실제 발화)만 본문 아래에 회색 언더라인 텍스트로 표시. */}
          <div className="flex flex-col gap-[24px] text-[14px] tracking-[0.203px] text-black">
            <section className="flex flex-col gap-[8px]">
              <p className="font-semibold leading-[22px]">
                {draft?.body.company ?? "—"}
              </p>
              <p className="font-normal leading-[22px]">
                {draft?.body.period ?? "—"}
              </p>
            </section>

            <section className="flex flex-col gap-[6px]">
              <p className="font-semibold leading-[22px]">
                {draft?.body.projectTitle ?? "—"}
              </p>
            </section>

            <section className="flex flex-col gap-[8px]">
              <p className="font-semibold leading-[22px]">개요</p>
              <p className="font-normal leading-[22px]">
                {draft?.body.overview ?? "—"}
              </p>
            </section>

            <section className="flex flex-col gap-[8px]">
              <p className="font-semibold leading-[22px]">목표</p>
              {(draft?.body.goals ?? []).map((bullet, idx) => (
                <p key={`goal-${idx}`} className="font-normal leading-[22px]">
                  - {bullet.text}
                </p>
              ))}
            </section>

            <section className="flex flex-col gap-[8px] pb-[20px]">
              <p className="font-semibold leading-[22px]">역할 및 성과</p>
              {(draft?.body.roleAndResults ?? []).map((bullet, idx) => (
                <p key={`role-${idx}`} className="font-normal leading-[22px]">
                  - {bullet.text}
                </p>
              ))}
            </section>
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
  const [view, setView] = useState<"home" | "chat">("home");
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
  const [flowStep, setFlowStep] = useState<"selectRole" | "loadingDraft" | "draftReady">("loadingDraft");
  const [spacerHeight, setSpacerHeight] = useState(300);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastSpacerRef = useRef(300);

  // [판단보조형 Agent 상태값] T3 단계, CM1/CM2 흐름에서 추적
  // 현재는 선언만 해두고, AI 응답 로직과 묶는 작업은 다음 단계에서 진행한다.
  const [currentStep, setCurrentStep] = useState<CurrentStep>(
    DEFAULT_AGENT_STATE.currentStep
  );
  const [prototypeType, setPrototypeType] = useState<PrototypeType>(
    DEFAULT_AGENT_STATE.prototypeType
  );
  const [userIntent, setUserIntent] = useState<UserIntent | null>(
    DEFAULT_AGENT_STATE.userIntent
  );
  const [decisionStatus, setDecisionStatus] = useState<DecisionStatus>(
    DEFAULT_AGENT_STATE.decisionStatus
  );
  // CM1에서 사용자가 비교 가능한 전체 초안 목록.
  // 현재는 SAMPLE_DRAFTS로 초기화하지만, 추후 API에서 받아오도록 바꿀 수 있다.
  const [draftOptions, setDraftOptions] = useState<Draft[]>(SAMPLE_DRAFTS);
  // CM1에서 사용자가 선택한 '전체 초안'. CM2로 진입할 때 채워진다.
  const [selectedDraft, setSelectedDraft] = useState<SelectedDraft>(
    DEFAULT_AGENT_STATE.selectedDraft
  );
  // [CM1 라디오 후보] '이 초안 선택하기' 버튼을 누르기 전, 임시로 골라둔 초안.
  const [cm1Candidate, setCm1Candidate] = useState<Draft | null>(null);
  // [바텀시트 대상] 어느 초안의 상세를 시트에 띄울지.
  const [bottomSheetDraft, setBottomSheetDraft] = useState<Draft | null>(null);
  // [CM1 안내 타이핑 완료 플래그] 4줄이 모두 타이핑된 후에 초안 리스트 + 하단 버튼 노출.
  const [cm1IntroDone, setCm1IntroDone] = useState(false);
  // [CM1 안내 노출 단계] 1=첫 줄 / 2=두 번째 줄 ... / 4=네 번째 줄. 각 줄은 자기 step일 때 등장+타이핑.
  const [cm1IntroStep, setCm1IntroStep] = useState(0);
  // [refinementCard 필드 단계] 메시지 index → 현재까지 등장한 카드 필드 수 (0~4).
  // 1: 선택한 초안 / 2: 기존 문장 / 3: AI 수정안 / 4: 변경 이유
  const [refinementCardStep, setRefinementCardStep] = useState<Record<number, number>>({});
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
    const timer = setTimeout(() => {
      const container = scrollContainerRef.current;
      const lastUserEl = lastUserMessageRef.current;

      if (!container || !lastUserEl) {
        return;
      }

      const containerHeight = container.clientHeight;
      const userMessageTop = lastUserEl.offsetTop;
      const totalContentHeight = container.scrollHeight;
      const actualContentHeight = totalContentHeight - lastSpacerRef.current;
      const contentBelowUser = Math.max(0, actualContentHeight - userMessageTop);
      const neededSpacer = Math.max(0, containerHeight - contentBelowUser - 20);

      if (Math.abs(neededSpacer - lastSpacerRef.current) > 2) {
        lastSpacerRef.current = neededSpacer;
        setSpacerHeight(neededSpacer);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, isLoading]);

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
      `아래 ${SAMPLE_DRAFTS.length}가지 방향의 경력기술서 초안을 준비했습니다.`,
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
      const draft = findDraftBySampleIndex(0);
      if (draft) {
        setEditingSampleIndex(0);
        setSelectedDraft(draft);
        setCurrentStep("CM2");
        setCurrentAiDraft(draft.draftContent);
        setDecisionStatus("selected");
      }
    } else if (trimmedMessage.includes("샘플 경력기술서 2")) {
      const draft = findDraftBySampleIndex(1);
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
          typeStylePrompt: A_TYPE_PROMPT,
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
    const draft = SAMPLE_DRAFTS[index] ?? selectedDraft ?? null;
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

  // 확정 버튼 — 라디오로 골라둔 후보를 CM2 selectedDraft로 커밋.
  // sendMessage 흐름(STAGES/AI) 대신, CM2 진입에 맞는 안내 + 수정 카드를 직접 push한다.
  const commitCm1Selection = () => {
    if (!cm1Candidate) return;
    const index = SAMPLE_DRAFTS.findIndex((d) => d.draftId === cm1Candidate.draftId);
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
          "선택한 초안을 바탕으로 문장을 다듬는 단계입니다. " +
          "표현이 과하거나 실제 경험과 맞지 않는 부분이 있으면 수정할 수 있어요.",
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
    setRefinementCardOutcome("apply");
    setDecisionStatus("modified");
    sendMessage("수정안 적용하기", { displayStyle: "bubble" });
  };

  const handleRefinementKeep = () => {
    if (refinementCardOutcome) return;
    setRefinementCardOutcome("keep");
    // 기존 문장 유지 — 초안 자체는 selected 상태 유지(수정 안 함).
    sendMessage("기존 문장 유지하기", { displayStyle: "bubble" });
  };

  const handleRefinementRetry = () => {
    if (refinementCardOutcome) return;
    setRefinementCardOutcome("retry");
    sendMessage("다시 수정해줘", { displayStyle: "bubble" });
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

  return (
    <main className="min-h-screen bg-white font-['Pretendard',sans-serif]">
      {/* dev: 판단보조형 Agent 상태값 확인 패널 — 로컬 개발에서만 표시, 배포(production)에선 자동 숨김 */}
      {process.env.NODE_ENV === "development" && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-4 top-4 z-50 select-none rounded-lg bg-black/85 px-3 py-2 font-mono text-[11px] leading-[18px] text-white shadow-lg"
        >
          <div className="mb-1 text-[10px] uppercase tracking-wider text-white/60">
            Agent State (dev)
          </div>
          <div>
            currentStep: <span className="text-cyan-300">{currentStep}</span>
          </div>
          <div>
            prototypeType: <span className="text-cyan-300">{prototypeType}</span>
          </div>
          <div>
            userIntent: <span className="text-cyan-300">{userIntent ?? "null"}</span>
          </div>
          <div>
            decisionStatus: <span className="text-cyan-300">{decisionStatus}</span>
          </div>
          <div>
            draftOptions:{" "}
            <span className="text-cyan-300">
              [{draftOptions.map((d) => d.draftId).join(", ")}]
            </span>
          </div>
          <div>
            selectedDraft:{" "}
            <span className="text-cyan-300">
              {selectedDraft ? selectedDraft.draftId : "null"}
            </span>
          </div>
        </div>
      )}
      <section
        className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white"
      >
        <div className="flex h-[44px] flex-shrink-0 items-center justify-center px-[16px] py-[10px]">
          <div className="flex h-[24px] w-full items-center justify-center">
            <h1 className="text-center text-[17px] font-semibold leading-[24px] text-black">
              경력기술서 에이전트
            </h1>
          </div>
        </div>

        <div ref={scrollContainerRef} className="relative flex-1 overflow-y-auto">
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
          {view === "home" ? (
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
              // [A 타입 CM1] 미니멀 텍스트형. 위→아래 순차 읽기.
              // 시각 라벨/카드/애니메이션 없이 텍스트와 단순 버튼으로만 구성.
              <div className="flex min-h-full flex-col px-[20px] pb-[24px] pt-[28px]">
                {/* 에이전트 답변 헤더 — A/B/C/D 어떤 타입이든 공통으로 유지하는 양식 */}
                <div className="flex items-center gap-[8px]">
                  <AiOrbLogo size={20} />
                  <h2 className="text-[16px] font-semibold leading-[24px] tracking-[0.57px] text-black">
                    에이전트 답변
                  </h2>
                </div>
                <div className="mt-[12px] h-px w-full bg-[#70737C29]" />

                {/* [CM1 안내 4줄 step-based] cm1IntroStep N일 때만 N번째 줄 등장 */}
                {cm1IntroStep >= 1 && (
                  <p className="mt-[13px] text-[15px] font-normal leading-[24px] text-[#171719]">
                    <TypewriterText text={`아래 ${SAMPLE_DRAFTS.length}가지 방향의 경력기술서 초안을 준비했습니다.`} />
                  </p>
                )}
                {cm1IntroStep >= 2 && (
                  <p className="mt-[6px] text-[15px] font-normal leading-[24px] text-[#171719]">
                    <TypewriterText text="각 초안은 같은 경험을 바탕으로 하지만, 강조하는 방향이 다릅니다." />
                  </p>
                )}
                {cm1IntroStep >= 3 && (
                  <p className="mt-[6px] text-[15px] font-normal leading-[24px] text-[#171719]">
                    <TypewriterText text="먼저 전체 흐름을 읽어보시고, 본인에게 가장 맞는 방향을 하나 선택해 주세요." />
                  </p>
                )}
                {cm1IntroStep >= 4 && (
                  <p className="mt-[6px] text-[15px] font-normal leading-[24px] text-[#171719]">
                    <TypewriterText text="선택한 뒤에는 다음 단계에서 문장 표현을 더 담백하게 바꾸거나, 실제 경험과 맞지 않는 부분을 수정할 수 있습니다." />
                  </p>
                )}

                {/* [A 타입 CM1 리스트] 행은 라디오 + 제목 + chevron만. 근거는 바텀시트 상단에서 노출.
                    안내 4줄 타이핑이 끝난 뒤(cm1IntroDone=true)에 노출. */}
                {cm1IntroDone && (
                <section className="mt-[20px]">
                  {SAMPLE_DRAFTS.map((draft) => {
                    const isPicked = cm1Candidate?.draftId === draft.draftId;
                    return (
                      <div
                        key={draft.draftId}
                        className="flex h-[52px] w-full items-center gap-[10px] border-b border-[#70737C29]"
                      >
                        <button
                          type="button"
                          aria-label="이 초안을 선택지로 두기"
                          aria-pressed={isPicked}
                          onClick={() => handlePickDraftCandidate(draft)}
                          className="flex h-[24px] w-[24px] flex-shrink-0 items-center justify-center"
                        >
                          <span
                            className="flex h-[18px] w-[18px] items-center justify-center rounded-full border"
                            style={{
                              borderColor: isPicked ? "#171719" : "#C4C6CA",
                            }}
                          >
                            {isPicked && (
                              <span
                                className="block rounded-full"
                                style={{ width: 10, height: 10, background: "#171719" }}
                              />
                            )}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openBottomSheetWith(draft)}
                          className="flex flex-1 items-center justify-between"
                        >
                          <div className="flex items-center gap-[8px]">
                            <FileText
                              className="h-[20px] w-[20px] text-black"
                              strokeWidth={1.8}
                              aria-hidden="true"
                            />
                            <span className="text-[16px] font-medium leading-[24px] tracking-[0.57px] text-black">
                              {draft.draftTitle}
                            </span>
                          </div>
                          <ChevronRightIcon />
                        </button>
                      </div>
                    );
                  })}
                </section>
                )}
              </div>
            ) : (
              <div className="flex min-h-full flex-col px-[20px] pt-[36px]">
                <section>
                  <div className="flex items-center gap-[8px]">
                    <AiOrbLogo size={20} />
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
                      <AiOrbLogo size={20} />
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
                    {chatMessage.refinementCard && (() => {
                      const rc = chatMessage.refinementCard;
                      const decided = refinementCardOutcome !== null;
                      // [refinementCard 필드 step] 메시지 useEffect에서 refinementCardStep을 시간차로 1~4 증가시킴.
                      // 각 필드(라벨+내용)는 자기 step일 때 등장 → TypewriterText 시작.
                      const SPEED = 30;
                      // 모든 필드 타이핑이 끝났는지: messageDone[index] 기준으로 버튼 활성화.
                      const isMessageDone = messageDone[index] === true;
                      const cardStep = refinementCardStep[index] ?? 0;
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
                        <div className="mt-3 w-full" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          {/* 선택한 초안 (cardStep >= 1) */}
                          {cardStep >= 1 && (
                            <div>
                              <div style={{ fontSize: 12, lineHeight: "18px", color: "rgba(55,56,60,0.61)" }}>
                                선택한 초안
                              </div>
                              <div style={{ marginTop: 2, fontSize: 15, fontWeight: 600, lineHeight: "22px", color: "#171719" }}>
                                <TypewriterText text={rc.draftTitle} speed={SPEED} />
                              </div>
                            </div>
                          )}

                          {cardStep >= 2 && <div style={{ height: 1, background: "#EAF2FE" }} />}

                          {/* 기존 문장 (cardStep >= 2) */}
                          {cardStep >= 2 && (
                            <div>
                              <div style={{ fontSize: 12, lineHeight: "18px", color: "rgba(55,56,60,0.61)" }}>
                                기존 문장
                              </div>
                              <p
                                style={{
                                  marginTop: 4,
                                  fontSize: 14,
                                  lineHeight: "22px",
                                  color: "rgba(55,56,60,0.61)",
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
                                  <TypewriterText text={rc.originalSentence} speed={SPEED} />
                                </span>
                              </p>
                            </div>
                          )}

                          {/* AI 수정안 (cardStep >= 3) */}
                          {cardStep >= 3 && (
                            <div>
                              <div style={{ fontSize: 12, lineHeight: "18px", color: "#0066FF" }}>
                                AI 수정안
                              </div>
                              <p
                                style={{
                                  marginTop: 4,
                                  fontSize: 14,
                                  lineHeight: "22px",
                                  color: "#171719",
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
                                  <TypewriterText text={rc.revisedSentence} speed={SPEED} />
                                </span>
                              </p>
                            </div>
                          )}

                          {/* 변경 이유 (cardStep >= 4) */}
                          {cardStep >= 4 && (
                            <div>
                              <div style={{ fontSize: 12, lineHeight: "18px", color: "rgba(55,56,60,0.61)" }}>
                                변경 이유
                              </div>
                              <p style={{ marginTop: 4, fontSize: 14, lineHeight: "22px", color: "#171719" }}>
                                <TypewriterText text={rc.changeReason} speed={SPEED} />
                              </p>
                            </div>
                          )}

                          {/* 버튼 3개 — 전체 카드 타이핑이 끝난 뒤에만 등장. 결정되면 비활성. */}
                          {isMessageDone && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                            <button
                              type="button"
                              disabled={decided || !isMessageDone}
                              onClick={handleRefinementApply}
                              style={{
                                ...buttonBase,
                                background: refinementCardOutcome === "apply" ? "#171719" : "#FFFFFF",
                                color: refinementCardOutcome === "apply" ? "#FFFFFF" : decided ? "rgba(55,56,60,0.4)" : "#171719",
                                border: "1px solid " + (refinementCardOutcome === "apply" ? "#171719" : "#E5E5E5"),
                                cursor: decided ? "default" : "pointer",
                              }}
                            >
                              수정안 적용하기
                            </button>
                            <button
                              type="button"
                              disabled={decided || !isMessageDone}
                              onClick={handleRefinementKeep}
                              style={{
                                ...buttonBase,
                                background: refinementCardOutcome === "keep" ? "#171719" : "#FFFFFF",
                                color: refinementCardOutcome === "keep" ? "#FFFFFF" : decided ? "rgba(55,56,60,0.4)" : "#171719",
                                border: "1px solid " + (refinementCardOutcome === "keep" ? "#171719" : "#E5E5E5"),
                                cursor: decided ? "default" : "pointer",
                              }}
                            >
                              기존 문장 유지하기
                            </button>
                            <button
                              type="button"
                              disabled={decided || !isMessageDone}
                              onClick={handleRefinementRetry}
                              style={{
                                ...buttonBase,
                                background: refinementCardOutcome === "retry" ? "#171719" : "#FFFFFF",
                                color: refinementCardOutcome === "retry" ? "#FFFFFF" : decided ? "rgba(55,56,60,0.4)" : "#171719",
                                border: "1px solid " + (refinementCardOutcome === "retry" ? "#171719" : "#E5E5E5"),
                                cursor: decided ? "default" : "pointer",
                              }}
                            >
                              다시 수정하기
                            </button>
                          </div>
                          )}
                        </div>
                      );
                    })()}
                    {chatMessage.resultCard && (
                      <div
                        className="mt-3 w-full"
                        style={{
                          padding: 16,
                          borderRadius: 16,
                          border: "1px solid #EAF2FE",
                          background: "linear-gradient(0deg, #F7F9FF 0%, #FCFDFE 100%)",
                        }}
                      >
                        <div className="flex flex-col gap-3">
                          <div>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 500,
                                lineHeight: "16px",
                                color: "rgba(55,56,60,0.61)",
                              }}
                            >
                              기존 표현
                            </div>
                            <div
                              style={{
                                marginTop: 4,
                                fontSize: 14,
                                fontWeight: 500,
                                lineHeight: "20px",
                                color: "#171719",
                              }}
                            >
                              <TypewriterText text={chatMessage.resultCard.previous} />
                            </div>
                          </div>
                          <div
                            style={{
                              height: 1,
                              background: "#EAF2FE",
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                lineHeight: "16px",
                                color: "#0066FF",
                              }}
                            >
                              바뀐 표현
                            </div>
                            <div
                              style={{
                                marginTop: 4,
                                fontSize: 14,
                                fontWeight: 600,
                                lineHeight: "20px",
                                color: "#171719",
                              }}
                            >
                              <TypewriterText text={chatMessage.resultCard.revised} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
                                className="inline-flex cursor-pointer items-center hover:bg-[#F9F9F9]"
                                key={chipIndex}
                                onClick={() => sendMessage(chipLabel, { displayStyle: "bubble" })}
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
                    <AiOrbLogo size={20} />
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
              <div
                aria-hidden="true"
                style={{
                  minHeight: "60vh",
                  flexShrink: 0,
                }}
              />
            </div>
          )}
        </div>

        {/* [하단 영역]
            - CM1(초안 선택 화면)에서는 채팅창 숨기고 '이 초안 선택하기' 버튼만 노출
            - 그 외(CM2 챗, selectRole 등)에서는 기존 채팅 입력창을 그대로 유지 */}
        {flowStep === "draftReady" && view === "home" && cm1IntroDone ? (
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
        ) : flowStep !== "loadingDraft" && (
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
                }}
                value={message}
              />
              <button
                className="absolute bottom-[17px] right-[12px] flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#0066FF]"
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

        <div className="flex flex-shrink-0 justify-center pb-[8px]">
          <div className="h-[5px] w-[134px] rounded-full bg-black" />
        </div>
        <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} draft={bottomSheetDraft} />
      </section>
    </main>
  );
}
