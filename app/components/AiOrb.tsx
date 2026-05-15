import Image from "next/image";

interface AiOrbProps {
  /** 아이콘 크기 (px). 기본 40. AI 챗 화면의 작은 버전은 20 사용. */
  size?: number;
  className?: string;
}

/**
 * 새 디자인의 AI orb 아이콘 컴포넌트.
 *
 * - 큰 버전 (size=40): CM 01·CM 02 진입 화면 헤더 아래 중앙
 * - 작은 버전 (size=20): AI 챗 화면의 "AI 에이전트" 라벨 옆
 *
 * 출처: public/logo.png (Figma export)
 */
export function AiOrb({ size = 40, className }: AiOrbProps) {
  return (
    <Image
      src="/logo.png"
      width={size}
      height={size}
      alt=""
      priority
      className={className}
    />
  );
}
