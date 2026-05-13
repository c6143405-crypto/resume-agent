"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, X } from "lucide-react";

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
    response: "좋아요. 어떤 부분을 다듬어드릴까요? 자주 묻는 수정을 골라보시거나, 직접 말씀해주세요.",
    chips: ["👀 AI 추정 부분 다듬기", "✏️ 빠진 경험 추가하기", "💭 표현을 더 간결하게"],
  },
  stage2a: {
    triggers: ["👀 AI 추정 부분 다듬기"],
    response: "샘플 경력기술서에서 AI가 추정한 부분이 두 곳 있어요. 어느 부분부터 다듬을까요?",
    chips: ["✅ 정합성 100% 유지 (AI · 정확율 70%)", "❗ 12년 연속 0건 (AI · 정확율 50%)", "✅ 월 평균 1,500여 건 (AI · 정확율 80%)"],
  },
  stage2b: {
    triggers: ["✏️ 빠진 경험 추가하기"],
    response: "어떤 경험을 추가하고 싶으세요? 직접 말씀해주시거나 아래에서 골라주세요.",
    chips: ["📊 프로젝트 성과 수치 추가", "🤝 협업 경험 추가", "🎓 교육/자격증 추가"],
  },
  stage2c: {
    triggers: ["💭 표현을 더 간결하게"],
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

function BottomSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
        className={`absolute bottom-0 left-0 h-[720px] w-[375px] rounded-t-[40px] bg-white px-[20px] py-[20px] font-['Pretendard',sans-serif] transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mb-[16px] flex h-[44px] w-[335px] items-center justify-center">
          <h2 className="text-center text-[17px] font-semibold leading-[24px] text-black">
            샘플 경력기술서
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
          <div className="flex flex-col gap-[8px]">
            <p className="text-[16px] font-semibold leading-[24px] tracking-[0.091px] text-black">
              김효원님이 말씀해주신 경험을 바탕으로 AI가 채용 언어로 정리한 경력기술서입니다.
            </p>
            <p className="text-[13px] font-normal leading-[18px] tracking-[0.252px] text-[rgba(55,56,60,0.61)]">
              AI가 작성한 내용이니, 중요한 부분은 꼭 확인해주세요.
            </p>
          </div>

          <div className="my-[12px] h-px w-full bg-[#E5E5E5]" />

          <div className="flex flex-col gap-[24px] text-[14px] tracking-[0.203px] text-black">
            <section className="flex flex-col gap-[8px]">
              <p className="font-semibold leading-[22px]">(주) A 의류 — 의류 유통 기업</p>
              <p className="font-normal leading-[22px]">
                2012.03 ~ 현재 (12년 2개월) · 회계팀 과장
              </p>
            </section>

            <section className="flex flex-col gap-[8px]">
              <p className="font-semibold leading-[22px]">
                프로젝트 1 · 월·연 결산 마감 프로세스 운영
              </p>
              <div>
                <Chip>월말 마감 칠 때 자료부터 미리 챙겨놨어요</Chip>
              </div>
            </section>

            <section className="flex flex-col gap-[8px]">
              <p className="font-semibold leading-[22px]">개요</p>
              <p className="font-normal leading-[22px]">
                직원 30명 규모 의류 유통 기업의 월·연 결산 마감 프로세스를 12년간 전담 운영한 프로젝트
              </p>
            </section>

            <section className="flex flex-col gap-[12px]">
              <p className="font-semibold leading-[22px]">목표</p>
              <div className="flex flex-col gap-[8px]">
                <p className="font-normal leading-[22px]">
                  - 매월 결산 마감 일정 안정화 및 정확성 확보
                </p>
                <div className="flex flex-wrap gap-[6px]">
                  <Chip>매년 결산을 대표님께 보고했어요</Chip>
                  <Chip variant="blue">AI · 정확율 70%</Chip>
                </div>
              </div>
              <div className="flex flex-col gap-[8px]">
                <p className="font-normal leading-[22px]">
                  - 외부 회계 감사 12년 연속 지적 사항 0건 달성
                </p>
                <div className="flex flex-wrap gap-[6px]">
                  <Chip>외부 회계 관리도 했었어요</Chip>
                  <Chip variant="purple">AI · 정확율 50%</Chip>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-[12px] pb-[20px]">
              <p className="font-semibold leading-[22px]">역할 및 성과</p>
              <div className="flex flex-col gap-[8px]">
                <p className="font-normal leading-[22px]">
                  - 매입·매출 전표 월 평균 1,500여 건 처리 및 검증
                </p>
                <div className="flex flex-wrap gap-[6px]">
                  <Chip>장부 매기고 세금계산서 끊는 일이요</Chip>
                  <Chip variant="blue">AI · 정확율 80%</Chip>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  const MAX_REFINEMENT_TURNS = 3;
  const MAX_AI_CALLS_PER_SESSION = 3;
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
    }[]
  >([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedRewriteOption, setSelectedRewriteOption] = useState<number | null>(null);
  const [editingSampleIndex, setEditingSampleIndex] = useState<0 | 1 | null>(null);
  const [refinementTurnCount, setRefinementTurnCount] = useState(0);
  const [isFlowComplete, setIsFlowComplete] = useState(false);
  const [aiCallCount, setAiCallCount] = useState(0);
  const [hasFinalizedRevision, setHasFinalizedRevision] = useState(false);
  const [hasShownSampleReview, setHasShownSampleReview] = useState(false);
  const [flowStep, setFlowStep] = useState<"selectRole" | "loadingDraft" | "draftReady">("selectRole");
  const [spacerHeight, setSpacerHeight] = useState(300);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastSpacerRef = useRef(300);

  // [타이프라이터 스트리밍] AI 응답을 글자 단위로 점진적으로 그린다.
  const [streamingMessageIndex, setStreamingMessageIndex] = useState<number | null>(null);
  const [streamedCharCount, setStreamedCharCount] = useState(0);

  // 새 agent 메시지가 추가되면 스트리밍 시작
  useEffect(() => {
    if (messages.length === 0) return;
    const lastIdx = messages.length - 1;
    const lastMsg = messages[lastIdx];
    if (lastMsg.type !== "agent") return;
    setStreamingMessageIndex(lastIdx);
    setStreamedCharCount(0);
  }, [messages.length]);

  // 글자 한 자씩 진행 (30ms/글자)
  useEffect(() => {
    if (streamingMessageIndex === null) return;
    const msg = messages[streamingMessageIndex];
    if (!msg || msg.type !== "agent") {
      setStreamingMessageIndex(null);
      return;
    }
    if (streamedCharCount < (msg.text || "").length) {
      const timer = setTimeout(() => {
        setStreamedCharCount((c) => c + 1);
      }, 30);
      return () => clearTimeout(timer);
    }
    // 완료
    setStreamingMessageIndex(null);
  }, [streamingMessageIndex, streamedCharCount, messages]);

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
    }, 5000);

    return () => clearTimeout(timer);
  }, [flowStep]);

  const sendMessage = (overrideMessage?: string, options?: { displayStyle?: "header" | "bubble" }) => {
    const trimmedMessage = (overrideMessage ?? message).trim();

    if (!trimmedMessage) {
      return;
    }

    console.log("[DEBUG] sendMessage 실행", { text: trimmedMessage });
    if (trimmedMessage.includes("샘플 경력기술서 1")) {
      setEditingSampleIndex(0);
    } else if (trimmedMessage.includes("샘플 경력기술서 2")) {
      setEditingSampleIndex(1);
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

    if (!USE_AI) {
      // STAGES 모드 — 트리거 매칭으로 즉시 응답
      setTimeout(() => {
        const matched = Object.entries(STAGES).find(([, stage]) =>
          stage.triggers.includes(trimmedMessage)
        );
        if (matched) {
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
        } else {
          setMessages((prev) => [
            ...prev,
            {
              type: "agent",
              text: "좋아요. 그 부분 한 번 같이 다듬어볼까요?",
              chips: [],
              card: null,
            },
          ]);
        }
        setIsLoading(false);
      }, 300);
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

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
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
  const showDraftQuickButtons = flowStep === "draftReady" && view === "home";
  const resultSampleIndex = editingSampleIndex ?? 0;

  return (
    <main className="min-h-screen bg-white font-['Pretendard',sans-serif]">
      <section
        className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white"
      >
        <div className="flex-shrink-0">
          <StatusBar />
        </div>

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
                className="relative flex min-h-full flex-col items-center justify-center overflow-hidden px-[20px] text-center"
                style={{
                  animation: "loadingDraftFadeIn 800ms ease-out both",
                  background:
                    "radial-gradient(circle at 50% 52%, rgba(101,65,242,0.07) 0%, rgba(255,255,255,0) 42%), #FFFFFF",
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
                    <AiOrbLogo size={96} animated />
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
                    선택해주신 직무 방향으로 초안 생성을 완료하였습니다. 마음에 드는 쪽을 골라 다음에 가시면 됩니다.
                  </p>
                </section>

                <section className="mt-[16px]">
                  <ResumeRow index={0} label="샘플 경력기술서 01" onClick={openBottomSheet} />
                  <ResumeRow index={1} label="샘플 경력기술서 02" onClick={openBottomSheet} />
                </section>
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
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <AiOrbLogo size={20} />
                  <span style={{ fontSize: 15, fontWeight: 600 }}>에이전트 답변</span>
                </div>
                <div className="mt-3 h-px" style={{ background: "#E5E5E5" }} />
                <div style={{ marginTop: 12, fontSize: 16, fontWeight: 400, lineHeight: "26px", color: "#000" }}>
                  충분해요. 말씀해주신 내용으로 채용 언어로 정리한 초안 두 가지를 보여드릴게요. 마음에 드는 쪽을 골라 다듬어가시면 됩니다.
                </div>
                <div className="mt-6 flex flex-col gap-6">
                  <ResumeRow index={0} label="샘플 경력기술서 01" onClick={openBottomSheet} />
                  <ResumeRow index={1} label="샘플 경력기술서 02" onClick={openBottomSheet} />
                </div>
              </div>
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
                    <div style={{ marginTop: 12, fontSize: 16, fontWeight: 400, lineHeight: "24px", color: "#000", whiteSpace: "pre-line" }}>
                      {streamingMessageIndex === index
                        ? chatMessage.text.slice(0, streamedCharCount)
                        : chatMessage.text}
                    </div>
                    {!isLoading && streamingMessageIndex !== index && (() => {
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
                              {chatMessage.resultCard.previous}
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
                              {chatMessage.resultCard.revised}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {chatMessage.resultCard && (
                      <div className="mt-4">
                        <ResumeRow
                          index={resultSampleIndex}
                          label={resultSampleIndex === 0 ? "샘플 경력기술서 01" : "샘플 경력기술서 02"}
                          onClick={openBottomSheet}
                        />
                      </div>
                    )}
                    {index === messages.length - 1 &&
                      !isLoading &&
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

        {flowStep !== "loadingDraft" && (
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
        <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </section>
    </main>
  );
}
