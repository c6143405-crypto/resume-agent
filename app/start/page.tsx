// app/start/page.tsx
// 사전조사 끝난 참가자가 진입하는 시작 페이지.
// - 본인의 주된 경력 분야 선택
// - 선택 시: 직무 → 시나리오 ID 매핑 + 4타입(A/B/C/D) 중 무작위로 첫 타입 결정
// - 첫 타입 페이지로 redirect (URL: /<TYPE>?s=<scenarioId>&done=<TYPE>)

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// 구글폼 Q2의 7개 옵션 + Other
const JOB_OPTIONS: { label: string; scenarioId: string }[] = [
  { label: "경영지원 / 총무 / 인사", scenarioId: "general-office" },
  { label: "금융 / 재무 / 회계", scenarioId: "accounting-manager" },
  { label: "영업 / 마케팅", scenarioId: "sales-marketing" },
  { label: "기획 / 전략", scenarioId: "planning-strategy" },
  { label: "행정 / 공공", scenarioId: "public-administration" },
  { label: "교육 / 연구", scenarioId: "education-research" },
  { label: "IT / 전산 운영", scenarioId: "it-operations" },
];

const ALL_TYPES = ["A", "B", "C", "D"] as const;

function pickRandomType(): string {
  const idx = Math.floor(Math.random() * ALL_TYPES.length);
  return ALL_TYPES[idx];
}

export default function StartPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleStart = () => {
    if (!selected) return;
    const job = JOB_OPTIONS.find((o) => o.label === selected);
    const scenarioId = job?.scenarioId ?? "accounting-manager";
    const firstType = pickRandomType();
    router.push(`/${firstType}?s=${scenarioId}&done=${firstType}`);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-white px-5 py-10">
      <div className="mb-8">
        <p className="text-xs font-mono text-neutral-500">사전조사 이후 시작 화면</p>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          주된 경력 분야를 선택해주세요
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          사전조사에서 답하신 분야와 동일한 것을 골라주세요. 직무에 맞는 시나리오로 자동 진입합니다.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {JOB_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => setSelected(opt.label)}
            className={`rounded-xl border px-4 py-4 text-left text-base font-medium transition-colors ${
              selected === opt.label
                ? "border-blue-500 bg-blue-50 text-blue-900"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={handleStart}
          disabled={!selected}
          className="w-full rounded-xl bg-blue-600 px-6 py-4 text-center text-base font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-neutral-300"
        >
          시작하기
        </button>
      </div>
    </main>
  );
}
