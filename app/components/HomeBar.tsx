"use client";

/**
 * HomeBar — A/B/C/D 공통 iOS 홈 인디케이터 mockup 컴포넌트.
 *
 * 데스크탑(마우스 입력)에서만 표시되어 iPhone mockup 효과 유지.
 * 모바일(터치 입력)에서는 자동 숨김 — 시스템 홈 인디케이터와 겹치지 않게.
 *
 * StatusBar와 동일한 `pointer: coarse` 미디어쿼리 패턴.
 */
export function HomeBar() {
  return (
    <div className="flex h-[34px] items-end justify-center pb-2 [@media(pointer:coarse)]:hidden">
      <div className="h-[5px] w-[134px] rounded-full bg-label-strong" />
    </div>
  );
}
