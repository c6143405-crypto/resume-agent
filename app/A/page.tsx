"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AiOrb } from "../components/AiOrb";

/**
 * A 타입 (미니멀 텍스트형) — 새 디자인 진행 중
 *
 * 완성: Start, CM 01 메인, CM 01 모달
 * 미완성: 초안 작성 기준 expand 토글, CM 02, End
 * 옛 디자인은 page.old.tsx에 백업
 */

// ─── 9:41 가짜 상태바 ─────────────────────────────────────────────────
function StatusBar() {
  return (
    <div className="flex h-11 items-center justify-between px-5 text-label-strong">
      <span className="font-semibold tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
          <rect x="0" y="9" width="3" height="3" rx="0.5" />
          <rect x="5" y="6" width="3" height="6" rx="0.5" />
          <rect x="10" y="3" width="3" height="9" rx="0.5" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
          <path d="M8 0C5 0 2.2 1 0 2.8l1.6 2C3.3 3.4 5.5 2.5 8 2.5s4.7 0.9 6.4 2.3l1.6-2C13.8 1 11 0 8 0zm0 4c-2 0-4 0.7-5.5 2l1.6 2C5 7.4 6.5 7 8 7s3 0.4 4 1l1.5-2C12 4.7 10 4 8 4zm0 4c-1.2 0-2.3 0.4-3 1l3 3 3-3c-0.7-0.6-1.8-1-3-1z" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" aria-hidden="true">
          <rect x="0.5" y="1" width="21" height="10" rx="2.5" fill="none" stroke="currentColor" strokeOpacity="0.35" />
          <rect x="23" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" fillOpacity="0.4" />
          <rect x="2" y="2.5" width="18" height="7" rx="1.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

// ─── 페이지 타이틀바 (스크롤 시 하단 border) ───────────────────────────
function PageTitleBar({ showBorderBottom = false }: { showBorderBottom?: boolean }) {
  return (
    <div
      className="relative z-10 flex h-11 items-center justify-center bg-static-white px-5 transition-[border-color] duration-150"
      style={{
        borderBottom: showBorderBottom
          ? "0.5px solid rgba(112, 115, 124, 0.16)"
          : "0.5px solid transparent",
      }}
    >
      <h1 className="text-heading-2 font-bold text-label-strong">
        경력기술서 에이전트
      </h1>
    </div>
  );
}

// ─── iOS 홈바 ─────────────────────────────────────────────────────────
function HomeBar() {
  return (
    <div className="flex h-[34px] items-end justify-center pb-2">
      <div className="h-[5px] w-[134px] rounded-full bg-label-strong" />
    </div>
  );
}

// ─── TBD placeholder 카드 (그래픽 미확정) ──────────────────────────────
function TbdCard({ label }: { label?: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-[#E73E3E] px-6 py-20 text-center">
      {label ? (
        <>
          <p className="mb-1 text-xs text-white opacity-50">{`'${label}'`}</p>
          <p className="mb-1 text-5xl font-bold text-white">TBD</p>
          <p className="text-xs text-white opacity-50">그래픽 디자인</p>
        </>
      ) : (
        <>
          <p className="mb-1 text-xs text-white opacity-50">T2에서 확정한</p>
          <p className="mb-1 text-5xl font-bold text-white">TBD</p>
          <p className="text-xs text-white opacity-50">ID 카드 그래픽 디자인</p>
        </>
      )}
    </div>
  );
}

// ─── 배경 그라데이션 원 ───────────────────────────────────────────────
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

// ─── 초안 옵션 카드 ────────────────────────────────────────────────────
interface DraftOptionCardProps {
  index: number;
  title: string;
  onClick?: () => void;
}
function DraftOptionCard({ index, title, onClick }: DraftOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative z-10 flex w-full items-center gap-2 self-stretch rounded-xl border border-[#E8EEF5] bg-static-white p-4 transition-colors hover:bg-fill-alternative active:bg-fill-normal"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-label-strong text-caption-1 font-bold leading-none text-static-white">
        {index}
      </span>
      <span className="flex-1 text-left text-body-1 font-bold text-label-normal">
        {title}
      </span>
      <Image src="/file.png" alt="" width={20} height={20} className="opacity-50" />
    </button>
  );
}

// ─── 초안 데이터 ──────────────────────────────────────────────────────
interface DraftData {
  title: string;
  company: string;
  period: string;
  project: string;
  description: string;
  tasks: string[];
  achievements: string[];
  criteria: {
    applied: string;
    improve: string;
  };
}

// AI Chat에서 다듬을 항목
interface RefinementItem {
  step: number; // 1, 2 ...
  total: number; // 총 항목 수
  title: string;
  original: string;
  revised: string;
  reason: string;
}

// 사용자 ↔ AI 메시지 히스토리
type ChatMessage =
  | { kind: "user"; text: string }
  | { kind: "ai"; text: string; item?: RefinementItem };

// 사용자가 입력 후 표시되는 AI 응답 mock (Figma 디자인 기반)
const MOCK_AI_RESPONSE: { text: string; item: RefinementItem } = {
  text: "요청하신 문장을 조금 더 자연스럽고 검증 가능한 표현으로 다듬어볼게요.",
  item: {
    step: 1,
    total: 2,
    title: "신고 자료 정확도 표현",
    original: "신고 자료 정확도 99% 수준 유지",
    revised:
      "부가세·법인세 신고 자료를 반복 검토하며 높은 수준의 정확성을 유지했습니다.",
    reason:
      "'99%'는 산출 기준이 명확할 때 설득력이 있지만, 근거가 불분명하면 과장으로 보일 수 있습니다. 정확성을 유지했다는 의미는 살리되, 검증 부담이 적은 표현으로 조정했습니다.",
  },
};
const DRAFT_DATA: Record<number, DraftData> = {
  1: {
    title: "성과 중심 초안",
    company: "(주) A 의류 유통 기업",
    period: "2012.03 ~ 현재 (12년 2개월) · 회계팀 과장",
    project: "[프로젝트 1] 월·연 결산 마감 프로세스 운영",
    description:
      "직원 30명 연매출 120억 원 규모의 의류 유통 기업에서 월·연 결산 마감을 12년간 전담했습니다.",
    tasks: [
      "매월 결산 마감 일정 관리",
      "외부 회계 감사 대응",
      "부가세·법인세 신고 자료 정리",
      "결산 종료 후 대표 보고 자료 작성",
    ],
    achievements: [
      "매입·매출 전표 월 평균 1,500여 건 처리 및 검증",
      "외부 감사 12년 연속 주요 지적 사항 0건 유지",
      "신고 자료 정확도 99% 수준 유지",
      "결산 마감 일정을 평균 5영업일 이내로 관리",
    ],
    criteria: {
      applied:
        "월·연 결산 운영 경험을 성과 중심으로 정리했어요. 전표 처리량, 감사 지적 0건, 신고 자료 정확도 99%를 주요 성과로 강조했어요.",
      improve: "오류 개선 사례가 있으면 더 설득력 있어져요.",
    },
  },
  // 2, 3번은 Phase 4에서 정식 데이터로 교체. 일단 1번 데이터 재사용 (title만 변경)
  2: {
    title: "직무 적합 중심 초안",
    company: "(주) A 의류 유통 기업",
    period: "2012.03 ~ 현재 (12년 2개월) · 회계팀 과장",
    project: "[프로젝트 1] 월·연 결산 마감 프로세스 운영",
    description:
      "직원 30명 연매출 120억 원 규모의 의류 유통 기업에서 월·연 결산 마감을 12년간 전담했습니다.",
    tasks: [
      "매월 결산 마감 일정 관리",
      "외부 회계 감사 대응",
      "부가세·법인세 신고 자료 정리",
      "결산 종료 후 대표 보고 자료 작성",
    ],
    achievements: [
      "매입·매출 전표 월 평균 1,500여 건 처리 및 검증",
      "외부 감사 12년 연속 주요 지적 사항 0건 유지",
      "신고 자료 정확도 99% 수준 유지",
      "결산 마감 일정을 평균 5영업일 이내로 관리",
    ],
    criteria: {
      applied:
        "월·연 결산 운영 경험을 성과 중심으로 정리했어요. 전표 처리량, 감사 지적 0건, 신고 자료 정확도 99%를 주요 성과로 강조했어요.",
      improve: "오류 개선 사례가 있으면 더 설득력 있어져요.",
    },
  },
  3: {
    title: "경험 서사 중심 초안",
    company: "(주) A 의류 유통 기업",
    period: "2012.03 ~ 현재 (12년 2개월) · 회계팀 과장",
    project: "[프로젝트 1] 월·연 결산 마감 프로세스 운영",
    description:
      "직원 30명 연매출 120억 원 규모의 의류 유통 기업에서 월·연 결산 마감을 12년간 전담했습니다.",
    tasks: [
      "매월 결산 마감 일정 관리",
      "외부 회계 감사 대응",
      "부가세·법인세 신고 자료 정리",
      "결산 종료 후 대표 보고 자료 작성",
    ],
    achievements: [
      "매입·매출 전표 월 평균 1,500여 건 처리 및 검증",
      "외부 감사 12년 연속 주요 지적 사항 0건 유지",
      "신고 자료 정확도 99% 수준 유지",
      "결산 마감 일정을 평균 5영업일 이내로 관리",
    ],
    criteria: {
      applied:
        "월·연 결산 운영 경험을 성과 중심으로 정리했어요. 전표 처리량, 감사 지적 0건, 신고 자료 정확도 99%를 주요 성과로 강조했어요.",
      improve: "오류 개선 사례가 있으면 더 설득력 있어져요.",
    },
  },
};

// ─── 닫기(X) 아이콘 ───────────────────────────────────────────────────
function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── 펼치기(V) 아이콘 ──────────────────────────────────────────────────
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── 초안 작성 기준 카드 (펼치기 토글) ────────────────────────────────
function DraftCriteriaCard({
  criteria,
}: {
  criteria: { applied: string; improve: string };
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="flex w-full flex-col rounded-xl border p-4 transition-colors"
      style={{
        borderColor: "#EAF2FE",
        background:
          "linear-gradient(0deg, #F7F9FF 0%, #FCFDFE 100%), #FFF",
      }}
    >
      {/* 헤더 — 카드 전체 클릭으로 토글 */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center gap-3 text-left"
        aria-expanded={isOpen}
      >
        <AiOrb size={20} />
        <span className="flex-1 text-body-1 font-medium text-label-normal">
          초안 작성 기준
        </span>
        <span className="text-label-neutral">
          <ChevronDownIcon
            className={`transition-transform duration-300 ease-out ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {/* 펼친 콘텐츠 — grid trick으로 부드럽게 열림/닫힘 */}
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="min-h-0">
          <div className="mt-4 h-px w-full bg-line-solid-normal" />
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h5 className="text-label-1 font-medium text-label-neutral">
                반영한 내용
              </h5>
              <p className="text-body-1-reading text-label-normal">
                {criteria.applied}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <h5 className="text-label-1 font-medium text-label-neutral">
                보완하면 좋은 점
              </h5>
              <p className="text-body-1-reading text-label-normal">
                {criteria.improve}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 모달 본문 (상세 내용) ────────────────────────────────────────────
function DraftDetailBody({ data }: { data: DraftData }) {
  return (
    <div className="flex flex-col gap-6 pb-2 pt-9">
      {/* 회사명 + 기간 */}
      <div className="flex flex-col gap-1 px-1">
        <h3 className="text-headline-1 font-bold text-label-normal">
          {data.company}
        </h3>
        <p className="text-body-2-reading text-label-neutral">{data.period}</p>
        <div className="mt-5 h-px w-full bg-line-solid-normal" />
      </div>

      {/* 프로젝트 */}
      <div className="flex flex-col gap-3 px-1">
        <h3 className="text-headline-1 font-bold text-label-normal">
          {data.project}
        </h3>
        <p className="text-body-1-reading text-label-normal">
          {data.description}
        </p>
      </div>

      {/* 업무 상세 */}
      <div className="flex flex-col gap-1 px-1">
        <h4 className="text-headline-1 font-bold text-label-normal">업무 상세</h4>
        <ul className="flex flex-col gap-1 pt-3">
          {data.tasks.map((task, i) => (
            <li
              key={i}
              className="text-body-1-reading text-label-normal flex gap-2 px-1"
            >
              <span aria-hidden="true">•</span>
              <span className="flex-1">{task}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 역할 및 성과 */}
      <div className="flex flex-col gap-1 px-1">
        <h4 className="text-headline-1 font-bold text-label-normal">역할 및 성과</h4>
        <ul className="flex flex-col gap-1 pt-3">
          {data.achievements.map((item, i) => (
            <li
              key={i}
              className="text-body-1-reading text-label-normal flex gap-2 px-1"
            >
              <span aria-hidden="true">•</span>
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── 모달 (DraftDetail BottomSheet) ───────────────────────────────────
interface DraftDetailModalProps {
  draftIndex: number;
  onClose: () => void;
  onSelect: () => void;
}
function DraftDetailModal({ draftIndex, onClose, onSelect }: DraftDetailModalProps) {
  const data = DRAFT_DATA[draftIndex];
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 마운트 시 슬라이드 업 애니메이션
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // 스크롤 시 모달 전체 확장 (한 번 확장되면 그대로 유지 — 흔들림 방지)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 20 && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 280); // 슬라이드 다운 후 unmount
  };

  return (
    <div className="absolute inset-0 z-50">
      {/* Dim 배경 — 페이지 컨테이너 안 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={handleClose}
        className={`absolute inset-0 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: "rgba(23, 23, 25, 0.52)" }}
      />

      {/* 바텀시트 — 페이지 컨테이너 폭 채움. 풀 확장 시 모서리 제거 */}
      <div
        className={`absolute bottom-0 left-0 right-0 flex w-full flex-col overflow-hidden bg-static-white transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          height: isExpanded ? "100%" : "85%",
          borderTopLeftRadius: isExpanded ? 0 : 16,
          borderTopRightRadius: isExpanded ? 0 : 16,
          borderTop: "1px solid rgba(112, 115, 124, 0.22)",
          borderLeft: "1px solid rgba(112, 115, 124, 0.22)",
          borderRight: "1px solid rgba(112, 115, 124, 0.22)",
        }}
      >
        {/* Drag handle — 항상 표시 */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-line-solid-strong" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-label-strong text-label-1 font-bold leading-none text-static-white">
              {draftIndex}
            </span>
            <h2 className="text-heading-2 font-bold text-label-strong">
              {data.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-label-strong"
            aria-label="닫기"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto px-5"
          style={{ scrollbarGutter: "stable" }}
          onScroll={handleScroll}
        >
          <DraftCriteriaCard criteria={data.criteria} />
          <DraftDetailBody data={data} />
        </div>

        {/* CTA + 흰색 fade */}
        <div className="relative w-full">
          {/* 흰색 fade 그라데이션 (위쪽으로) */}
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
              onClick={onSelect}
              className="w-full self-stretch rounded-xl bg-primary-normal px-7 py-3.5 text-center text-headline-2 font-bold text-static-white transition-colors hover:bg-primary-strong active:bg-primary-heavy"
            >
              이 초안 선택하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Start 화면 ────────────────────────────────────────────────────────
interface StartScreenProps {
  onStart: () => void;
}
function StartScreen({ onStart }: StartScreenProps) {
  return (
    <>
      <section className="flex flex-col items-center gap-5 px-5 py-12">
        <AiOrb size={40} />
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-heading-1 text-center font-bold text-label-strong">
            선택한 직무를 바탕으로<br />
            경력기술서 초안을 만들게요
          </h2>
          <p className="text-body-1-reading text-center text-label-neutral">
            요즘 기업 표현과, 구체적 성과를 작성해요
          </p>
        </div>
      </section>
      <div className="px-5">
        <TbdCard />
      </div>
      <div className="flex-1" />
      <footer className="flex w-full flex-col px-5 pb-2">
        <button
          type="button"
          onClick={onStart}
          className="w-full self-stretch rounded-xl bg-primary-normal px-7 py-3.5 text-center text-headline-2 font-bold text-static-white transition-colors hover:bg-primary-strong active:bg-primary-heavy"
        >
          초안 만들기
        </button>
      </footer>
    </>
  );
}

// ─── CM 01 화면 (3가지 초안) ──────────────────────────────────────────
interface Cm01ScreenProps {
  onDraftClick: (draftIndex: number) => void;
}
function Cm01Screen({ onDraftClick }: Cm01ScreenProps) {
  const drafts = [
    { index: 1, title: "성과 중심 초안" },
    { index: 2, title: "직무 적합 중심 초안" },
    { index: 3, title: "경험 서사 중심 초안" },
  ];

  return (
    <>
      <section className="relative z-10 flex flex-col items-center gap-5 px-5 py-12">
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

      <div className="relative z-10 flex flex-col gap-2 px-5">
        {drafts.map((d) => (
          <DraftOptionCard
            key={d.index}
            index={d.index}
            title={d.title}
            onClick={() => onDraftClick(d.index)}
          />
        ))}
      </div>

      <div className="flex-1" />
    </>
  );
}

// ─── CM 02 진입 화면 ("1번 초안을 선택했어요") ────────────────────────
interface Cm02LoadingScreenProps {
  draftIndex: number;
  draftTitle: string;
  onRefine: () => void;
  onFinalize: () => void;
}
function Cm02LoadingScreen({
  draftIndex,
  draftTitle,
  onRefine,
  onFinalize,
}: Cm02LoadingScreenProps) {
  return (
    <>
      <section className="flex flex-col items-center gap-5 px-5 py-12">
        <AiOrb size={40} />
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-heading-1 text-center font-bold text-label-strong">
            {draftIndex}번 초안을 선택했어요
          </h2>
          <p className="text-body-1-reading text-center text-label-neutral">
            내용을 AI와 함께 더 다듬을 수 있어요
          </p>
        </div>
      </section>
      <div className="px-5">
        <TbdCard label={draftTitle} />
      </div>
      <div className="flex-1" />
      <footer className="flex w-full flex-col items-start gap-2 self-stretch px-5 pb-2">
        <button
          type="button"
          onClick={onRefine}
          className="w-full self-stretch rounded-xl bg-primary-normal px-7 py-3.5 text-center text-headline-2 font-bold text-static-white transition-colors hover:bg-primary-strong active:bg-primary-heavy"
        >
          초안 내용 다듬기
        </button>
        <button
          type="button"
          onClick={onFinalize}
          className="w-full self-stretch rounded-xl border px-7 py-3.5 text-center text-headline-2 font-bold text-label-normal transition-colors hover:bg-fill-alternative"
          style={{ borderColor: "rgba(112, 115, 124, 0.16)" }}
        >
          최종 마무리 단계로 넘어가기
        </button>
      </footer>
    </>
  );
}

// ─── 채택/유지 버튼 그룹 ───────────────────────────────────────────
function ChatActionButtons({
  onAccept,
  onKeep,
}: {
  onAccept: () => void;
  onKeep: () => void;
}) {
  return (
    <div className="flex flex-row items-center gap-2">
      <button
        type="button"
        onClick={onAccept}
        className="rounded-[10px] bg-primary-normal px-4 py-2.5 text-body-2-reading font-bold text-static-white transition-colors hover:bg-primary-strong"
      >
        수정 문장 채택
      </button>
      <button
        type="button"
        onClick={onKeep}
        className="rounded-[10px] border border-primary-normal bg-transparent px-4 py-2.5 text-body-2-reading font-bold text-primary-normal transition-colors hover:bg-primary-normal/5"
      >
        기존 유지
      </button>
    </div>
  );
}

// ─── AI 챗 입력창 (column: textarea 위, 전송 버튼 아래 우측) ────────
function ChatInput({ value, onChange, onSend }: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
}) {
  const isActive = value.trim().length > 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // textarea auto-resize: 입력값 변할 때 height 자동 조정
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }, [value]);

  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-line-solid-normal bg-background-normal-normal p-3"
      /* border-line-solid-normal, bg-background-normal-normal */
    >
      {/* textarea — auto-resize */}
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // Enter → send / Shift+Enter → 줄바꿈
          // 한국어 IME 조합 중인 경우 무시 (한글 중복 입력 방지)
          if (
            e.key === "Enter" &&
            !e.shiftKey &&
            !e.nativeEvent.isComposing
          ) {
            e.preventDefault();
            if (isActive) onSend();
          }
        }}
        placeholder="어떻게 바꾸고 싶은지 입력해주세요."
        className="w-full resize-none bg-transparent font-pretendard text-body-1-reading font-normal text-label-normal placeholder:text-label-assistive focus:outline-none"
        /* text-body-1-reading, font-normal, text-label-assistive */
      />

      {/* 전송 버튼 — 우측 정렬 (align-self-end) */}
      <button
        type="button"
        onClick={onSend}
        disabled={!isActive}
        className={`flex size-9 shrink-0 items-center justify-center self-end rounded-full transition-colors ${
          isActive ? "bg-primary-normal" : "bg-interaction-disable"
        }`}
        /* bg-primary-normal (활성) / bg-interaction-disable (비활성) */
        aria-label="보내기"
      >
        <Image
          src="/Textinput/Button/Icon/Icon.png"
          alt=""
          width={18}
          height={18}
        />
      </button>
    </div>
  );
}

// ─── AI 메시지 블록 ───────────────────────────────────────────────────
function AiMessageBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <Image
        src="/logo_text.png"
        alt="AI 에이전트"
        width={116}
        height={20}
      />
      <div className="w-full text-body-1-reading font-bold text-label-normal">
        {children}
      </div>
    </div>
  );
}

// ─── 사용자 메시지 풍선 ────────────────────────────────────────────────
function UserMessageBubble({ text }: { text: string }) {
  return (
    <div
      className="max-w-[300px] rounded-2xl border border-line-solid-neutral bg-background-normal-alternative px-4 py-3"
      /* border-line-solid-neutral, bg-background-normal-alternative */
    >
      <p className="text-body-1-reading font-medium text-label-normal">{text}</p>
    </div>
  );
}

// ─── 수정 제안 항목 (기존/수정/이유 + 채택/유지) ──────────────────────
function RefinementItemBlock({
  item,
  onAccept,
  onKeep,
}: {
  item: RefinementItem;
  onAccept: () => void;
  onKeep: () => void;
}) {
  const stepLabel =
    item.step === 1 ? "첫 번째" : item.step === 2 ? "두 번째" : `${item.step}번째`;
  return (
    <div className="flex w-full flex-col items-start gap-5">
      {/* 제목 */}
      <h3 className="text-body-1 font-bold text-label-normal">
        {`${stepLabel}(${item.step}/${item.total}): ${item.title}`}
      </h3>

      {/* 기존 문장 */}
      <div className="flex w-full flex-col gap-1">
        <span className="text-label-2 font-medium text-label-neutral">
          기존 문장
        </span>
        <p className="w-full text-body-1 font-bold text-label-neutral">
          {item.original}
        </p>
      </div>

      {/* 수정 문장 */}
      <div className="flex w-full flex-col gap-1">
        <span className="text-label-2 font-medium text-primary-normal">
          수정 문장
        </span>
        <p className="w-full text-body-1 font-bold text-primary-normal">
          {item.revised}
        </p>
      </div>

      {/* 수정 이유 */}
      <div className="flex w-full flex-col gap-1">
        <span className="text-label-2 font-medium text-label-neutral">
          수정 이유
        </span>
        <p className="w-full text-body-1 font-normal text-label-neutral">
          {item.reason}
        </p>
      </div>

      {/* 가로 구분선 — 수정 이유 본문과 채택/유지 버튼 사이 */}
      <div className="h-px w-full bg-line-solid-normal" />

      {/* 채택/유지 버튼 */}
      <ChatActionButtons onAccept={onAccept} onKeep={onKeep} />
    </div>
  );
}

// ─── AI Chat 화면 (CM 02 후반) ────────────────────────────────────────
interface AiChatScreenProps {
  draftTitle: string;
  onScrollChange: (scrolled: boolean) => void;
}
function AiChatScreen({ draftTitle, onScrollChange }: AiChatScreenProps) {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const firstItem: RefinementItem = {
    step: 1,
    total: 2,
    title: "외부 감사 기간 표현",
    original: "외부 회계 감사 12년 연속 주요 지적 사항 0건 유지",
    revised:
      "외부 회계 감사 대응 과정에서 주요 지적 사항 없이 결산 자료의 정확성을 유지했습니다.",
    reason:
      "기간을 명시하지 않고 성과 중심으로 표현하면 더 안전하고 신뢰성 있습니다.",
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScrollChange(e.currentTarget.scrollTop > 0);
  };

  const handleSend = () => {
    const text = chatInput.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { kind: "user", text },
      { kind: "ai", text: MOCK_AI_RESPONSE.text, item: MOCK_AI_RESPONSE.item },
    ]);
    setChatInput("");
  };

  return (
    <>
      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarGutter: "stable" }}
        onScroll={handleScroll}
      >
        <div className="box-border flex w-full flex-col gap-12 px-5 py-12">
          {/* 초기 영역 — AI 메시지 + 라인 + 검토 항목 (gap-5) */}
          <div className="flex w-full flex-col items-start gap-5 self-stretch">
            <AiMessageBlock>
              <p>
                선택하신 &lsquo;{draftTitle}&rsquo;을 검토했어요.
                <br />총 2개 항목에 대해 확인이 필요해요.
              </p>
            </AiMessageBlock>

            {/* 구분선 */}
            <div className="h-px w-full bg-line-solid-normal" />

            {/* 검토 항목 */}
            <RefinementItemBlock
              item={firstItem}
              onAccept={() => console.log("accept item 1")}
              onKeep={() => console.log("keep item 1")}
            />

            {/* 사용자 직접 입력 안내 (메시지 없을 때만) */}
            {messages.length === 0 && (
              <p className="text-body-1 font-bold text-label-normal">
                수정하고 싶은 내용을 직접 입력해주셔도 좋아요.
              </p>
            )}
          </div>

          {/* 사용자 메시지 영역 — 별도 컨테이너 gap-12, items-end */}
          {messages.length > 0 && (
            <div className="flex w-full flex-col items-end gap-12 self-stretch">
              {messages.map((msg, i) => {
                if (msg.kind === "user") {
                  return <UserMessageBubble key={i} text={msg.text} />;
                }
                return (
                  <div
                    key={i}
                    className="flex w-full flex-col items-start gap-5 self-stretch"
                  >
                    <AiMessageBlock>
                      <p>{msg.text}</p>
                    </AiMessageBlock>
                    {msg.item && (
                      <>
                        <div className="h-px w-full bg-line-solid-normal" />
                        <RefinementItemBlock
                          item={msg.item}
                          onAccept={() => console.log("accept", i)}
                          onKeep={() => console.log("keep", i)}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 하단 입력창 — flex item (본문 flex-1로 늘어나 자동 하단) */}
      <div
        className="flex w-full flex-col items-center gap-5 bg-background-normal-normal px-5 pb-[calc(20px+env(safe-area-inset-bottom))]"
        /* bg-background-normal-normal */
      >
        <ChatInput
          value={chatInput}
          onChange={setChatInput}
          onSend={handleSend}
        />
      </div>
    </>
  );
}

// ─── Page export ───────────────────────────────────────────────────────
type Screen = "start" | "cm1" | "cm2-loading" | "cm2-chat";

export default function APage() {
  const [screen, setScreen] = useState<Screen>("start");
  const [selectedDraft, setSelectedDraft] = useState<number | null>(null);
  const [isChatScrolled, setIsChatScrolled] = useState(false);

  const containerStyle: React.CSSProperties =
    screen === "start"
      ? {
          background:
            "linear-gradient(184deg, #FAFFFC 0.96%, #F3FBFF 49.34%, #E8F4FF 97.71%)",
        }
      : { background: "#ffffff" }; // cm1, cm2-loading 흰 배경 + Ellipse

  return (
    <div
      className="relative isolate mx-auto flex h-screen max-h-[932px] w-full max-w-[480px] flex-col overflow-hidden"
      style={containerStyle}
    >
      {(screen === "cm1" || screen === "cm2-loading") && <BackgroundEllipses />}

      <StatusBar />
      <PageTitleBar showBorderBottom={screen === "cm2-chat" && isChatScrolled} />

      {screen === "start" && (
        <StartScreen onStart={() => setScreen("cm1")} />
      )}
      {screen === "cm1" && (
        <Cm01Screen onDraftClick={(idx) => setSelectedDraft(idx)} />
      )}
      {screen === "cm2-loading" && (
        <Cm02LoadingScreen
          draftIndex={1}
          draftTitle={DRAFT_DATA[1].title}
          onRefine={() => setScreen("cm2-chat")}
          onFinalize={() => console.log("finalize — End 화면 (Phase 3a 마무리)")}
        />
      )}
      {screen === "cm2-chat" && (
        <AiChatScreen
          draftTitle={DRAFT_DATA[1].title}
          onScrollChange={setIsChatScrolled}
        />
      )}

      <HomeBar />

      {/* 초안 상세 모달 */}
      {selectedDraft !== null && (
        <DraftDetailModal
          draftIndex={selectedDraft}
          onClose={() => setSelectedDraft(null)}
          onSelect={() => {
            setSelectedDraft(null);
            setScreen("cm2-loading");
          }}
        />
      )}
    </div>
  );
}
