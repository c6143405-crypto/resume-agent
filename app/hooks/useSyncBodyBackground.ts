"use client";
import { useEffect } from "react";

/**
 * 화면 전환 시 body 배경을 페이지 배경과 동기화한다.
 *
 * 모바일에서 페이지 컨테이너(max-h-[932px]) 바깥 영역 — 즉 시스템 상태바
 * 영역에 body 배경이 그대로 비치므로, 페이지 배경과 동일하게 맞춰
 * 상태바 영역과 페이지가 자연스럽게 이어지도록 만든다.
 *
 * theme-color 메타 태그도 같이 갱신해 Safari 주소창 색을 동기화한다.
 * theme-color는 단색만 지원하므로 그라데이션이면 시작색 또는 대표색을 넘긴다.
 *
 * @param background — CSS background 값 (단색 또는 그라데이션)
 * @param themeColor — Safari 주소창에 반영될 단색 (HEX 등)
 */
export function useSyncBodyBackground(background: string, themeColor: string) {
  useEffect(() => {
    document.body.style.background = background;

    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
    if (meta) {
      meta.setAttribute("content", themeColor);
    }
  }, [background, themeColor]);
}
