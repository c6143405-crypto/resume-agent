"use client";

import Image from "next/image";
import { AiOrb } from "./AiOrb";
import type { DraftDirection } from "../scenarios/types";

/**
 * Cm02LoadingScreen — A/B/C/D 공통 CM 02 진입 화면.
 * 선택한 초안의 방향(성과/직무/경험)에 따라 헤드라인·서브카피·일러스트가 분기된다.
 *
 * 일러스트 매핑 (public/):
 *  - achievement → CM 02_loading_Result.png
 *  - fit         → CM 02_loading_Job.png
 *  - narrative   → CM 02_loading_Experience.png
 * fallback: 방향 정보가 없을 때만 CM02_loading.png 사용.
 */
interface Cm02LoadingScreenProps {
  draftIndex: number;
  draftTitle: string;
  draftDirection?: DraftDirection;
  onRefine: () => void;
  onFinalize: () => void;
}

// 방향별 카피·이미지 매핑.
// 파일명 공백은 %20으로 인코딩한다 (next/image src에서 안전).
const DIRECTION_CONFIG: Record<
  DraftDirection,
  { label: string; subCopy: string; image: string }
> = {
  achievement: {
    label: "성과 중심",
    subCopy: "수치와 결과가 더 살아나도록 AI와 다듬어 볼게요",
    image: "/CM%2002_loading_Result.png",
  },
  fit: {
    label: "직무 적합 중심",
    subCopy: "직무 역량이 더 잘 드러나도록 AI와 다듬어 볼게요",
    image: "/CM%2002_loading_Job.png",
  },
  narrative: {
    label: "경험 서사 중심",
    subCopy: "경험의 흐름이 자연스럽게 이어지도록 AI와 다듬어 볼게요",
    image: "/CM%2002_loading_Experience.png",
  },
};

export function Cm02LoadingScreen({
  draftIndex,
  draftDirection,
  onRefine,
  onFinalize,
}: Cm02LoadingScreenProps) {
  const config = draftDirection ? DIRECTION_CONFIG[draftDirection] : null;
  const headline = config
    ? `${draftIndex}번 ${config.label} 초안을 선택했어요`
    : `${draftIndex}번 초안을 선택했어요`;
  const subCopy = config
    ? config.subCopy
    : "내용을 AI와 함께 더 다듬을 수 있어요";
  const imageSrc = config ? config.image : "/CM02_loading.png";

  return (
    <>
      <section className="flex flex-col items-center gap-5 px-5 pt-12 pb-0">
        <AiOrb size={40} />
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-center text-[22px] font-semibold leading-[30px] tracking-[-0.43px] text-label-strong">
            {headline}
          </h2>
          <p className="text-center text-[16px] font-normal leading-[26px] tracking-[0.09px] text-label-neutral">
            {subCopy}
          </p>
        </div>
      </section>
      <div className="flex flex-1 items-center justify-center px-5 py-6">
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
      </div>
      <footer className="flex w-full flex-col items-start gap-2 self-stretch px-5 pb-2">
        <button
          type="button"
          onClick={onRefine}
          className="w-full self-stretch rounded-xl bg-primary-normal px-7 py-3.5 text-center text-headline-2 font-bold text-static-white transition-colors hover:bg-primary-strong active:bg-primary-heavy"
        >
          초안 내용 다듬기
        </button>
        <button
          type="button"
          onClick={onFinalize}
          className="w-full self-stretch rounded-xl border px-7 py-3 text-center text-[16px] font-semibold leading-[24px] tracking-[0.09px] text-primary-normal transition-colors hover:bg-fill-alternative"
          style={{ borderColor: "rgba(112, 115, 124, 0.16)" }}
        >
          최종 마무리 단계로 넘어가기
        </button>
      </footer>
    </>
  );
}
