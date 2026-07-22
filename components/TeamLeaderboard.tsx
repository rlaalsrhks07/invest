export type LeaderboardEntry = {
  teamId: string;
  teamName: string;
  totalAssets: number;
};

type TeamLeaderboardProps = {
  entries: LeaderboardEntry[];
  currentTeamId: string;
};

export default function TeamLeaderboard({
  entries,
  currentTeamId,
}: TeamLeaderboardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-lg shadow-indigo-100/60">
      <header className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-sky-50 p-5">
        <h2 className="text-xl font-black text-slate-900">
          리더보드
        </h2>
      </header>

      <div className="divide-y divide-slate-100">
        {entries.map((entry, index) => {
          const isCurrentTeam =
            entry.teamId === currentTeamId;

          return (
            <div
              key={entry.teamId}
              className={
                isCurrentTeam
                  ? "flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-4 text-white"
                  : "flex items-center gap-3 px-4 py-4 transition hover:bg-indigo-50/40"
              }
            >
              <div
                className={
                  isCurrentTeam
                    ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-black text-indigo-700 shadow-sm"
                    : index === 0
                      ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-yellow-300 font-black text-amber-900 shadow-sm"
                      : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-black text-indigo-500"
                }
              >
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-black">
                    {entry.teamName}
                  </span>

                  {isCurrentTeam && (
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold">
                      우리 조
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 whitespace-nowrap text-right font-black tabular-nums">
                {entry.totalAssets.toLocaleString("ko-KR")}원
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}