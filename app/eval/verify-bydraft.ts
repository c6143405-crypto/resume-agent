// byDraft 정합성 검증 — 7개 시나리오 전체.
//
// 실행: npx tsx app/eval/verify-bydraft.ts
//
// 각 시나리오 refinementTarget의 byDraft.{achievement,fit,narrative}에 대해:
//  1. originalSentence가 해당 direction 초안의 tasks/achievements 본문과 정확 일치하는가
//  2. keyword.original이 originalSentence에 substring으로 포함되는가
//  3. keyword.revised가 revisedSentence(또는 option.text)에 substring으로 포함되는가
//  4. 동일 매핑(original === revised)이 없는가

import { SCENARIOS } from "../scenarios";

const DIRECTIONS = ["achievement", "fit", "narrative"] as const;

const issues: string[] = [];
let checkedPairs = 0;
let checkedTargets = 0;

for (const [sid, scenario] of Object.entries(SCENARIOS)) {
  const targets = scenario.refinementTargets ?? [];
  targets.forEach((target, ti) => {
    if (!target.byDraft) {
      issues.push(`${sid} [${ti}] "${target.title ?? ""}": byDraft 없음`);
      return;
    }
    for (const dir of DIRECTIONS) {
      const entry = target.byDraft[dir];
      if (!entry) {
        issues.push(`${sid} [${ti}] ${dir}: byDraft.${dir} 없음`);
        continue;
      }
      checkedTargets++;
      const draft = scenario.drafts.find((d) => d.direction === dir);
      if (!draft) {
        issues.push(`${sid}: ${dir} 초안 없음`);
        continue;
      }
      const bodyLines = new Set<string>([
        ...draft.tasks.map((t) => t.text),
        ...draft.achievements.map((a) => a.text),
      ]);
      // 1. originalSentence가 본문에 있는가
      if (!bodyLines.has(entry.originalSentence)) {
        issues.push(
          `${sid} [${ti}] ${dir}: originalSentence 본문 불일치 — "${entry.originalSentence}"`
        );
      }
      // 2~4. 단일 수정안 keywords
      if (entry.keywords) {
        const rev = entry.revisedSentence ?? "";
        for (const kw of entry.keywords) {
          checkedPairs++;
          if (!entry.originalSentence.includes(kw.original))
            issues.push(`${sid} [${ti}] ${dir}: kw.original 불포함 — "${kw.original}"`);
          if (!rev.includes(kw.revised))
            issues.push(`${sid} [${ti}] ${dir}: kw.revised 불포함 — "${kw.revised}"`);
          if (kw.original === kw.revised)
            issues.push(`${sid} [${ti}] ${dir}: 동일 매핑 — "${kw.original}"`);
        }
      }
      // 2~4. options keywords
      if (entry.options) {
        for (const opt of entry.options) {
          for (const kw of opt.keywords ?? []) {
            checkedPairs++;
            if (!entry.originalSentence.includes(kw.original))
              issues.push(
                `${sid} [${ti}] ${dir} opt${opt.label}: kw.original 불포함 — "${kw.original}"`
              );
            if (!opt.text.includes(kw.revised))
              issues.push(
                `${sid} [${ti}] ${dir} opt${opt.label}: kw.revised 불포함 — "${kw.revised}"`
              );
            if (kw.original === kw.revised)
              issues.push(`${sid} [${ti}] ${dir} opt${opt.label}: 동일 매핑 — "${kw.original}"`);
          }
        }
      }
    }
  });
}

console.log("\n=== byDraft 정합성 검증 ===\n");
console.log(`시나리오: ${Object.keys(SCENARIOS).length}개`);
console.log(`검사한 byDraft 항목: ${checkedTargets}개 (시나리오 × refinementTarget × direction)`);
console.log(`검사한 키워드 쌍: ${checkedPairs}개\n`);
if (issues.length === 0) {
  console.log("전체 통과 — 모든 byDraft 정합성 OK\n");
} else {
  console.log(`${issues.length}건 문제 발견:\n`);
  issues.forEach((i) => console.log("  - " + i));
  console.log("");
}
