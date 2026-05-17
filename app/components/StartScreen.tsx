"use client";

import Image from "next/image";
import { AiOrb } from "./AiOrb";

/**
 * StartScreen — A/B/C/D 공통 시작 화면.
 *
 * 모든 type에서 동일하게 사용된다.
 * 일러스트 이미지는 `public/01_Task3_Start.png` (Figma 스펙 375 × 316).
 * 반응형으로 부모 너비에 맞추되 최대 375px·비율 유지.
 *
 * @param onStart — "초안 만들기" 버튼 클릭 시 호출 (호출 측에서 화면 전환 처리)
 */
interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <>
      <section className="flex flex-col items-center gap-5 px-5 py-12">
        <AiOrb size={40} />
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-heading-1 text-center font-bold text-label-strong">
            선택한 직무를 바탕으로<br />
            경력기술서 초안을 만들게요
          </h2>
          <p className="text-body-1-reading text-center text-label-neutral">
            요즘 기업 표현과, 구체적 성과를 작성해요
          </p>
        </div>
      </section>
      <div className="px-5">
        <Image
          src="/01_Task3_Start.png"
          alt=""
          width={1500}
          height={1264}
          priority
          quality={90}
          sizes="(max-width: 480px) 100vw, 375px"
          className="mx-auto h-auto w-full max-w-[375px]"
        />
      </div>
      <div className="flex-1" />
      <footer className="flex w-full flex-col px-5 pb-2">
        <button
          type="button"
          onClick={onStart}
          className="w-full self-stretch rounded-xl bg-primary-normal px-7 py-3.5 text-center text-headline-2 font-bold text-static-white transition-colors hover:bg-primary-strong active:bg-primary-heavy"
        >
          초안 만들기
        </button>
      </footer>
    </>
  );
}
