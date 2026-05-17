"use client";

/**
 * HomeBar — A/B/C/D 공통 iOS 홈 인디케이터 mockup 컴포넌트.
 *
 * 데스크탑: 5×134 둥근 막대 mockup 표시 (iPhone 느낌).
 * 모바일(pointer: coarse): 둥근 막대만 숨김. 컨테이너 34px 높이는 유지해
 *   CTA 하단 여백이 줄어들지 않게 하고, 시스템 홈 인디케이터와도 안 겹침.
 */
export function HomeBar() {
  return (
    <div className="flex h-[34px] items-end justify-center pb-2">
      <div className="h-[5px] w-[134px] rounded-full bg-label-strong [@media(pointer:coarse)]:hidden" />
    </div>
  );
}
