"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AiOrb } from "../components/AiOrb";
import { PageTitleBar } from "../components/PageTitleBar";
import { StatusBar } from "../components/StatusBar";
import { HomeBar } from "../components/HomeBar";
import { EndScreen } from "../components/EndScreen";
import { TbdCard } from "../components/TbdCard";
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

// ─── Progress Section Component (Figma node 19757:17565) ────────────────
interface ProgressSectionProps {
  completedCount: number;
  totalCount?: number;
  isScrolled?: boolean;
}

function ProgressSection({ completedCount, totalCount = 2, isScrolled = false }: ProgressSectionProps) {
  const isFull = completedCount === totalCount;
  return (
    <div
      className="flex flex-col gap-[8px] px-[20px] pb-[12px] z-10"
      style={isScrolled ? {
        boxShadow: '0 4px 10px rgba(0,0,0,0.10)',
        overflow: 'hidden',
        clipPath: 'inset(0px -10px -10px -10px)',
      } : undefined}
    >
      <div className="flex justify-end">
        <div className={`rounded-[8px] px-[4px] py-[5px] ${isFull ? 'bg-[#E5F2FF]' : 'bg-[#FEECEC]'}`}>
          <span className={`text-[12px] font-normal leading-[16px] tracking-[0.3024px] ${isFull ? 'text-[#0066FF]' : 'text-[#E52222]'}`}>
            {completedCount}
          </span>
          <span className="text-[12px] font-normal leading-[16px] tracking-[0.3024px] text-[#989BA2]">
            /{totalCount}
          </span>
        </div>
      </div>
      <div className="relative h-[8px] w-full rounded-[9px] bg-[#171719] opacity-[0.06]">
        <div
          className="absolute left-0 top-0 h-[8px] rounded-[9px] bg-gradient-to-r from-[#0066FF] to-[#3AE6C2] transition-all duration-300"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ─── TBD placeholder 카드 (그래픽 미확정) ──────────────────────────────
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
          <h4 className="text-[18px] font-semibold leading-[26px] tracking-[-0.004px] text-label-normal">
            업무 상세
          </h4>
          <ul className="flex list-disc flex-col gap-1 pl-6">
            {data.tasks.map((task, i) => (
              <li key={i} className="text-body-1-reading text-label-neutral">
                {task}
              </li>
            ))}
          </ul>
        </div>

        <div className="h-px w-full bg-line-solid-normal" />

        <div className="flex flex-col gap-3">
          <h4 className="text-[18px] font-semibold leading-[26px] tracking-[-0.004px] text-label-normal">
            역할 및 성과
          </h4>
          <ul className="flex list-disc flex-col gap-1 pl-6">
            {data.achievements.map((item, i) => (
              <li key={i} className="text-body-1-reading text-label-neutral">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── 모달 (DraftDetail FullScreen) ───────────────────────────────────
interface DraftDetailModalProps {
  draftIndex: number;
  data: DraftData;
  dataMap: Record<number, DraftData>;
  onClose: () => void;
  onSelect: () => void;
}
function DraftDetailModal({ draftIndex, data, dataMap, onClose, onSelect }: DraftDetailModalProps) {
  // data는 부모가 draftIndex로 매핑해 넘긴 초기값. 탭 전환 시에는 dataMap[activeTab+1]을 사용한다.
  const [isVisible, setIsVisible] = useState(false);
  // 모달 열릴 때 카드 인덱스(1·2·3)에 맞는 탭(0·1·2)이 초기 활성.
  const [activeTab, setActiveTab] = useState(Math.max(0, draftIndex - 1));
  // 탭에 따라 표시될 본문 데이터. dataMap에서 가져옴.
  const activeData = dataMap[activeTab + 1] ?? data;

  // 마운트 시 페이드인 애니메이션
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  };

  return (
    <div className="absolute inset-0 z-50">
      <div
        className={`absolute inset-0 flex w-full flex-col overflow-hidden bg-static-white transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center px-4 py-4">
          <h2 className="text-heading-2 font-semibold text-label-strong">
            경력기술서 에이전트
          </h2>
        </div>

        {/* Segmented Control */}
        <div className="flex justify-center px-5 py-4">
          <div className="flex h-[40px] items-center rounded-full bg-[rgba(112,115,124,0.08)] p-[2px]">
            {["성과 중심", "직무 적합성", "경험 서사"].map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`flex-1 h-full rounded-full px-4 text-[15px] font-medium leading-[22px] tracking-[0.14px] transition-colors whitespace-nowrap ${
                  i === activeTab
                    ? "bg-white text-label-normal shadow-[0_0_4px_rgba(0,0,0,0.08)]"
                    : "text-label-alternative"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto px-5 pb-6"
          style={{ scrollbarGutter: "stable" }}
        >
          <DraftDetailBody data={activeData} />
        </div>

        {/* Bottom action */}
        <div className="flex w-full flex-col items-center px-5 py-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onSelect}
            className="w-full rounded-xl bg-primary-normal px-7 py-3.5 text-center text-headline-2 font-semibold text-static-white transition-colors hover:bg-primary-strong active:bg-primary-heavy"
          >
            이 초안 선택하기
          </button>
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

      {/* 수정 문장 — single 또는 다지선다 */}
      <div className="flex w-full flex-col gap-1">
        <span className="text-label-2 font-medium text-primary-normal">
          수정 문장
        </span>
        {item.revised && (
          <p className="w-full text-body-1 font-bold text-primary-normal">
            {item.revised}
          </p>
        )}
        {item.options && (
          <div className="flex flex-col items-start gap-1 self-stretch">
            {item.options.map((opt) => (
              <p
                key={opt.label}
                className="font-pretendard text-body-1 font-bold text-primary-normal"
                /* text-body-1, font-bold, text-primary-normal */
              >
                {`${opt.label}. ${opt.text}`}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 수정 이유 (있을 때만) */}
      {item.reason && (
        <div className="flex w-full flex-col gap-1">
          <span className="text-label-2 font-medium text-label-neutral">
            수정 이유
          </span>
          <p className="w-full text-body-1 font-normal text-label-neutral">
            {item.reason}
          </p>
        </div>
      )}

      {/* 가로 구분선 */}
      <div className="h-px w-full bg-line-solid-normal" />

      {/* 채택/유지 버튼 */}
      <ChatActionButtons item={item} onAccept={onAccept} onKeep={onKeep} />
    </div>
  );
}

// ─── AI Chat 화면 (CM 02 후반) ────────────────────────────────────────
interface AiChatScreenProps {
  draftTitle: string;
  selectedDraftData: DraftData;
  onScrollChange: (scrolled: boolean) => void;
  onFinish: () => void;
  isChatScrolled: boolean;
}
function AiChatScreen({ draftTitle, selectedDraftData, onScrollChange, onFinish, isChatScrolled }: AiChatScreenProps) {
  const draftData = selectedDraftData;
  const [completedCount, setCompletedCount] = useState(0);
  const [isFirstBadgeModified, setIsFirstBadgeModified] = useState(false);
  const [isSecondBadgeModified, setIsSecondBadgeModified] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{ kind: "user" | "ai"; content: string; sections?: Array<{ label: string; content: string }> }>>([]);
  const [achievementRevisions, setAchievementRevisions] = useState<Record<number, { original: string; revised: string; isModified: boolean }>>({});
  const totalCount = 2 + Object.keys(achievementRevisions).length;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScrollChange(e.currentTarget.scrollTop > 0);
  };

  const handleFirstBadgeTap = () => {
    if (!isFirstBadgeModified) {
      setIsFirstBadgeModified(true);
      setCompletedCount((c) => Math.min(c + 1, totalCount));
    } else {
      setIsFirstBadgeModified(false);
      setCompletedCount((c) => Math.max(c - 1, 0));
    }
  };

  const handleSecondBadgeTap = () => {
    if (!isSecondBadgeModified) {
      setIsSecondBadgeModified(true);
      setCompletedCount((c) => Math.min(c + 1, totalCount));
    } else {
      setIsSecondBadgeModified(false);
      setCompletedCount((c) => Math.max(c - 1, 0));
    }
  };

  const handleAchievementRevisionTap = (index: number) => {
    const current = achievementRevisions[index];
    if (!current) return;

    if (!current.isModified) {
      setAchievementRevisions((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          isModified: true,
        },
      }));
      setCompletedCount((c) => Math.min(c + 1, totalCount));
    } else {
      setAchievementRevisions((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          isModified: false,
        },
      }));
      setCompletedCount((c) => Math.max(c - 1, 0));
    }
  };

  const handleApplyRevision = (section: { label: string; content: string }) => {
    const parts = section.content.split("→");
    const revised = parts.length === 2 ? parts[1].trim() : section.content.trim();

    setAchievementRevisions((prev) => {
      const next = { ...prev };

      // Find first available achievement index
      let availableIndex = -1;
      draftData.achievements.forEach((achievement, index) => {
        if (next[index]) return;
        if (availableIndex === -1) availableIndex = index;
      });

      if (availableIndex !== -1) {
        next[availableIndex] = {
          original: draftData.achievements[availableIndex],
          revised,
          isModified: false,
        };
      }

      return next;
    });
  };

  const handleApplyAllRevisions = (sections: Array<{ label: string; content: string }>) => {
    const revisionSections = sections.filter(
      (section) => (section.label?.includes("수정") || section.label?.includes("적용")) && section.content
    );

    setAchievementRevisions((prev) => {
      const next = { ...prev };

      revisionSections.forEach((section) => {
        const parts = section.content.split("→");
        const revised = parts.length === 2 ? parts[1].trim() : section.content.trim();

        // Find first available achievement index
        let availableIndex = -1;
        draftData.achievements.forEach((achievement, index) => {
          if (next[index]) return;
          if (availableIndex === -1) availableIndex = index;
        });

        if (availableIndex !== -1) {
          next[availableIndex] = {
            original: draftData.achievements[availableIndex],
            revised,
            isModified: false,
          };
        }
      });

      return next;
    });
  };

  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text) return;
    if (text === "완료했어요") {
      onFinish();
      return;
    }
    setChatInput("");

    // Add user message
    setMessages((prev) => [...prev, { kind: "user", content: text }]);

    // Check for selective revision application
    if (text.includes("1안") && (text.includes("만 적용") || text.includes("으로"))) {
      // Apply only first revision section
      const lastAiMessage = messages[messages.length - 1];
      if (lastAiMessage?.kind === "ai" && lastAiMessage.sections) {
        const revisionSections = lastAiMessage.sections.filter(
          (section) => (section.label?.includes("수정") || section.label?.includes("적용")) && section.content
        );
        if (revisionSections.length > 0) {
          handleApplyRevision(revisionSections[0]);
        }
      }
    } else if (text.includes("2안") && (text.includes("만 적용") || text.includes("으로"))) {
      // Apply only second revision section
      const lastAiMessage = messages[messages.length - 1];
      if (lastAiMessage?.kind === "ai" && lastAiMessage.sections) {
        const revisionSections = lastAiMessage.sections.filter(
          (section) => (section.label?.includes("수정") || section.label?.includes("적용")) && section.content
        );
        if (revisionSections.length > 1) {
          handleApplyRevision(revisionSections[1]);
        }
      }
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((msg) => ({
              type: msg.kind === "user" ? "user" : "assistant",
              text: msg.content,
            })),
            { type: "user", text },
          ],
          prototypeType: "D",
          typeStylePrompt: "",
          userMessage: `${text}\n\n[현재 초안 내용]\n${JSON.stringify(draftData, null, 2)}`,
          currentAiDraft: draftData.achievements.join("\n"),
        }),
      });
      const data = await response.json();
      // Add AI message with sections
      setMessages((prev) => [...prev, { kind: "ai", content: data.text || "", sections: data.sections }]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleReset = () => {
    setIsFirstBadgeModified(false);
    setIsSecondBadgeModified(false);
    setAchievementRevisions({});
    setCompletedCount(0);
  };

  return (
    <>
      {/* Progress Section */}
      <ProgressSection completedCount={completedCount} totalCount={totalCount} isScrolled={isChatScrolled} />

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto px-[20px] py-[20px]"
        style={{ scrollbarGutter: "stable" }}
        onScroll={handleScroll}
      >
        <div className="flex w-full flex-col gap-[20px]">
          {/* AI Message Section */}
          <div className="flex flex-col gap-[20px] py-[28px]">
            <div className="flex flex-col gap-[16px]">
              <div className="flex items-center gap-[8px]">
                <AiOrb size={20} />
                <span className="text-[16px] font-semibold leading-[26px] tracking-[0.0912px] text-[#171719]">
                  AI 에이전트
                </span>
              </div>
              <div className="flex flex-col gap-[8px]">
                <p className="text-[16px] font-semibold leading-[26px] tracking-[0.0912px] text-[#171719]">
                  선택하신 '성과 중심 초안' 중 보완 가능한 부분을 검토했어요.
                </p>
                <p className="text-[16px] font-semibold leading-[26px] tracking-[0.0912px] text-[#171719]">
                  수정이 필요한 부분을 탭해서 바로 바꿔보세요.
                </p>
              </div>
            </div>
            <div className="h-px w-full bg-[rgba(112,115,124,0.22)]" />
          </div>

          {/* Draft Content Card */}
          <div className="flex w-full flex-col gap-[24px] overflow-hidden rounded-[16px] border border-[rgba(112,115,124,0.22)] bg-white px-[20px] py-[30px]">
            {/* Company & Period */}
            <div className="flex w-full flex-col gap-[5px] px-[4px]">
              <h3 className="text-[18px] font-semibold leading-[26px] tracking-[-0.0036px] text-[#171719]">
                {draftData.company}
              </h3>
              <p className="text-[15px] font-normal leading-[24px] tracking-[0.144px] text-[rgba(46,47,51,0.88)]">
                {draftData.period}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-[rgba(112,115,124,0.22)]" />

            {/* Project Info */}
            <div className="flex w-full flex-col gap-[12px] px-[4px]">
              <h3 className="text-[18px] font-semibold leading-[26px] tracking-[-0.0036px] text-[#171719]">
                {draftData.project}
              </h3>
              <p className="text-[16px] font-normal leading-[26px] tracking-[0.0912px] text-[rgba(46,47,51,0.88)]">
                {draftData.description}
              </p>
            </div>

            {/* Tasks */}
            <div className="flex w-full flex-col gap-[12px] px-[4px]">
              <h4 className="text-[18px] font-semibold leading-[26px] tracking-[-0.0036px] text-[#171719]">
                업무 상세
              </h4>
              <ul className="flex flex-col gap-[4px]">
                {draftData.tasks.map((task, i) => (
                  <li key={i} className="ml-[24px] list-disc text-[16px] font-normal leading-[26px] tracking-[0.0912px] text-[rgba(46,47,51,0.88)]">
                    {task}
                  </li>
                ))}
              </ul>
            </div>

            {/* Achievements */}
            <div className="flex w-full flex-col gap-[12px] px-[4px]">
              <h4 className="text-[18px] font-semibold leading-[26px] tracking-[-0.0036px] text-[#171719]">
                역할 및 성과
              </h4>
              <div className="flex flex-col gap-[4px]">
                {draftData.achievements.map((item, i) => {
                  // Check if this achievement has a revision
                  const revision = achievementRevisions[i];
                  
                  if (i === 1) {
                    return (
                      <li key={i} className="ml-[24px] list-disc text-[16px] font-normal leading-[26px] tracking-[0.0912px] text-[rgba(46,47,51,0.88)] relative" onClick={(e) => e.stopPropagation()}>
                        외부 감사{' '}
                        <span
                          onClick={handleFirstBadgeTap}
                          className="inline-block cursor-pointer transition-colors mx-0.5"
                        >
                          {isFirstBadgeModified ? (
                            <span className="bg-[#E5F2FF] px-[3px] py-0 text-[16px] font-semibold leading-[30px] tracking-[0.0912px] text-[#0066FF]">
                              대응 과정에서
                            </span>
                          ) : (
                            <span className="bg-[#FEECEC] px-[3px] py-0 text-[16px] font-semibold leading-[30px] tracking-[0.0912px] text-[#FF4242]">
                              12년 연속
                            </span>
                          )}
                        </span>
                        {' '}주요 지적 사항{' '}
                        <span
                          onClick={handleSecondBadgeTap}
                          className="inline-block cursor-pointer transition-colors mx-0.5"
                        >
                          {isSecondBadgeModified ? (
                            <span className="bg-[#E5F2FF] px-[3px] py-0 text-[16px] font-semibold leading-[30px] tracking-[0.0912px] text-[#0066FF]">
                              없이
                            </span>
                          ) : (
                            <span className="bg-[#FEECEC] px-[3px] py-0 text-[16px] font-semibold leading-[30px] tracking-[0.0912px] text-[#FF4242]">
                              0건
                            </span>
                          )}
                        </span>
                        {' '}유지
                      </li>
                    );
                  }
                  if (i === 3) {
                    return (
                      <li key={i} className="ml-[24px] list-disc text-[16px] font-normal leading-[26px] tracking-[0.0912px] text-[rgba(46,47,51,0.88)]">
                        {item}
                      </li>
                    );
                  }
                  
                  // Handle revision badge
                  if (revision) {
                    return (
                      <li key={i} className="ml-[24px] list-disc text-[16px] font-normal leading-[26px] tracking-[0.0912px] text-[rgba(46,47,51,0.88)] cursor-pointer" onClick={() => handleAchievementRevisionTap(i)}>
                        <span className={revision.isModified ? "bg-[#E5F2FF] px-[3px] py-0 text-[16px] font-semibold leading-[30px] tracking-[0.0912px] text-[#0066FF]" : "bg-[#FEECEC] px-[3px] py-0 text-[16px] font-semibold leading-[30px] tracking-[0.0912px] text-[#FF4242]"}>
                          {revision.isModified ? revision.revised : (revision.original || "")}
                        </span>
                      </li>
                    );
                  }
                  
                  return (
                    <li key={i} className="ml-[24px] list-disc text-[16px] font-normal leading-[26px] tracking-[0.0912px] text-[rgba(46,47,51,0.88)]">
                      {item}
                    </li>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full gap-[8px]">
            <button
              type="button"
              onClick={handleSend}
              className="flex h-[44px] items-center justify-center rounded-[10px] bg-[#0066FF] px-[16px] py-[8px] text-[15px] font-semibold leading-[24px] tracking-[0.144px] text-white"
            >
              이대로 반영하기
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex h-[44px] items-center justify-center rounded-[10px] border border-[#0066FF] bg-white px-[16px] py-[8px] text-[15px] font-semibold leading-[24px] tracking-[0.144px] text-[#0066FF]"
            >
              처음으로 되돌리기
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex w-full flex-col items-end gap-[48px]">
            {messages.map((message, index) => {
              if (message.kind === "user") {
                return (
                  <div key={index} className="max-w-[300px] rounded-2xl border border-[rgba(112,115,124,0.22)] bg-[#F5F5F5] px-[16px] py-[12px]">
                    <p className="text-[16px] font-medium leading-[26px] tracking-[0.0912px] text-[#171719]">
                      {message.content}
                    </p>
                  </div>
                );
              }
              if (message.kind === "ai") {
                return (
                  <div key={index} className="flex w-full flex-col items-start gap-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <AiOrb size={20} />
                      <span className="text-[16px] font-semibold leading-[26px] tracking-[0.0912px] text-[#171719]">
                        AI 에이전트
                      </span>
                    </div>
                    <p className="text-[16px] font-normal leading-[26px] tracking-[0.0912px] text-[rgba(46,47,51,0.88)]">
                      {message.content}
                    </p>
                    {message.sections && message.sections.length > 0 && (
                      <div className="flex flex-col gap-[4px]">
                        {message.sections.map((section, sectionIndex) => (
                          <p key={sectionIndex} className="text-[16px] font-normal leading-[26px] tracking-[0.0912px] text-[rgba(46,47,51,0.88)]">
                            • {section.label}: {section.content}
                          </p>
                        ))}
                        <div className="mt-[16px]">
                          {message.sections.some((section) => section.label?.includes("수정") || section.label?.includes("적용")) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (message.sections) handleApplyAllRevisions(message.sections);
                              }}
                              className="self-start rounded-[10px] border border-[#0066FF] bg-transparent px-[16px] py-[10px] text-[15px] font-semibold leading-[24px] tracking-[0.144px] text-[#0066FF]"
                            >
                              모두 적용하기
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="flex w-full flex-col items-center gap-[16px] bg-white px-[20px] py-[16px] pb-[calc(20px+env(safe-area-inset-bottom))]">
        <ChatInput value={chatInput} onChange={setChatInput} onSend={handleSend} />
      </div>
    </>
  );
}

// ─── End 화면 (Task 3 완료) ────────────────────────────────────────────
// ─── CM 01 완료 화면 ─────────────────────────────────────────────────
function Cm01CompleteScreen({ onDraftClick }: { onDraftClick: (idx: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDraftClick(1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDraftClick]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-5">
      <section className="flex flex-col items-center gap-5">
        <div className="animate-[spin_3s_linear_infinite]">
          <AiOrb size={40} />
        </div>
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
    </div>
  );
}

// ─── Page export ───────────────────────────────────────────────────────
type Screen = "start" | "cm1-complete" | "cm2-loading" | "cm2-chat" | "end";

export default function APage() {
  // 시나리오 데이터 어댑터
  const scenario = useScenario();
  const draftDataMap = useMemo<Record<number, DraftData>>(
    () => ({
      1: toDraftData(scenario.drafts[0], scenario.persona),
      2: toDraftData(scenario.drafts[1], scenario.persona),
      3: toDraftData(scenario.drafts[2], scenario.persona),
    }),
    [scenario]
  );

  const handleContinueToNextStep = () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const s = params.get("s") ?? "accounting-manager";
    const done = params.get("done") ?? "";
    const doneTypes = done.split(",").filter(Boolean);
    const currentType = "D";
    const newDone = doneTypes.includes(currentType) ? done : [...doneTypes, currentType].join(",");
    window.location.href = `/next-step?from=${currentType}&s=${s}&done=${newDone}`;
  };

  const [screen, setScreen] = useState<Screen>("start");
  const [confirmedDraftIndex, setConfirmedDraftIndex] = useState<number | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<number | null>(null);
  const [isChatScrolled, setIsChatScrolled] = useState(false);

  // 화면별 페이지 배경 — body / 상태바 영역과 동기화하기 위해 별도 변수로 추출
  const screenBackground =
    screen === "start" || screen === "end"
      ? "linear-gradient(184deg, #FAFFFC 0.96%, #F3FBFF 49.34%, #E8F4FF 97.71%)"
      : "#ffffff"; // cm1-complete, cm2-loading, cm2-chat 흰 배경 + Ellipse

  // Safari 주소창 theme-color는 단색만 지원 → 화면별 대표 색 매핑
  const screenThemeColor =
    screen === "start" || screen === "end" ? "#FAFFFC" : "#ffffff";

  // 모바일에서 시스템 상태바 영역까지 페이지 배경과 자연스럽게 이어지게 동기화
  useSyncBodyBackground(screenBackground, screenThemeColor);

  const containerStyle: React.CSSProperties = { background: screenBackground };

  return (
    <div
      className="relative isolate mx-auto flex h-screen max-h-[932px] w-full max-w-[480px] flex-col overflow-hidden"
      style={containerStyle}
    >
      {(screen === "cm1-complete" || screen === "cm2-loading" || screen === "cm2-chat") && <BackgroundEllipses />}

      <StatusBar />
      <PageTitleBar showBorderBottom={screen === "cm2-chat" && isChatScrolled} />

      {screen === "start" && (
        <StartScreen onStart={() => setScreen("cm1-complete")} />
      )}
      {screen === "cm1-complete" && (
        <Cm01CompleteScreen onDraftClick={(idx) => setSelectedDraft(idx)} />
      )}
      {screen === "cm2-loading" && (
        <Cm02LoadingScreen
          draftIndex={confirmedDraftIndex ?? 1}
          draftTitle={draftDataMap[confirmedDraftIndex ?? 1].title}
          draftDirection={scenario.drafts[(confirmedDraftIndex ?? 1) - 1].direction}
          onRefine={() => setScreen("cm2-chat")}
          onFinalize={() => setScreen("end")}
        />
      )}
      {screen === "cm2-chat" && (
        <AiChatScreen
          draftTitle={draftDataMap[confirmedDraftIndex ?? 1].title}
          selectedDraftData={draftDataMap[confirmedDraftIndex ?? 1]}
          onScrollChange={setIsChatScrolled}
          onFinish={() => setScreen("end")}
          isChatScrolled={isChatScrolled}
        />
      )}
      {screen === "end" && <EndScreen draftTitle={draftDataMap[confirmedDraftIndex ?? 1].title} draftDirection={scenario.drafts[(confirmedDraftIndex ?? 1) - 1].direction} onContinue={handleContinueToNextStep} />}

      <HomeBar />

      {/* 초안 상세 모달 */}
      {selectedDraft !== null && (
        <DraftDetailModal
          draftIndex={selectedDraft}
          data={draftDataMap[selectedDraft]}
          dataMap={draftDataMap}
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
