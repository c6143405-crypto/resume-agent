// app/debug-scenario/page.tsx
// 임시 디버그 페이지. 시나리오 데이터 시각 검수용.
// 본 실험 / 파일럿 흐름에는 사용 안 함.
// 검수 끝나면 app/debug-scenario/ 폴더를 통째로 삭제하면 됨.

import { getScenario } from "../scenarios";

export default function DebugScenarioPage() {
  const scenario = getScenario("accounting-manager");

  return (
    <main className="mx-auto max-w-4xl bg-white px-6 py-10 text-neutral-900">
      <div className="mb-8 border-b pb-4">
        <p className="text-xs font-mono text-red-500">DEBUG · 임시 페이지</p>
        <h1 className="mt-1 text-2xl font-bold">시나리오 데이터 검수</h1>
        <p className="mt-1 text-sm text-neutral-600">
          본 실험과 무관. <code>app/scenarios/accounting-manager.ts</code> 내용
          정합성 확인용. 검수 끝나면 폴더 삭제.
        </p>
      </div>

      {/* 시나리오 메타데이터 */}
      <section className="mb-8 rounded-xl border p-5">
        <h2 className="mb-3 text-lg font-semibold">시나리오 메타</h2>
        <dl className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
          <dt className="text-neutral-500">scenarioId</dt>
          <dd className="font-mono">{scenario.scenarioId}</dd>
          <dt className="text-neutral-500">jobTitle</dt>
          <dd>{scenario.jobTitle}</dd>
          <dt className="text-neutral-500">jobCategory</dt>
          <dd>{scenario.jobCategory}</dd>
          <dt className="text-neutral-500">company</dt>
          <dd>{scenario.persona.company}</dd>
          <dt className="text-neutral-500">period</dt>
          <dd>{scenario.persona.period}</dd>
          <dt className="text-neutral-500">role</dt>
          <dd>{scenario.persona.role}</dd>
        </dl>
      </section>

      {/* 3개 초안 */}
      {scenario.drafts.map((draft, idx) => (
        <section
          key={draft.draftId}
          className="mb-8 rounded-xl border p-5 shadow-sm"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-mono text-blue-700">
              {idx + 1}번
            </span>
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-mono text-neutral-600">
              {draft.direction}
            </span>
            <h2 className="text-lg font-semibold">{draft.draftTitle}</h2>
          </div>

          <p className="mb-4 font-mono text-xs text-neutral-400">
            draftId: {draft.draftId}
          </p>

          {/* B 타입 해시태그 */}
          <div className="mb-4">
            <p className="mb-1 text-xs text-neutral-500">
              B 타입 해시태그 ({draft.hashtags.length}개)
            </p>
            <div className="flex flex-wrap gap-2">
              {draft.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* 프로젝트 */}
          <div className="mb-4 rounded bg-neutral-50 p-3">
            <p className="mb-1 text-xs text-neutral-500">
              프로젝트 {draft.project.number}
            </p>
            <p className="font-medium">{draft.project.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-700">
              {draft.project.description}
            </p>
          </div>

          {/* 업무 상세 */}
          <div className="mb-4">
            <p className="mb-1 text-xs text-neutral-500">
              업무 상세 ({draft.tasks.length}개)
            </p>
            <ul className="space-y-1">
              {draft.tasks.map((bullet, i) => (
                <li key={i} className="text-sm leading-relaxed">
                  <span className="mr-2 inline-block w-6 text-center">
                    {bullet.emoji ?? "—"}
                  </span>
                  {bullet.text}
                </li>
              ))}
            </ul>
          </div>

          {/* 역할 및 성과 */}
          <div className="mb-4">
            <p className="mb-1 text-xs text-neutral-500">
              역할 및 성과 ({draft.achievements.length}개)
            </p>
            <ul className="space-y-1">
              {draft.achievements.map((bullet, i) => (
                <li key={i} className="text-sm leading-relaxed">
                  <span className="mr-2 inline-block w-6 text-center">
                    {bullet.emoji ?? "—"}
                  </span>
                  {bullet.text}
                </li>
              ))}
            </ul>
          </div>

          {/* 추천 이유 / 주의점 */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded bg-green-50 p-3 text-sm">
              <p className="mb-1 text-xs text-green-700">whyRecommended</p>
              <p className="text-neutral-700">{draft.whyRecommended}</p>
            </div>
            <div className="rounded bg-amber-50 p-3 text-sm">
              <p className="mb-1 text-xs text-amber-700">caution</p>
              <p className="text-neutral-700">{draft.caution}</p>
            </div>
          </div>

          {/* CM2 refinementTarget */}
          <div className="rounded border border-dashed p-3 text-sm">
            <p className="mb-2 text-xs text-neutral-500">
              CM2 refinementTarget (사용자가 다듬을 문장)
            </p>
            <div className="mb-2">
              <span className="mr-1 text-xs text-neutral-400">원본:</span>
              <span>{draft.refinementTarget.originalSentence}</span>
            </div>
            <div className="mb-2">
              <span className="mr-1 text-xs text-neutral-400">수정안:</span>
              <span>{draft.refinementTarget.revisedSentence}</span>
            </div>
            <div>
              <span className="mr-1 text-xs text-neutral-400">변경 이유:</span>
              <span className="text-neutral-600">
                {draft.refinementTarget.changeReason}
              </span>
            </div>
          </div>
        </section>
      ))}

      <p className="mt-10 border-t pt-4 text-xs text-neutral-400">
        이 페이지는 임시 디버그 페이지입니다. 나중에{" "}
        <code>app/debug-scenario/</code> 폴더를 통째로 삭제하면 됩니다.
      </p>
    </main>
  );
}
