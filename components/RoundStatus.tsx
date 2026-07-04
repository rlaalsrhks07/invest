type RoundStatusProps = {
  round: {
    round_number: number;
    start_year: number;
    end_year: number;
    scenario_text: string;
    is_open: boolean;
    is_result_open: boolean;
  } | null;
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
        {round.round_number}라운드: {round.start_year}년 ~ {round.end_year}년
      </h2>

      <p className="mt-4 whitespace-pre-wrap leading-7">
        {round.scenario_text}
      </p>

      <div className="mt-4 flex gap-2 text-sm">
        <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
          투자 가능
        </span>

        {round.is_result_open ? (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
            결과 공개됨
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
            결과 미공개
          </span>
        )}
      </div>
    </section>
  );
}