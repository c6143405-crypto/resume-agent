// app/hooks/useScenario.ts
// URL 파라미터(?s=<scenarioId>)를 읽어 현재 시나리오를 반환하는 훅.
//
// SSR-safe + 첫 렌더부터 URL 파라미터 적용:
// - 서버 렌더링 시: typeof window === "undefined" → 기본 시나리오 fallback
// - 클라이언트 첫 렌더: URL 파라미터 즉시 읽어서 정확한 시나리오 적용 (깜빡임 없음)
// - useEffect로 추가 보강 (URL이 후에 바뀌는 경우 대비, 거의 불필요)

"use client";

import { useEffect, useState } from "react";
import { getScenario } from "../scenarios";
import type { Scenario } from "../scenarios";

function readScenarioFromUrl(): Scenario {
  if (typeof window === "undefined") return getScenario(null);
  const params = new URLSearchParams(window.location.search);
  return getScenario(params.get("s"));
}

export function useScenario(): Scenario {
  const [scenario, setScenario] = useState<Scenario>(readScenarioFromUrl);

  // URL이 후에 바뀌는 경우(예: client navigation으로 같은 페이지 내 파라미터 변경) 대비
  useEffect(() => {
    setScenario(readScenarioFromUrl());
  }, []);

  return scenario;
}
