// app/next-step/page.tsx
// 한 타입 완료 후 다음 타입을 무작위로 부여하는 안내 화면.
// URL 파라미터: from=<완료한 타입>, s=<scenarioId>, done=<완료한 타입 누적, 쉼표 구분>
// 안 한 타입 중 무작위 1개 선택. 다 끝났으면 /done으로 redirect.

"use client";

import { useEffect, useState } from "react";

const ALL_TYPES = ["A", "B", "C", "D"] as const;

export default function NextStepPage() {
  const [nextType, setNextType] = useState<string | null>(null);
  const [scenarioId, setScenarioId] = useState<string>("accounting-manager");
  const [doneList, setDoneList] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const done = params.get("done") ?? "";
    const s = params.get("s") ?? "accounting-manager";
    setScenarioId(s);
    setDoneList(done);

    const doneTypes = done.split(",").filter(Boolean);
    const remaining = ALL_TYPES.filter((t) => !doneTypes.includes(t));

    if (remaining.length === 0) {
      // 4타입 모두 완료
      window.location.href = "/done";
      return;
    }

    const picked = remaining[Math.floor(Math.random() * remaining.length)];
    setNextType(picked);
  }, []);

  const handleContinue = () => {
    if (!nextType) return;
    const doneTypes = doneList.split(",").filter(Boolean);
    const newDone = [...doneTypes, nextType].join(",");
    window.location.href = `/${nextType}?s=${scenarioId}&done=${newDone}`;
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center bg-white px-5 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">
          다음 타입을 진행하겠습니다
        </h1>
        <p className="text-base text-neutral-600">
          이번까지 {doneList.split(",").filter(Boolean).length}개 타입 완료했습니다.
          <br />
          아래 버튼을 눌러 다음 타입으로 이동하세요.
        </p>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!nextType}
        className="mt-10 w-full rounded-xl bg-blue-600 px-6 py-4 text-center text-base font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-neutral-300"
      >
        다음 타입 시작하기
      </button>
    </main>
  );
}
