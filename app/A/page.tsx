"use client";

import { useEffect, useState } from "react";
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

// ─── 페이지 타이틀바 ──────────────────────────────────────────────────
function PageTitleBar() {
  return (
    <div className="flex h-11 items-center justify-center px-5">
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

// ─── TBD placeholder 카드 (Start 전용) ────────────────────────────────
function TbdCard() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-[#E73E3E] px-6 py-20 text-center">
      <p className="text-xs opacity-50 text-white mb-1">T2에서 확정한</p>
      <p className="text-5xl font-bold text-white mb-1">TBD</p>
      <p className="text-xs opacity-50 text-white">ID 카드 그래픽 디자인</p>
    </div>
  );
}

// ─── 배경 그라데이션 원 ───────────────────────────────────────────────
function BackgroundEllipses() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
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
    <div className="fixed inset-0 z-50">
      {/* Dim 배경 — viewport 전체 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={handleClose}
        className={`absolute inset-0 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: "rgba(23, 23, 25, 0.52)" }}
      />

      {/* 바텀시트 — 가운데 정렬, max-w-375 */}
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 flex w-full max-w-[375px] flex-col overflow-hidden bg-static-white transition-[height,transform] duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          height: isExpanded ? "100%" : "85%",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
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
              className="h-14 w-full rounded-2xl bg-primary-normal text-base font-bold text-static-white transition-colors hover:bg-primary-strong active:bg-primary-heavy"
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
        <h2 className="text-heading-1 text-center font-bold text-label-strong">
          선택한 직무를 바탕으로<br />
          경력기술서 초안을 만들게요
        </h2>
        <p className="text-body-1-reading text-center text-label-neutral">
          요즘 기업 표현과, 구체적 성과를 작성해요
        </p>
      </section>
      <div className="px-5">
        <TbdCard />
      </div>
      <div className="flex-1" />
      <footer className="flex w-full flex-col px-5 pb-2">
        <button
          type="button"
          onClick={onStart}
          className="h-14 w-full rounded-2xl bg-primary-normal text-base font-bold text-static-white transition-colors hover:bg-primary-strong active:bg-primary-heavy"
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
        <h2 className="text-heading-1 text-center font-bold text-label-strong">
          3가지 초안을 완성했어요
        </h2>
        <p className="text-body-1-reading text-center text-label-neutral">
          내 경험에 더 가까운 초안을 선택해주세요<br />
          부족한 부분은 AI와 함께 수정할 수 있어요
        </p>
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

// ─── Page export ───────────────────────────────────────────────────────
type Screen = "start" | "cm1";

export default function APage() {
  const [screen, setScreen] = useState<Screen>("start");
  const [selectedDraft, setSelectedDraft] = useState<number | null>(null);

  const containerStyle: React.CSSProperties =
    screen === "start"
      ? {
          background:
            "linear-gradient(184deg, #FAFFFC 0.96%, #F3FBFF 49.34%, #E8F4FF 97.71%)",
        }
      : { background: "#ffffff" };

  return (
    <div
      className="relative mx-auto flex min-h-screen w-full max-w-[375px] flex-col overflow-hidden"
      style={containerStyle}
    >
      {screen === "cm1" && <BackgroundEllipses />}

      <StatusBar />
      <PageTitleBar />

      {screen === "start" && (
        <StartScreen onStart={() => setScreen("cm1")} />
      )}
      {screen === "cm1" && (
        <Cm01Screen onDraftClick={(idx) => setSelectedDraft(idx)} />
      )}

      <HomeBar />

      {/* 초안 상세 모달 */}
      {selectedDraft !== null && (
        <DraftDetailModal
          draftIndex={selectedDraft}
          onClose={() => setSelectedDraft(null)}
          onSelect={() => {
            console.log("draft selected:", selectedDraft);
            // CM 02 진입은 Phase 3c에서
          }}
        />
      )}
    </div>
  );
}
