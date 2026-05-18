"use client";

// Next.js: useSearchParams는 Suspense 또는 dynamic 렌더링 필요
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AiOrb } from "../components/AiOrb";
import { PageTitleBar } from "../components/PageTitleBar";
import { StatusBar } from "../components/StatusBar";
import { HomeBar } from "../components/HomeBar";
import { StartScreen } from "../components/StartScreen";
import { Cm02LoadingScreen } from "../components/Cm02LoadingScreen";
import { useSyncBodyBackground } from "../hooks/useSyncBodyBackground";
import { useScenario } from "../hooks/useScenario";
import type { Draft, ScenarioPersona } from "../scenarios";

/**
 * A 타입 (미니멀 텍스트형) — 새 디자인 진행 중
 *
 * 완성: Start, CM 01 메인, CM 01 모달
 * 미완성: 초안 작성 기준 expand 토글, CM 02, End
 * 옛 디자인은 page.old.tsx에 백업
 */

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
  displayTitle: string;
  onClick?: () => void;
}
function DraftOptionCard({ index, title, displayTitle, onClick }: DraftOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative z-10 aspect-[16/25] h-full max-h-[624px] min-h-[432px] w-auto shrink-0 overflow-hidden rounded-[20px] border-4 border-[#0066FF] bg-gradient-to-br from-[#0B7CFF] via-[#1EBFF2] to-[#31D3B5] text-left shadow-[0_15px_75px_rgba(23,23,23,0.16)] transition-transform active:scale-[0.98]"
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-[16px] bg-[#EAF8FF]">
        <div className="relative flex flex-1 flex-col px-7 py-12">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-label-strong text-body-2-reading font-bold leading-none text-static-white">
            {index}
          </span>
          <h3 className="mt-7 whitespace-pre-line text-[24px] font-bold leading-[32px] tracking-[-0.55px] text-label-strong">
            {displayTitle}
          </h3>
          <div className="absolute bottom-10 right-7 flex h-[65px] w-[90px] items-center justify-center rounded-full bg-white/70 shadow-[0_12px_26px_rgba(0,102,255,0.22)]">
            <Image src="/file.png" alt="" width={34} height={34} className="opacity-70" />
          </div>
        </div>
        <div className="flex h-[70px] items-center justify-between bg-gradient-to-r from-[#0B7CFF] to-[#31D3B5] px-5">
          <span className="text-body-2-reading font-bold text-static-white">
            {title}
          </span>
          <span className="rounded-[10px] bg-white/15 px-3 py-1.5 text-caption-1 font-bold text-static-white">
            자세히 보기
          </span>
        </div>
      </div>
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

// AI Chat에서 다듬을 항목 (단일 수정안 또는 다지선다)
interface RefinementItem {
  step: number; // 1, 2 ...
  total: number; // 총 항목 수
  title: string;
  original: string;
  revised?: string; // 단일 수정안일 때
  options?: { label: string; text: string }[]; // 다지선다일 때
  reason?: string;
}

// 두 번째 검토 항목 mock (다지선다 — 첫 번째 채택/유지 후 등장)
const SECOND_REFINEMENT_ITEM: RefinementItem = {
  step: 2,
  total: 2,
  title: "프로젝트 기간 표기",
  original: "담당 업무: 2010.03 ~ 2012.02 (24개월)",
  options: [
    { label: "A", text: "정확한 기간 (24개월 운영)" },
    { label: "B", text: "연도만 (2010~2012년)" },
    { label: "C", text: "기간 생략하고 성과 중심" },
  ],
};

// 사용자 ↔ AI 메시지 히스토리
type ChatMessage =
  | { kind: "user"; text: string }
  | {
      kind: "ai";
      text: string;
      item?: RefinementItem;
      sections?: { label: string; content: string }[];
      chips?: string[];
    }
  | { kind: "confirm"; text: string; draftTitle: string };

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
// 시나리오 데이터(scenario.drafts[i])를 페이지 내부 DraftData 형식으로 변환하는 어댑터.
// 옵션 3 마이그레이션 중 기존 컴포넌트 코드를 최대한 보존하기 위해 데이터 출처만 새 시나리오로 교체한다.
function toDraftData(draft: Draft, persona: ScenarioPersona): DraftData {
  return {
    title: draft.draftTitle,
    company: persona.company,
    period: `${persona.period} · ${persona.role}`,
    project: `[프로젝트 ${draft.project.number}] ${draft.project.title}`,
    description: draft.project.description,
    tasks: draft.tasks.map((b) => b.text),
    achievements: draft.achievements.map((b) => b.text),
    criteria: {
      applied: draft.whyRecommended,
      improve: draft.caution,
    },
  };
}

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
  return (
    <div className="flex w-full flex-col gap-5 rounded-[20px] border border-line-solid-neutral bg-static-white px-6 py-7">
      <div className="flex w-full flex-col gap-2">
        <p className="text-[15px] font-semibold leading-[22px] tracking-[0.14px] text-[#005EEB]">
          초안 작성 기준
        </p>
        <p className="text-[17px] font-semibold leading-[24px] text-label-normal">
          월·연 결산 운영 경험을 성과 중심으로 정리
        </p>
      </div>
      <div className="border-l-2 border-label-disable px-4">
        <p className="text-[15px] font-normal leading-[24px] tracking-[0.14px] text-label-normal">
          {criteria.applied} {criteria.improve}
        </p>
      </div>
    </div>
  );
}

// ─── 수정된 문장 카드 (Confirm Preview 전용) ────────────────────────
function ConfirmCriteriaCard() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="flex w-full flex-col rounded-xl border p-4 transition-colors"
      style={{
        borderColor: "#EAF2FE",
        background: "linear-gradient(0deg, #F7F9FF 0%, #FCFDFE 100%), #FFF",
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center gap-3 text-left"
        aria-expanded={isOpen}
      >
        <AiOrb size={20} />
        <span className="flex-1 text-body-1 font-medium text-label-normal">
          수정된 문장
        </span>
        <span className="text-label-neutral">
          <ChevronDownIcon
            className={`transition-transform duration-300 ease-out ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="min-h-0">
          <div className="mt-4 h-px w-full bg-line-solid-normal" />
          <div className="mt-4 flex flex-col gap-4">
            {/* 기존 초안 문장 */}
            <div className="flex flex-col gap-1">
              <h5 className="text-label-1 font-medium text-label-neutral">
                기존 초안 문장
              </h5>
              <ul className="flex flex-col gap-1 pt-1">
                <li className="text-body-1-reading text-label-normal flex gap-2 px-1">
                  <span aria-hidden="true">•</span>
                  <span className="flex-1">
                    외부 감사 12년 연속 주요 지적 사항 0건 유지
                  </span>
                </li>
                <li className="text-body-1-reading text-label-normal flex gap-2 px-1">
                  <span aria-hidden="true">•</span>
                  <span className="flex-1">
                    2012.03 ~ 현재 (12년 2개월) · 회계팀 과장
                  </span>
                </li>
              </ul>
            </div>
            {/* 수정된 초안 문장 */}
            <div className="flex flex-col gap-1">
              <h5 className="text-label-1 font-medium text-label-neutral">
                수정된 초안 문장
              </h5>
              <ul className="flex flex-col gap-1 pt-1">
                <li className="text-body-1-reading text-label-normal flex gap-2 px-1">
                  <span aria-hidden="true">•</span>
                  <span className="flex-1">
                    외부 회계 감사 대응 과정에서 주요 지적 사항 없이 결산 자료의 정확성을 유지
                  </span>
                </li>
                <li className="text-body-1-reading text-label-normal flex gap-2 px-1">
                  <span aria-hidden="true">•</span>
                  <span className="flex-1">
                    2012.03 ~ 2024.05 · 회계팀 과장
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Preview 본문 (수정 부분 파란색, weight medium) ────────────
function ConfirmPreviewBody() {
  return (
    <div className="flex flex-col gap-6 pb-12 pt-9">
      {/* 회사명 + 기간 (기간만 파란색) */}
      <div className="flex flex-col gap-1 px-1">
        <h3 className="text-headline-1 font-bold text-label-normal">
          (주) A 의류 유통 기업
        </h3>
        <p className="text-body-2-reading font-medium text-primary-normal">
          2012.03 ~ 2024.05 · 회계팀 과장
        </p>
        <div className="mt-5 h-px w-full bg-line-solid-normal" />
      </div>

      {/* 프로젝트 */}
      <div className="flex flex-col gap-3 px-1">
        <h3 className="text-headline-1 font-bold text-label-normal">
          [프로젝트 1] 월·연 결산 마감 프로세스 운영
        </h3>
        <p className="text-body-1-reading font-medium text-label-normal">
          직원 30명 연매출 120억 원 규모의 의류 유통 기업에서 월·연 결산 마감을 12년간 전담했습니다.
        </p>
      </div>

      {/* 업무 상세 */}
      <div className="flex flex-col gap-1 px-1">
        <h4 className="text-headline-1 font-bold text-label-normal">업무 상세</h4>
        <ul className="flex flex-col gap-1 pt-3">
          {[
            "매월 결산 마감 일정 관리",
            "외부 회계 감사 대응",
            "부가세·법인세 신고 자료 정리",
            "결산 종료 후 대표 보고 자료 작성",
          ].map((task, i) => (
            <li
              key={i}
              className="text-body-1-reading font-medium text-label-normal flex gap-2 px-1"
            >
              <span aria-hidden="true">•</span>
              <span className="flex-1">{task}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 역할 및 성과 (두 번째 항목 파란색) */}
      <div className="flex flex-col gap-1 px-1">
        <h4 className="text-headline-1 font-bold text-label-normal">역할 및 성과</h4>
        <ul className="flex flex-col gap-1 pt-3">
          <li className="text-body-1-reading font-medium text-label-normal flex gap-2 px-1">
            <span aria-hidden="true">•</span>
            <span className="flex-1">
              매입·매출 전표 월 평균 1,500여 건 처리 및 검증
            </span>
          </li>
          <li className="text-body-1-reading font-medium flex gap-2 px-1 text-primary-normal">
            <span aria-hidden="true">•</span>
            <span className="flex-1">
              외부 회계 감사 대응 과정에서 주요 지적 사항 없이 결산 자료의 정확성을 유지
            </span>
          </li>
          <li className="text-body-1-reading font-medium text-label-normal flex gap-2 px-1">
            <span aria-hidden="true">•</span>
            <span className="flex-1">신고 자료 정확도 99% 수준 유지</span>
          </li>
          <li className="text-body-1-reading font-medium text-label-normal flex gap-2 px-1">
            <span aria-hidden="true">•</span>
            <span className="flex-1">
              결산 마감 일정을 평균 5영업일 이내로 관리
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// ─── Confirm Preview Modal (CTA 없음) ──────────────────────────────────
interface ConfirmPreviewModalProps {
  draftIndex: number;
  draftTitle: string;
  onClose: () => void;
}
function ConfirmPreviewModal({
  draftIndex,
  draftTitle,
  onClose,
}: ConfirmPreviewModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 20 && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  };

  return (
    <div className="absolute inset-0 z-50">
      <button
        type="button"
        aria-label="닫기"
        onClick={handleClose}
        className={`absolute inset-0 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: "rgba(23, 23, 25, 0.52)" }}
      />

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
        <div className="flex justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-line-solid-strong" />
        </div>

        <div className="flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-label-strong text-label-1 font-bold leading-none text-static-white">
              {draftIndex}
            </span>
            <h2 className="text-heading-2 font-bold text-label-strong">
              {draftTitle}
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

        <div
          className="flex-1 overflow-y-auto px-5"
          style={{ scrollbarGutter: "stable" }}
          onScroll={handleScroll}
        >
          <ConfirmCriteriaCard />
          <ConfirmPreviewBody />
        </div>

        {/* CTA 없음 — Confirm Preview는 정보 표시만 */}
      </div>
    </div>
  );
}

// ─── 모달 본문 (상세 내용) ────────────────────────────────────────────
function DraftDetailBody({ data }: { data: DraftData }) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-line-solid-neutral bg-static-white">
      <div className="flex w-full flex-col gap-1 bg-[#F4F4F5] p-6">
        <h3 className="text-[17px] font-semibold leading-[24px] text-label-normal">
          {data.company}
        </h3>
        <p className="text-[15px] font-normal leading-[24px] tracking-[0.14px] text-label-neutral">
          {data.period}
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 p-6">
        <div className="flex w-fit rounded-lg px-2 py-[5px] text-[13px] font-medium leading-[18px] tracking-[0.25px] text-[#005EEB] bg-[#005EEB14]">
          프로젝트 01
        </div>
        <h3 className="text-[17px] font-semibold leading-[24px] text-label-normal">
          {data.project.replace(/^\[프로젝트 1\]\s*/, "")}
        </h3>
        <div className="border-l-2 border-label-disable px-4">
          <p className="text-body-1-reading text-label-normal">
            {data.description}
          </p>
        </div>

        <div className="h-px w-full bg-line-solid-normal" />

        <div className="flex flex-col gap-3">
          <h4 className="text-[17px] font-semibold leading-[24px] text-label-normal">
            업무 상세
          </h4>
          <ol className="flex list-decimal flex-col gap-2 border-l-2 border-label-disable pl-8">
            {data.tasks.map((task, i) => (
              <li key={i} className="text-body-1-reading text-label-normal">
                {task}
              </li>
            ))}
          </ol>
        </div>

        <div className="h-px w-full bg-line-solid-normal" />

        <div className="flex flex-col gap-3">
          <h4 className="text-[17px] font-semibold leading-[24px] text-label-normal">
            역할 및 성과
          </h4>
          <ol className="flex list-decimal flex-col gap-2 border-l-2 border-label-disable pl-8">
            {data.achievements.map((item, i) => (
              <li key={i} className="text-body-1-reading text-label-normal">
                {item}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ─── 모달 (DraftDetail BottomSheet) ───────────────────────────────────
interface DraftDetailModalProps {
  draftIndex: number;
  data: DraftData;
  onClose: () => void;
  onSelect: () => void;
}
function DraftDetailModal({ draftIndex, data, onClose, onSelect }: DraftDetailModalProps) {
  // data는 부모(APage)가 draftDataMap[draftIndex]로 미리 매핑해 prop으로 전달한다.
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
      <div
        className={`absolute inset-0 flex w-full flex-col overflow-hidden bg-background-normal-alternative transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-start justify-center px-4 py-6">
          <div className="flex min-w-0 flex-1 items-center gap-4">
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
          className="flex-1 overflow-y-auto px-5 pb-6"
          style={{ scrollbarGutter: "stable" }}
          onScroll={handleScroll}
        >
          <div className="flex flex-col gap-4 pt-4">
            <DraftCriteriaCard criteria={data.criteria} />
            <DraftDetailBody data={data} />
          </div>
        </div>

        <div className="relative w-full">
          <div className="flex flex-col items-center px-5 py-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onSelect}
              className="rounded-xl bg-primary-normal px-7 py-3.5 text-center text-headline-2 font-bold text-static-white shadow-[0_15px_75px_rgba(23,23,23,0.16)] transition-colors hover:bg-primary-strong active:bg-primary-heavy"
            >
              이 초안 선택하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CM 01 화면 (3가지 초안) ──────────────────────────────────────────
interface Cm01ScreenProps {
  onDraftClick: (draftIndex: number) => void;
}
function Cm01Screen({ onDraftClick }: Cm01ScreenProps) {
  const drafts = [
    { index: 1, title: "성과 중심 초안", displayTitle: "성과 중심으로\n정리한 경험" },
    { index: 2, title: "직무 적합 중심 초안", displayTitle: "직무 적합성을\n강조한 경험" },
    { index: 3, title: "경험 서사 중심 초안", displayTitle: "경험 흐름으로\n풀어낸 이야기" },
  ];

  return (
    <>
      <section className="relative z-10 flex flex-col items-center gap-2 px-5 pb-12 pt-12">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-center text-[22px] font-semibold leading-[30px] tracking-[-0.43px] text-label-strong">
            3가지 초안을 완성했어요
          </h2>
          <p className="text-center text-[16px] font-normal leading-[24px] tracking-[0.09px] text-label-neutral">
            내 경험에 더 가까운 초안을 선택해주세요<br />
            부족한 부분은 AI와 함께 수정할 수 있어요
          </p>
        </div>
      </section>

      <div className="relative z-10 -mx-5 flex flex-1 items-center overflow-hidden">
        <div className="flex h-full snap-x snap-mandatory items-center gap-[20px] overflow-x-auto px-[calc((100%_-_307px)/2)] py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {drafts.map((d) => (
            <div key={d.index} className="snap-center">
              <DraftOptionCard
                index={d.index}
                title={d.title}
                displayTitle={d.displayTitle}
                onClick={() => onDraftClick(d.index)}
              />
            </div>
          ))}
        </div>
      </div>

      <footer className="relative z-10 flex w-full flex-col items-center px-5 pb-2">
        <button
          type="button"
          onClick={() => onDraftClick(1)}
          className="rounded-xl bg-primary-normal px-7 py-3.5 text-center text-headline-2 font-bold text-static-white transition-colors hover:bg-primary-strong active:bg-primary-heavy"
        >
          이 초안 선택하기
        </button>
      </footer>
    </>
  );
}

// ─── 채택/유지 버튼 그룹 (single / multi-choice 분기) ────────────────
function ChatActionButtons({
  item,
  onAccept,
  onKeep,
}: {
  item: RefinementItem;
  onAccept: (label?: string) => void;
  onKeep: () => void;
}) {
  // 다지선다 — A/B/C 채택 + 기존 유지
  if (item.options) {
    return (
      <div className="flex flex-row flex-wrap items-center gap-2">
        {item.options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => onAccept(opt.label)}
            className="rounded-[10px] bg-primary-normal px-4 py-2.5 text-body-2-reading font-bold text-static-white transition-colors hover:bg-primary-strong"
          >
            {opt.label} 채택
          </button>
        ))}
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
  // 단일 수정안 — 수정 문장 채택 / 기존 유지
  return (
    <div className="flex flex-row items-center gap-2">
      <button
        type="button"
        onClick={() => onAccept()}
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

function AiResponseSectionCard({
  label,
  content,
}: {
  label: string;
  content: string;
}) {
  return (
    <section className="flex w-full flex-col gap-3 rounded-2xl border border-line-solid-neutral bg-red-500 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2">
        <Image
          src="/file.png"
          alt=""
          width={20}
          height={20}
          className="opacity-60"
        />
        <h3 className="text-body-2-reading font-medium text-label-neutral">
          {label}
        </h3>
      </div>
      <p className="whitespace-pre-line text-body-1-reading font-bold text-label-normal">
        {content}
      </p>
    </section>
  );
}

function AiResponseSections({
  sections,
}: {
  sections: { label: string; content: string }[];
}) {
  return (
    <div className="mt-5 flex w-full flex-col gap-3">
      {sections.map((section, sectionIndex) => (
        <AiResponseSectionCard
          key={sectionIndex}
          label={section.label}
          content={section.content}
        />
      ))}
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

// ─── Confirm 메시지 블록 (모두 반영 + 초안 미리보기 + 두 버튼) ─────────
function ConfirmMessageBlock({
  text,
  draftTitle,
  onReview,
  onFinish,
  onPreviewClick,
}: {
  text: string;
  draftTitle: string;
  onReview: () => void;
  onFinish: () => void;
  onPreviewClick: () => void;
}) {
  // text를 \n 기준으로 줄 분리 (빈 줄도 유지)
  const lines = text.split("\n");
  return (
    <div className="flex w-full flex-col items-start gap-5 self-stretch">
      {/* AI 메시지 (줄바꿈 처리) */}
      <AiMessageBlock>
        {lines.map((line, i) => (
          <p key={i}>{line || "\u00A0"}</p>
        ))}
      </AiMessageBlock>

      {/* 가로 구분선 */}
      <div className="h-px w-full bg-line-solid-normal" />

      {/* 초안 미리보기 카드 */}
      <div className="flex w-full flex-col items-start gap-2 self-stretch">
        <span className="text-label-2 font-medium text-primary-normal">
          초안 미리보기
        </span>
        <button
          type="button"
          onClick={onPreviewClick}
          className="flex w-full items-center gap-2 self-stretch rounded-xl border border-[#E8EEF5] bg-static-white p-4 transition-colors hover:bg-fill-alternative"
        >
          <span className="flex-1 text-left text-body-1 font-bold text-label-normal">
            {draftTitle}
          </span>
          <Image
            src="/file.png"
            alt=""
            width={20}
            height={20}
            className="opacity-50"
          />
        </button>
      </div>

      {/* 두 버튼 */}
      <div className="flex flex-row items-center gap-2">
        <button
          type="button"
          onClick={onReview}
          className="rounded-[10px] bg-primary-normal px-4 py-2.5 text-body-2-reading font-bold text-static-white transition-colors hover:bg-primary-strong"
        >
          추가 검토하기
        </button>
        <button
          type="button"
          onClick={onFinish}
          className="rounded-[10px] border border-primary-normal bg-transparent px-4 py-2.5 text-body-2-reading font-bold text-primary-normal transition-colors hover:bg-primary-normal/5"
        >
          최종 단계로 넘어가기
        </button>
      </div>
    </div>
  );
}

// ─── 수정 제안 항목 (single / multi-choice) ────────────────────────
function RefinementItemBlock({
  item,
  onAccept,
  onKeep,
}: {
  item: RefinementItem;
  onAccept: (label?: string) => void;
  onKeep: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <p className="text-body-1-reading font-bold text-label-neutral">
        {item.step}/{item.total}
      </p>

      <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-line-solid-neutral bg-static-white">
        <div className="flex w-full flex-col gap-3 px-6 py-5">
          <span className="text-body-2-reading font-medium text-label-neutral">
            기존 문장
          </span>
          <p className="w-full whitespace-pre-line text-body-1-reading font-bold text-label-normal">
            {item.original}
          </p>
        </div>

        <div className="h-px w-full bg-line-solid-normal" />

        <div className="flex w-full flex-col gap-3 px-6 py-5">
          <span className="text-body-2-reading font-medium text-label-neutral">
            수정 문장
          </span>
          {item.revised && (
            <p className="w-full whitespace-pre-line text-body-1-reading font-bold text-primary-normal">
              {item.revised}
            </p>
          )}
          {item.options && (
            <div className="flex flex-col items-start gap-1 self-stretch">
              {item.options.map((opt) => (
                <p
                  key={opt.label}
                  className="font-pretendard text-body-1-reading font-bold text-primary-normal"
                >
                  {`${opt.label} ${opt.text}`}
                </p>
              ))}
            </div>
          )}
          {item.reason && (
            <p className="w-full rounded-xl bg-background-normal-alternative px-4 py-3 text-body-2-reading font-medium text-label-neutral">
              {item.reason}
            </p>
          )}
        </div>
      </div>

      <ChatActionButtons item={item} onAccept={onAccept} onKeep={onKeep} />
    </div>
  );
}

// ─── AI Chat 화면 (CM 02 후반) ────────────────────────────────────────
interface AiChatScreenProps {
  draftTitle: string;
  selectedDraftData: DraftData;
  draftOptionsMap: Record<number, DraftData>;
  onScrollChange: (scrolled: boolean) => void;
  onFinish: () => void;
}
function AiChatScreen({ draftTitle, selectedDraftData, draftOptionsMap, onScrollChange, onFinish }: AiChatScreenProps) {
  const prototypeType = "C";
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [confirmPreviewOpen, setConfirmPreviewOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [firstItem, setFirstItem] = useState<RefinementItem>({
    step: 1,
    total: 2,
    title: "외부 감사 기간 표현",
    original: "외부 회계 감사 12년 연속 주요 지적 사항 0건 유지",
    revised:
      "외부 회계 감사 대응 과정에서 주요 지적 사항 없이 결산 자료의 정확성을 유지했습니다.",
    reason:
      "기간을 명시하지 않고 성과 중심으로 표현하면 더 안전하고 신뢰성 있습니다.",
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScrollChange(e.currentTarget.scrollTop > 0);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages]);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? chatInput).trim();
    if (!text) return;
    if (text === "최종 확정" || text === "최종확정") {
      handleFinalConfirm();
      return;
    }
    if (text === "완료했어요") {
      onFinish();
      return;
    }
    setChatInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              type: "assistant",
              text: [
                "현재 사용자가 수정 중인 검토 항목입니다.",
                `항목명: ${firstItem.title}`,
                `기존 문장: ${firstItem.original}`,
                `현재 수정 문장: ${firstItem.revised ?? ""}`,
                "사용자가 '3건이야', '아니 3건', '12년은 아니야'처럼 짧게 정정하면 이 항목의 수치나 표현을 고치려는 뜻으로 해석하세요.",
              ].join("\n"),
            },
            ...messages.map((msg) => ({
              type: msg.kind === "user" ? "user" : "assistant",
              text: msg.text,
            })),
            { type: "user", text },
          ],
          currentStep: "CM2",
          prototypeType,
          typeStylePrompt: "",
          userIntent: "MODIFY_CONTENT",
          userMessage: [
            text,
            "",
            "[현재 수정 대상]",
            `항목명: ${firstItem.title}`,
            `기존 문장: ${firstItem.original}`,
            `현재 수정 문장: ${firstItem.revised ?? ""}`,
          ].join("\n"),
          currentAiDraft: firstItem.revised ?? firstItem.original,
          selectedDraft: {
            draftId: "1",
            draftTitle: selectedDraftData.title,
            draftContent: [
              selectedDraftData.company,
              selectedDraftData.period,
              selectedDraftData.project,
              selectedDraftData.description,
              ...selectedDraftData.tasks,
              ...selectedDraftData.achievements,
            ].join("\n"),
            draftDirection: selectedDraftData.title,
            whyRecommended: selectedDraftData.criteria.applied,
            caution: selectedDraftData.criteria.improve,
          },
          draftOptions: Object.entries(draftOptionsMap).map(([draftId, draft]) => ({
            draftId,
            draftTitle: draft.title,
            draftContent: [
              draft.company,
              draft.period,
              draft.project,
              draft.description,
              ...draft.tasks,
              ...draft.achievements,
            ].join("\n"),
            draftDirection: draft.title,
            whyRecommended: draft.criteria.applied,
            caution: draft.criteria.improve,
          })),
        }),
      });

      const data = await response.json();
      console.log("[/api/chat] response:", data);
      if (!response.ok) {
        throw new Error(data?.detail || data?.error || "AI 응답 생성에 실패했습니다.");
      }
      const revisedSection = Array.isArray(data.sections)
        ? data.sections.find(
            (section: { label?: unknown; content?: unknown }) =>
              typeof section.label === "string" &&
              section.label.includes("수정") &&
              typeof section.content === "string" &&
              section.content.trim().length > 0
          )
        : null;
      if (revisedSection) {
        setFirstItem((prev) => ({
          ...prev,
          revised: String(revisedSection.content).trim(),
        }));
      }
      setMessages((prev) => [
        ...prev,
        { kind: "user", text },
        {
          kind: "ai",
          text: String(data.text || ""),
          sections: Array.isArray(data.sections) ? data.sections : [],
          chips: Array.isArray(data.chips) ? data.chips.map(String) : [],
        },
      ]);
    } catch (error) {
      console.error("[/api/chat] request failed:", error);
      setMessages((prev) => [
        ...prev,
        { kind: "user", text },
        {
          kind: "ai",
          text: "지금 AI 응답을 가져오지 못했어요. 잠시 후 다시 시도해주세요.",
        },
      ]);
    }
  };

  const handleFinalConfirm = () => {
    setMessages((prev) => [
      ...prev,
      {
        kind: "ai",
        text: "최종 확정된 내용을 확인해주세요.",
        sections: [
          {
            label: "최종 확정 문장",
            content: firstItem.revised ?? firstItem.original,
          },
          {
            label: "반영 기준",
            content: firstItem.reason ?? "",
          },
        ],
        chips: ["완료했어요"],
      },
    ]);
  };

  // 첫 번째 채택/유지 → "좋아요. 다음 항목을 볼게요." + 두 번째 항목 추가
  const handleFirstResolve = () => {
    const alreadyHasSecond = messages.some(
      (m) => m.kind === "ai" && m.item?.step === 2
    );
    if (alreadyHasSecond) return;
    setMessages((prev) => [
      ...prev,
      {
        kind: "ai",
        text: "좋아요. 다음 항목을 볼게요.",
        item: SECOND_REFINEMENT_ITEM,
      },
    ]);
  };

  // 두 번째 채택/유지 → confirm 메시지 추가
  const handleSecondResolve = () => {
    const alreadyHasConfirm = messages.some((m) => m.kind === "confirm");
    if (alreadyHasConfirm) return;
    setMessages((prev) => [
      ...prev,
      {
        kind: "confirm",
        text: "2가지 수정 사항이 모두 반영되었어요.\n\n초안을 더 수정할까요?\n최종 마무리 단계로 넘어갈까요?",
        draftTitle,
      },
    ]);
  };

  return (
    <>
      {/* Scrollable content */}
      <div
        ref={scrollContainerRef}
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
              onAccept={() => handleFirstResolve()}
              onKeep={() => handleFirstResolve()}
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
                if (msg.kind === "confirm") {
                  return (
                    <ConfirmMessageBlock
                      key={i}
                      text={msg.text}
                      draftTitle={msg.draftTitle}
                      onReview={() =>
                        setMessages((prev) => [
                          ...prev,
                          {
                            kind: "ai",
                            text: "좋아요. 추가로 검토하고 싶은 문장이나 방향을 입력해주세요.",
                            chips: [
                              "표현을 더 간결하게",
                              "성과 중심으로 바꾸기",
                              "과장된 표현 줄이기",
                            ],
                          },
                        ])
                      }
                      onFinish={handleFinalConfirm}
                      onPreviewClick={() => setConfirmPreviewOpen(true)}
                    />
                  );
                }
                // ai
                console.log('sections:', msg.sections, 'text:', msg.text);
                const step = msg.item?.step;
                const resolve =
                  step === 2 ? handleSecondResolve : handleFirstResolve;
                return (
                  <div
                    key={i}
                    className="flex w-full flex-col items-start gap-5 self-stretch"
                  >
                    <AiMessageBlock>
                      <p>{msg.text}</p>
                      {msg.sections && msg.sections.length > 0 && (
                        <AiResponseSections
                          sections={msg.sections}
                        />
                      )}
                      {msg.chips && msg.chips.length > 0 && (
                        <div className="mt-5 flex flex-row flex-wrap gap-2">
                          {msg.chips.map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => handleSend(chip)}
                              className="rounded-[10px] border border-primary-normal bg-transparent px-4 py-2.5 text-body-2-reading font-bold text-primary-normal transition-colors hover:bg-primary-normal/5"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </AiMessageBlock>
                    {msg.item && (
                      <>
                        <div className="h-px w-full bg-line-solid-normal" />
                        <RefinementItemBlock
                          item={msg.item}
                          onAccept={() => resolve()}
                          onKeep={() => resolve()}
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

      {/* Confirm 미리보기 모달 (CTA 없음) */}
      {confirmPreviewOpen && (
        <ConfirmPreviewModal
          draftIndex={1}
          draftTitle={draftTitle}
          onClose={() => setConfirmPreviewOpen(false)}
        />
      )}
    </>
  );
}

// ─── End 화면 (Task 3 완료) ────────────────────────────────────────────
function EndScreen({ draftTitle }: { draftTitle: string }) {
  return (
    <>
      <section className="flex flex-col items-center gap-5 px-5 py-12">
        <AiOrb size={40} />
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-heading-1 text-center font-bold text-label-strong">
            경력기술서 초안 작성을 완료했어요
          </h2>
          <p className="text-body-1-reading text-center text-label-neutral">
            다음 단계에서 경력기술서를 최종 마무리할게요
          </p>
        </div>
      </section>
      <div className="px-5">
        <TbdCard label={`${draftTitle} (완성 ver.)`} />
      </div>
      <div className="flex-1" />
    </>
  );
}

// ─── Page export ───────────────────────────────────────────────────────
type Screen = "start" | "cm1" | "cm2-loading" | "cm2-chat" | "end";

export default function APage() {
  // ─── 3.4a: 시나리오 데이터 어댑터 ─────────────────────────────────
  // URL 파라미터(?s=<scenarioId>)에서 현재 시나리오를 받아오고,
  // 기존 페이지 코드가 기대하는 DraftData 형식으로 변환해 draftDataMap에 담는다.
  const scenario = useScenario();
  const draftDataMap = useMemo<Record<number, DraftData>>(
    () => ({
      1: toDraftData(scenario.drafts[0], scenario.persona),
      2: toDraftData(scenario.drafts[1], scenario.persona),
      3: toDraftData(scenario.drafts[2], scenario.persona),
    }),
    [scenario]
  );

  const [screen, setScreen] = useState<Screen>("start");
  const [selectedDraft, setSelectedDraft] = useState<number | null>(null);
  // ─── 3.5: CM2 진입 시점에 확정된 초안 인덱스 보존 ───────────────
  // selectedDraft는 모달 표시/닫힘용이라 onSelect에서 null로 리셋되지만,
  // 이 값은 사용자가 실제로 CM2로 가져간 초안 인덱스를 기억해 chat API에 전달한다.
  const [confirmedDraftIndex, setConfirmedDraftIndex] = useState<number | null>(null);
  const [isChatScrolled, setIsChatScrolled] = useState(false);

  // 화면별 페이지 배경 — body / 상태바 영역과 동기화하기 위해 별도 변수로 추출
  const screenBackground =
    screen === "start" || screen === "end" || screen === "cm1"
      ? "linear-gradient(184deg, #FAFFFC 0.96%, #F3FBFF 49.34%, #E8F4FF 97.71%)"
      : "#ffffff"; // cm2-loading, cm2-chat 흰 배경 + Ellipse

  // Safari 주소창 theme-color는 단색만 지원 → 화면별 대표 색 매핑
  const screenThemeColor =
    screen === "start" || screen === "end" || screen === "cm1" ? "#FAFFFC" : "#ffffff";

  // 모바일에서 시스템 상태바 영역까지 페이지 배경과 자연스럽게 이어지게 동기화
  useSyncBodyBackground(screenBackground, screenThemeColor);

  const containerStyle: React.CSSProperties = { background: screenBackground };

  return (
    <div
      className="relative isolate mx-auto flex h-screen max-h-[932px] w-full max-w-[480px] flex-col overflow-hidden"
      style={containerStyle}
    >
      {(screen === "cm1" || screen === "cm2-loading" || screen === "cm2-chat") && <BackgroundEllipses />}

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
          draftTitle={draftDataMap[confirmedDraftIndex ?? 1].title}
          onRefine={() => setScreen("cm2-chat")}
          onFinalize={() => console.log("finalize — End 화면 (Phase 3a 마무리)")}
        />
      )}
      {screen === "cm2-chat" && (
        <AiChatScreen
          draftTitle={draftDataMap[confirmedDraftIndex ?? 1].title}
          selectedDraftData={draftDataMap[confirmedDraftIndex ?? 1]}
          draftOptionsMap={draftDataMap}
          onScrollChange={setIsChatScrolled}
          onFinish={() => setScreen("end")}
        />
      )}
      {screen === "end" && <EndScreen draftTitle={draftDataMap[confirmedDraftIndex ?? 1].title} />}

      <HomeBar />

      {/* 초안 상세 모달 */}
      {selectedDraft !== null && (
        <DraftDetailModal
          draftIndex={selectedDraft}
          data={draftDataMap[selectedDraft]}
          onClose={() => setSelectedDraft(null)}
          onSelect={() => {
            setConfirmedDraftIndex(selectedDraft);
            setSelectedDraft(null);
            setScreen("cm2-loading");
          }}
        />
      )}
    </div>
  );
}
