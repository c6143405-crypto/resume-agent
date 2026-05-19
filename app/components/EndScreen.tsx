// 공통 EndScreen (Task 3 종료 화면).
// 4가지 타입(A/B/C/D) 모두 동일한 종료 디자인을 공유한다.
//
// 일러스트는 선택한 초안의 방향(direction)에 따라 분기된다:
//  - achievement → Task 3_End_result.png
//  - fit         → Task 3_End_Job.png
//  - narrative   → Task 3_End_Experience.png
// fallback: 방향이 없으면 TbdCard(placeholder) 노출.
//
// 구성: 헤드라인 + 서브카피 → 일러스트(또는 TbdCard) → "다음 타입 시작하기" 버튼

import Image from "next/image";
import { AiOrb } from "./AiOrb";
import { TbdCard } from "./TbdCard";
import type { DraftDirection } from "../scenarios/types";

interface EndScreenProps {
  draftTitle: string;
  draftDirection?: DraftDirection;
  onContinue: () => void;
}

// 방향별 일러스트 매핑. 파일명 공백은 %20으로 인코딩.
const DIRECTION_IMAGE: Record<DraftDirection, string> = {
  achievement: "/Task%203_End_result.png",
  fit: "/Task%203_End_Job.png",
  narrative: "/Task%203_End_Experience.png",
};

export function EndScreen({ draftTitle, draftDirection, onContinue }: EndScreenProps) {
  const imageSrc = draftDirection ? DIRECTION_IMAGE[draftDirection] : null;

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
      <div className="flex flex-1 items-center justify-center px-5">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            width={1500}
            height={1512}
            priority
            quality={90}
            sizes="(max-width: 480px) 100vw, 375px"
            className="mx-auto h-auto w-full max-w-[375px]"
          />
        ) : (
          <TbdCard label={`${draftTitle} (완성 ver.)`} />
        )}
      </div>
      <div className="px-5 pb-8">
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-xl bg-[#0066FF] px-6 py-4 text-center text-base font-bold text-white transition-colors hover:bg-[#005BE6] active:bg-[#004FCC]"
        >
          다음 타입 시작하기
        </button>
      </div>
    </>
  );
}
