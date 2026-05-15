"use client";

import { AiOrb } from "../components/AiOrb";

/**
 * A 타입 (미니멀 텍스트형) — 새 디자인 진행 중
 *
 * 현재 완성된 화면: Start (Task 3 진입)
 * 미완성: CM 01 (3개 초안), CM 02 (AI 챗), End
 * 옛 디자인은 page.old.tsx에 백업되어 있음
 */

// ─── 9:41 가짜 상태바 (iOS 모바일 mockup용) ─────────────────────────
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

// ─── 페이지 타이틀바 (height 44, padding 0 20) ────────────────────────
function PageTitleBar() {
  return (
    <div className="flex h-11 items-center justify-center px-5">
      <h1 className="text-heading-2 font-bold text-label-strong">
        경력기술서 에이전트
      </h1>
    </div>
  );
}

// ─── TBD placeholder 카드 (그래픽 미확정) ──────────────────────────────
function TbdCard() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-[#E73E3E] px-6 py-20 text-center">
      <p className="text-xs opacity-50 text-white mb-1">T2에서 확정한</p>
      <p className="text-5xl font-bold text-white mb-1">TBD</p>
      <p className="text-xs opacity-50 text-white">ID 카드 그래픽 디자인</p>
    </div>
  );
}

// ─── iOS 홈바 (하단 중앙, 134 × 5) ────────────────────────────────────
function HomeBar() {
  return (
    <div className="flex h-[34px] items-end justify-center pb-2">
      <div className="h-[5px] w-[134px] rounded-full bg-label-strong" />
    </div>
  );
}

// ─── Page export ───────────────────────────────────────────────────────
export default function APage() {
  return (
    <div
      className="mx-auto flex min-h-screen w-full max-w-[375px] flex-col"
      style={{
        background:
          "linear-gradient(184deg, #FAFFFC 0.96%, #F3FBFF 49.34%, #E8F4FF 97.71%)",
      }}
    >
      {/* Header */}
      <StatusBar />
      <PageTitleBar />

      {/* Contents — orb + 헤드라인 + 본문 */}
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

      {/* TBD 카드 */}
      <div className="px-5">
        <TbdCard />
      </div>

      {/* spacer — footer 하단 밀기 */}
      <div className="flex-1" />

      {/* Action area — 초안 만들기 버튼 */}
      <footer className="flex w-full flex-col px-5 pb-2">
        <button
          type="button"
          className="h-14 w-full rounded-2xl bg-primary-normal text-base font-bold text-static-white transition-colors hover:bg-primary-strong active:bg-primary-heavy"
        >
          초안 만들기
        </button>
      </footer>

      {/* iOS 홈바 */}
      <HomeBar />
    </div>
  );
}
