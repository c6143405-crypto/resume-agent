// app/scenarios/index.ts
// 모든 직무 시나리오를 한 곳에서 export.
//
// 사용 흐름:
// 1. 페이지에서 URL 파라미터 (?s=<scenarioId>)로 받은 ID를 getScenario()에 넘긴다.
// 2. ID가 없거나 매칭 안 되면 DEFAULT_SCENARIO_ID로 fallback한다.
// 3. 새 직무를 추가하려면 새 파일을 만들고 아래 import / SCENARIOS 매핑에 한 줄씩 추가하면 끝.

import type { Scenario } from "./types";
import { ACCOUNTING_MANAGER } from "./accounting-manager";
import { GENERAL_OFFICE } from "./general-office";
import { SALES_MARKETING } from "./sales-marketing";
import { PLANNING_STRATEGY } from "./planning-strategy";
import { PUBLIC_ADMINISTRATION } from "./public-administration";

// 시나리오 ID → 시나리오 데이터 매핑.
// 키는 URL ?s= 파라미터로 사용되는 문자열과 동일하다.
export const SCENARIOS: Record<string, Scenario> = {
  "accounting-manager": ACCOUNTING_MANAGER,
  "general-office": GENERAL_OFFICE,
  "sales-marketing": SALES_MARKETING,
  "planning-strategy": PLANNING_STRATEGY,
  "public-administration": PUBLIC_ADMINISTRATION,
  // 추후 추가 예정:
  // "it-planning": IT_PLANNING,
};

// URL ?s= 파라미터가 없거나 매칭 실패할 때 사용할 기본 시나리오.
export const DEFAULT_SCENARIO_ID = "accounting-manager";

// 헬퍼: ID로 시나리오 찾기. 없으면 기본 시나리오 반환.
export function getScenario(scenarioId: string | null | undefined): Scenario {
  if (!scenarioId) return SCENARIOS[DEFAULT_SCENARIO_ID];
  return SCENARIOS[scenarioId] ?? SCENARIOS[DEFAULT_SCENARIO_ID];
}

// 헬퍼: 등록된 모든 시나리오 ID 목록 (구글폼 직무 매핑 등에 활용 가능).
export function listScenarioIds(): string[] {
  return Object.keys(SCENARIOS);
}

// 타입도 같이 re-export해서 페이지에서 한 곳에서 import할 수 있게 한다.
export type {
  Scenario,
  Draft,
  DraftBullet,
  DraftDirection,
  DraftProject,
  DraftRefinementTarget,
  ScenarioPersona,
} from "./types";
