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
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-xs font-bold tracking-[0.18em] text-zinc-400">
          ROUND STATUS
        </div>

        <h2 className="mt-2 text-2xl font-black text-zinc-950">
          현재 열린 라운드가 없습니다
        </h2>

        <p className="mt-3 text-zinc-600">
          진행자가 라운드를 열 때까지 기다려 주세요.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-6 p-6">
        <div>
          <div className="text-xs font-bold tracking-[0.18em] text-zinc-400">
            ROUND{" "}
            {String(round.roundNumber).padStart(
              2,
              "0"
            )}
          </div>

          <h2 className="mt-2 text-2xl font-black text-zinc-950">
            {round.startYear}년 → {round.endYear}년
          </h2>
        </div>

        <div
          className={
            round.isResultOpen
              ? "rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-700"
              : "rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700"
          }
        >
          {round.isResultOpen
            ? "결과 공개 완료"
            : "투자 진행 중"}
        </div>
      </header>

      <div className="border-t border-zinc-200 bg-zinc-50 p-6">
        <div className="text-xs font-bold text-zinc-400">
          이번 라운드
        </div>

        <p className="mt-2 whitespace-pre-wrap text-base font-medium leading-7 text-zinc-700">
          {round.scenarioText}
        </p>
      </div>
    </section>
  );
}