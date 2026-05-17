"use client";

/**
 * PageTitleBar — A/B/C/D 공통 헤더 컴포넌트.
 *
 * Figma 스펙:
 * - 높이: 56px (h-14)
 * - 텍스트: Heading 2/Bold (20px / 600 / line-height 140% / letter-spacing -0.24px)
 *   → text-heading-2 토큰에 이미 반영됨
 * - 좌우 padding: 20px (px-5) — 모바일 mockup 안에서 텍스트가 끝에 붙지 않도록
 * - 스크롤 시 하단 border 표시
 */
interface PageTitleBarProps {
  showBorderBottom?: boolean;
}

export function PageTitleBar({ showBorderBottom = false }: PageTitleBarProps) {
  return (
    <div
      className="relative z-10 flex h-14 items-center justify-center px-5 transition-[border-color] duration-150"
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
