// app/hooks/useScenario.ts
// URL 파라미터(?s=<scenarioId>)를 읽어 현재 시나리오를 반환하는 훅.
//
// SSR-safe 버전:
// - useSearchParams 대신 useEffect + window.location 사용
// - 첫 렌더(서버)에서는 DEFAULT_SCENARIO_ID로 fallback
// - hydration 후 클라이언트에서 URL 파라미터를 읽어 정확한 시나리오 적용
// - Next.js 16 Turbopack의 Suspense boundary 요구사항 회피

"use client";

import { useEffect, useState } from "react";
import { getScenario } from "../scenarios";
import type { Scenario } from "../scenarios";

export function useScenario(): Scenario {
  const [scenario, setScenario] = useState<Scenario>(() => getScenario(null));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const scenarioId = params.get("s");
    setScenario(getScenario(scenarioId));
  }, []);

  return scenario;
}
