// app/hooks/useScenario.ts
// URL 파라미터(?s=<scenarioId>)를 읽어 현재 시나리오를 반환하는 훅.
//
// 사용 예: const scenario = useScenario();
//
// - ?s=accounting-manager → 회계 시나리오 반환
// - 파라미터 없음 / 매칭 안 됨 → DEFAULT_SCENARIO_ID로 fallback
// - 모든 타입(A/B/C/D) 페이지가 이 훅 하나로 시나리오를 받게 통일된다.
//
// 새로고침해도 URL의 ?s= 파라미터가 유지되므로 같은 시나리오가 노출된다.
// 한 참가자가 4타입을 차례로 볼 때, 동일한 ?s= 값을 4개 URL에 그대로 사용하면
// 4타입 전부 같은 시나리오 데이터로 동작한다.

"use client";

import { useSearchParams } from "next/navigation";
import { getScenario } from "../scenarios";
import type { Scenario } from "../scenarios";

export function useScenario(): Scenario {
  const params = useSearchParams();
  const scenarioId = params?.get("s") ?? null;
  return getScenario(scenarioId);
}
