// 공통 TbdCard 컴포넌트.
// "그래픽 디자인 미확정(TBD)" 자리를 표시하는 placeholder 카드.
// EndScreen 등에서 재사용된다.

interface TbdCardProps {
  label?: string;
}

export function TbdCard({ label }: TbdCardProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-[#E73E3E] px-6 py-20 text-center">
      {label ? (
        <>
          <p className="mb-1 text-xs text-white opacity-50">{`'${label}'`}</p>
          <p className="mb-1 text-5xl font-bold text-white">TBD</p>
          <p className="text-xs text-white opacity-50">그래픽 디자인</p>
        </>
      ) : (
        <>
          <p className="mb-1 text-xs text-white opacity-50">T2에서 확정한</p>
          <p className="mb-1 text-5xl font-bold text-white">TBD</p>
          <p className="text-xs text-white opacity-50">ID 카드 그래픽 디자인</p>
        </>
      )}
    </div>
  );
}
