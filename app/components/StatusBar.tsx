"use client";

/**
 * StatusBar — A/B/C/D 공통 가짜 iOS 상태바 컴포넌트.
 *
 * 데스크탑(마우스 입력)에서만 표시되어 모바일 mockup 효과 유지.
 * 모바일(터치 입력)에서는 자동 숨김 — 시스템 상태바와 겹치지 않게.
 *
 * - `pointer: coarse` 미디어쿼리로 터치 기기 감지
 * - 9:41 + signal/wifi/battery 아이콘 (정적)
 */
export function StatusBar() {
  return (
    <div className="flex h-11 items-center justify-between px-5 text-label-strong [@media(pointer:coarse)]:hidden">
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
