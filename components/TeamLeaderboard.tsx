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
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <header className="border-b border-zinc-200 p-5">
        <div className="text-xs font-bold tracking-[0.18em] text-zinc-400">
          LEADERBOARD
        </div>

        <h2 className="mt-1 text-xl font-black text-zinc-950">
          현재 리더보드
        </h2>
      </header>

      <div className="divide-y divide-zinc-100">
        {entries.map((entry, index) => {
          const isCurrentTeam =
            entry.teamId === currentTeamId;

          return (
            <div
              key={entry.teamId}
              className={
                isCurrentTeam
                  ? "flex items-center gap-3 bg-zinc-950 px-4 py-4 text-white"
                  : "flex items-center gap-3 px-4 py-4"
              }
            >
              <div
                className={
                  isCurrentTeam
                    ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-black text-zinc-950"
                    : index === 0
                      ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 font-black text-amber-800"
                      : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 font-black text-zinc-600"
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