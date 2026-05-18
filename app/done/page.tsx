// app/done/page.tsx
// 4타입(A/B/C/D) 모두 완료한 후 표시되는 종료 화면.

"use client";

export default function DonePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center bg-white px-5 py-10 text-center">
      <h1 className="text-3xl font-bold text-neutral-900">수고하셨습니다</h1>
      <p className="mt-4 text-base text-neutral-600">
        모든 타입의 프로토타입을 완료했습니다.
        <br />
        참여해주셔서 감사합니다.
      </p>
    </main>
  );
}
