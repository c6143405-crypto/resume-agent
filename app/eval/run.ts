// 의도 분류 eval 러너.
//
// 실행: npx tsx app/eval/run.ts
//
// intent-cases.ts의 expected(정책 기준 정답)와 classifyUserIntent()의 실제 출력을
// 대조해 통과율을 측정한다. 실패 목록이 분류기 개선 to-do가 된다.

import { classifyUserIntent } from "../classify-intent";
import { INTENT_TEST_CASES } from "./intent-cases";

interface Result {
  input: string;
  expected: string;
  actual: string;
  pass: boolean;
  note?: string;
}

const results: Result[] = INTENT_TEST_CASES.map((tc) => {
  const actual = classifyUserIntent(tc.input) as string;
  return {
    input: tc.input,
    expected: tc.expected,
    actual,
    pass: actual === tc.expected,
    note: tc.note,
  };
});

const total = results.length;
const passed = results.filter((r) => r.pass).length;
const pctAll = ((passed / total) * 100).toFixed(1);

console.log("\n=== 의도 분류 eval 결과 ===\n");
console.log(`전체 통과율: ${passed}/${total}  (${pctAll}%)\n`);

// expected(정답 의도)별 통과율 집계
const byExpected = new Map<string, { pass: number; total: number }>();
for (const r of results) {
  const e = byExpected.get(r.expected) ?? { pass: 0, total: 0 };
  e.total += 1;
  if (r.pass) e.pass += 1;
  byExpected.set(r.expected, e);
}

console.log("의도별 통과율:");
for (const [intent, s] of [...byExpected.entries()].sort()) {
  const pct = ((s.pass / s.total) * 100).toFixed(0);
  console.log(`  ${intent.padEnd(16)} ${s.pass}/${s.total}  (${pct}%)`);
}

// 실패 케이스 목록
const failures = results.filter((r) => !r.pass);
console.log(`\n실패 케이스 (${failures.length}개):`);
for (const f of failures) {
  const noteStr = f.note ? `   // ${f.note}` : "";
  console.log(`  [정답 ${f.expected}  →  실제 ${f.actual}]  "${f.input}"${noteStr}`);
}
console.log("");
