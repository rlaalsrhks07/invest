import type { StaticRound } from "@/lib/gameData";

type ActiveRound = StaticRound & {
  isOpen: boolean;
  isResultOpen: boolean;
};

type RoundStatusProps = {
  round: ActiveRound | null;
};

export default function RoundStatus({
  round,
}: RoundStatusProps) {
  if (!round) {
    return (
      <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-lg shadow-indigo-100/40">
        <h2 className="text-xl font-black text-slate-900">
          현재 열린 라운드가 없습니다
        </h2>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-lg shadow-indigo-100/40">
      <div className="flex items-center justify-between gap-6 bg-gradient-to-r from-indigo-50 to-sky-50 p-6">
        <div>
          <div className="text-sm font-bold text-indigo-500">
            {round.roundNumber}라운드
          </div>

          <h2 className="mt-1 text-2xl font-black text-slate-900">
            {round.startYear} → {round.endYear}
          </h2>
        </div>

        <div
          className={
            round.isResultOpen
              ? "rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-black text-indigo-700 shadow-sm"
              : "rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-700 shadow-sm"
          }
        >
          {round.isResultOpen
            ? "결과 공개 완료"
            : "투자 진행 중"}
        </div>
      </div>
    </section>
  );
}