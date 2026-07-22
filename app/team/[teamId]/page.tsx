import HintPanel from "@/components/HintPanel";
import InvestmentForm from "@/components/InvestmentForm";
import RoundStatus from "@/components/RoundStatus";
import TeamLeaderboard, {
  type LeaderboardEntry,
} from "@/components/TeamLeaderboard";

import {
  ASSETS,
  HINTS,
  TEAMS,
  getRoundById,
  getTeamBySlug,
  type ViewedHint,
} from "@/lib/gameData";

import { supabase } from "@/lib/supabase";

export const dynamic =
  "force-dynamic";

type PageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

type TeamStateRow = {
  id: string;
  cash: number | string;
};

type HintViewRow = {
  hint_id: string;
  deducted_amount:
    | number
    | string;
};

type InvestmentRow = {
  team_id: string;
  amount: number | string;
};

export default async function TeamPage({
  params,
}: PageProps) {
  const { teamId } = await params;

  const teamInfo =
    getTeamBySlug(teamId);

  if (!teamInfo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-black">
            존재하지 않는 조입니다
          </h1>

          <p className="mt-3 text-zinc-500">
            주소를 다시 확인해 주세요.
          </p>
        </div>
      </main>
    );
  }

  const [
    teamsResult,
    roundStateResult,
  ] = await Promise.all([
    supabase
      .from("teams")
      .select("id, cash"),

    supabase
      .from("rounds")
      .select(
        "id, round_number, is_open, is_result_open"
      )
      .eq("is_open", true)
      .order("round_number", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle(),
  ]);

  if (teamsResult.error) {
    console.error(
      "팀 자금 조회 실패:",
      teamsResult.error
    );

    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
        <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-black">
            팀 정보를 불러오지 못했습니다
          </h1>

          <p className="mt-3 text-zinc-500">
            Supabase 연결 상태를 확인해 주세요.
          </p>
        </div>
      </main>
    );
  }

  if (roundStateResult.error) {
    console.error(
      "현재 라운드 조회 실패:",
      roundStateResult.error
    );
  }

  const teamStateRows =
    (teamsResult.data ??
      []) as TeamStateRow[];

  const cashByTeam = new Map(
    teamStateRows.map((team) => [
      team.id,
      Number(team.cash),
    ])
  );

  if (!cashByTeam.has(teamInfo.id)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
        <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-black">
            조 데이터가 존재하지 않습니다
          </h1>

          <p className="mt-3 text-zinc-500">
            Supabase의 teams 테이블을 확인해 주세요.
          </p>
        </div>
      </main>
    );
  }

  const roundState =
    roundStateResult.data;

  const staticRound =
    roundState
      ? getRoundById(
          roundState.id
        )
      : undefined;

  const round =
    roundState && staticRound
      ? {
          ...staticRound,
          isOpen: Boolean(
            roundState.is_open
          ),
          isResultOpen: Boolean(
            roundState.is_result_open
          ),
        }
      : null;

  let viewedHints: ViewedHint[] =
    [];

  let roundInvestments: InvestmentRow[] =
    [];

  if (round) {
    const [
      hintViewsResult,
      investmentsResult,
    ] = await Promise.all([
      supabase
        .from(
          "team_hint_views"
        )
        .select(
          "hint_id, deducted_amount"
        )
        .eq(
          "team_id",
          teamInfo.id
        )
        .eq(
          "round_id",
          round.id
        ),

      supabase
        .from("investments")
        .select(
          "team_id, amount"
        )
        .eq(
          "round_id",
          round.id
        ),
    ]);

    if (
      hintViewsResult.error
    ) {
      console.error(
        "힌트 열람 기록 조회 실패:",
        hintViewsResult.error
      );
    } else {
      viewedHints = (
        (hintViewsResult.data ??
          []) as HintViewRow[]
      ).flatMap((view) => {
        const hint =
          HINTS.find(
            (item) =>
              item.id ===
              view.hint_id
          );

        return hint
          ? [
              {
                ...hint,
                deductedAmount:
                  Number(
                    view.deducted_amount
                  ),
              },
            ]
          : [];
      });
    }

    if (
      investmentsResult.error
    ) {
      console.error(
        "투자 기록 조회 실패:",
        investmentsResult.error
      );
    } else {
      roundInvestments =
        (investmentsResult.data ??
          []) as InvestmentRow[];
    }
  }

  const investmentTotalByTeam =
    new Map<string, number>();

  for (const investment of roundInvestments) {
    const amount = Number(
      investment.amount
    );

    if (
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      continue;
    }

    const previousAmount =
      investmentTotalByTeam.get(
        investment.team_id
      ) ?? 0;

    investmentTotalByTeam.set(
      investment.team_id,
      previousAmount + amount
    );
  }

  const resultIsOpen =
    Boolean(
      round?.isResultOpen
    );

  const leaderboardEntries: LeaderboardEntry[] =
    TEAMS.map((team) => {
      const cash =
        cashByTeam.get(
          team.id
        ) ?? 0;

      const stockAssets =
        round &&
        !resultIsOpen
          ? investmentTotalByTeam.get(
              team.id
            ) ?? 0
          : 0;

      return {
        teamId: team.id,
        teamName: team.name,
        totalAssets:
          cash + stockAssets,
      };
    }).sort((a, b) => {
      if (
        b.totalAssets !==
        a.totalAssets
      ) {
        return (
          b.totalAssets -
          a.totalAssets
        );
      }

      return a.teamName.localeCompare(
        b.teamName,
        "ko",
        {
          numeric: true,
        }
      );
    });

  const currentCash =
    cashByTeam.get(
      teamInfo.id
    ) ?? 0;

  const investedPrincipal =
    round
      ? investmentTotalByTeam.get(
          teamInfo.id
        ) ?? 0
      : 0;

  const stockAssets =
    round && !resultIsOpen
      ? investedPrincipal
      : 0;

  const totalAssets =
    currentCash +
    stockAssets;

  const currentRank =
    leaderboardEntries.findIndex(
      (entry) =>
        entry.teamId ===
        teamInfo.id
    ) + 1;

  const alreadySubmitted =
    round
      ? roundInvestments.some(
          (investment) =>
            investment.team_id ===
            teamInfo.id
        )
      : false;

  const hintDisabled =
    alreadySubmitted ||
    resultIsOpen;

  const hintDisabledReason =
    resultIsOpen
      ? "이미 결과가 공개되어 힌트를 구매할 수 없습니다."
      : alreadySubmitted
        ? "투자를 제출한 뒤에는 새 힌트를 구매할 수 없습니다."
        : undefined;

  const investmentDisabledReason =
    resultIsOpen
      ? "이미 결과가 공개되어 투자할 수 없습니다."
      : undefined;

  return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50 px-8 py-7">      <div className="mx-auto max-w-[1500px]">
          <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-800 text-white shadow-xl shadow-indigo-950/20">          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-10 p-8">
            <div>
              <div className="flex items-center gap-3">

                {round && (
                  <span className="rounded-full border border-sky-300/30 bg-sky-300/15 px-3 py-1 text-xs font-bold text-sky-200">                    ROUND{" "}
                    {round.roundNumber}
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight">
                {teamInfo.name}
              </h1>
            </div>

            <div className="flex items-stretch gap-3">
              <div className="min-w-48 rounded-2xl bg-white p-5 text-zinc-950">
                <div className="text-xs font-bold text-zinc-400">
                  현재 총자산
                </div>

                <div className="mt-2 text-3xl font-black tabular-nums">
                  {totalAssets.toLocaleString(
                    "ko-KR"
                  )}
                </div>

                <div className="mt-1 text-sm font-bold text-zinc-400">
                  원
                </div>
              </div>

              <div className="grid min-w-44 grid-rows-2 gap-3">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <div className="text-xs text-white/50">
                    현금자산
                  </div>

                  <div className="mt-1 font-black tabular-nums">
                    {currentCash.toLocaleString(
                      "ko-KR"
                    )}
                    원
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <div className="text-xs text-white/50">
                    주식자산
                  </div>

                  <div className="mt-1 font-black tabular-nums">
                    {stockAssets.toLocaleString(
                      "ko-KR"
                    )}
                    원
                  </div>
                </div>
              </div>

              <div className="flex min-w-28 flex-col items-center justify-center rounded-2xl bg-amber-300 px-4 text-zinc-950">
                <div className="text-xs font-bold">
                  현재 순위
                </div>

                <div className="mt-1 text-3xl font-black">
                  {currentRank > 0
                    ? `${currentRank}위`
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_320px] items-start gap-6">
          <div className="min-w-0 space-y-6">
            <RoundStatus
              round={round}
            />

            {round && (
              <>
                <HintPanel
                  teamId={
                    teamInfo.id
                  }
                  roundId={
                    round.id
                  }
                  currentCash={
                    currentCash
                  }
                  initialViewedHints={
                    viewedHints
                  }
                  disabled={
                    hintDisabled
                  }
                  disabledReason={
                    hintDisabledReason
                  }
                />

                <InvestmentForm
                  teamId={
                    teamInfo.id
                  }
                  roundId={
                    round.id
                  }
                  assets={ASSETS}
                  currentCash={
                    currentCash
                  }
                  alreadySubmitted={
                    alreadySubmitted
                  }
                  disabled={
                    resultIsOpen
                  }
                  disabledReason={
                    investmentDisabledReason
                  }
                />
              </>
            )}
          </div>

          <aside className="sticky top-6 self-start">
            <TeamLeaderboard
              entries={
                leaderboardEntries
              }
              currentTeamId={
                teamInfo.id
              }
            />
          </aside>
        </div>
      </div>
    </main>
  );
}