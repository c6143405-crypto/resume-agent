"use client";

import Image from "next/image";
import { AiOrb } from "./AiOrb";

/**
 * Cm02LoadingScreen — A/B/C/D 공통 CM 02 진입 화면.
 * "N번 초안을 선택했어요" 텍스트 + 선택한 초안 카드 일러스트 + 다음 액션 버튼 2개.
 *
 * 일러스트: public/CM02_loading.png (Figma 스펙 375 × 378, 원본 1500 × 1512).
 * 상단 텍스트 영역은 하단 padding 0 (이미지와 붙어 보이도록 설계).
 *
 * @param draftIndex   CM1에서 선택한 초안 번호 (1~3)
 * @param draftTitle   선택한 초안 제목 (현재는 본문에 노출 안 함 — 추후 라벨용으로 유지)
 * @param onRefine     "초안 내용 다듬기" 클릭 → CM2 채팅 단계
 * @param onFinalize   "최종 마무리 단계로 넘어가기" 클릭 → End 단계
 */
interface Cm02LoadingScreenProps {
  draftIndex: number;
  draftTitle: string;
  onRefine: () => void;
  onFinalize: () => void;
}

export function Cm02LoadingScreen({
  draftIndex,
  onRefine,
  onFinalize,
}: Cm02LoadingScreenProps) {
  return (
    <>
      <section className="flex flex-col items-center gap-5 px-5 pt-12 pb-0">
        <AiOrb size={40} />
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-heading-1 text-center font-bold text-label-strong">
            {draftIndex}번 초안을 선택했어요
          </h2>
          <p className="text-body-1-reading text-center text-label-neutral">
            내용을 AI와 함께 더 다듬을 수 있어요
          </p>
        </div>
      </section>
      <div className="px-5">
        <Image
          src="/CM02_loading.png"
          alt=""
          width={1500}
          height={1512}
          priority
          quality={90}
          sizes="(max-width: 480px) 100vw, 375px"
          className="mx-auto h-auto w-full max-w-[375px]"
        />
      </div>
      <div className="flex-1" />
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
          className="w-full self-stretch rounded-xl border px-7 py-3.5 text-center text-headline-2 font-bold text-label-normal transition-colors hover:bg-fill-alternative"
          style={{ borderColor: "rgba(112, 115, 124, 0.16)" }}
        >
          최종 마무리 단계로 넘어가기
        </button>
      </footer>
    </>
  );
}
