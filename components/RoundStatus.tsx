import type { StaticRound } from "@/lib/gameData";

type ActiveRound = StaticRound & {
  isOpen: boolean;
  isResultOpen: boolean;
};

type RoundStatusProps = {
  round: ActiveRound | null;
};

export default function RoundStatus({ round }: RoundStatusProps) {
  if (!round) {
    return (
      <section className="rounded-xl border p-4">
        <h2 className="text-xl font-bold">현재 열린 라운드가 없습니다.</h2>
        <p className="mt-2 text-gray-600">
          진행자가 라운드를 열 때까지 기다려 주세요.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border p-4">
      <div className="text-sm text-gray-500">현재 라운드</div>
      <h2 className="mt-1 text-2xl font-bold">
        {round.roundNumber}라운드: {round.startYear}년 ~ {round.endYear}년
      </h2>

      <p className="mt-4 whitespace-pre-wrap leading-7">
        {round.scenarioText}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {round.isResultOpen ? (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
            결과 공개됨
          </span>
        ) : (
          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
            투자 가능
          </span>
        )}
      </div>
    </section>
  );
}
