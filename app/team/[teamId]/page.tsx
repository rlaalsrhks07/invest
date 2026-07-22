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

function toValidMoney(
  value: number | string
) {
  const amount = Number(value);

  return Number.isFinite(
    amount
  )
    ? amount
    : 0;
}

export default async function TeamPage({
  params,
}: PageProps) {
  const { teamId } =
    await params;

  const teamInfo =
    getTeamBySlug(teamId);

  if (!teamInfo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 p-6">
        <div className="rounded-2xl border border-indigo-100 bg-white p-10 text-center shadow-lg shadow-indigo-100/50">
          <h1 className="text-2xl font-black text-slate-900">
            존재하지 않는 조입니다
          </h1>
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
      .eq(
        "is_open",
        true
      )
      .order(
        "round_number",
        {
          ascending: true,
        }
      )
      .limit(1)
      .maybeSingle(),
  ]);

  if (teamsResult.error) {
    console.error(
      "팀 자금 조회 실패:",
      teamsResult.error
    );

    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 p-6">
        <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-lg">
          <h1 className="text-2xl font-black text-slate-900">
            팀 정보를 불러오지 못했습니다
          </h1>
        </div>
      </main>
    );
  }

  if (
    roundStateResult.error
  ) {
    console.error(
      "현재 라운드 조회 실패:",
      roundStateResult.error
    );
  }

  const teamStateRows =
    (teamsResult.data ??
      []) as TeamStateRow[];

  const cashByTeam =
    new Map(
      teamStateRows.map(
        (team) => [
          team.id,
          toValidMoney(
            team.cash
          ),
        ]
      )
    );

  if (
    !cashByTeam.has(
      teamInfo.id
    )
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 p-6">
        <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-lg">
          <h1 className="text-2xl font-black text-slate-900">
            조 데이터가 존재하지 않습니다
          </h1>
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
    roundState &&
    staticRound
      ? {
          ...staticRound,
          isOpen:
            Boolean(
              roundState.is_open
            ),
          isResultOpen:
            Boolean(
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
        .from(
          "investments"
        )
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
        "힌트 기록 조회 실패:",
        hintViewsResult.error
      );
    } else {
      viewedHints = (
        (hintViewsResult.data ??
          []) as HintViewRow[]
      ).flatMap(
        (view) => {
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
                    toValidMoney(
                      view.deducted_amount
                    ),
                },
              ]
            : [];
        }
      );
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
    new Map<
      string,
      number
    >();

  for (
    const investment of
      roundInvestments
  ) {
    const amount =
      toValidMoney(
        investment.amount
      );

    if (amount < 0) {
      continue;
    }

    const previousAmount =
      investmentTotalByTeam.get(
        investment.team_id
      ) ?? 0;

    investmentTotalByTeam.set(
      investment.team_id,
      previousAmount +
        amount
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
        teamId:
          team.id,
        teamName:
          team.name,
        totalAssets:
          cash +
          stockAssets,
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
    round &&
    !resultIsOpen
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/70 to-sky-50 px-8 py-7">
      <div className="mx-auto max-w-[1500px]">
        <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-800 text-white shadow-xl shadow-indigo-950/20">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-10 p-8">
<div className="flex h-full items-center">
  <h1 className="text-5xl font-black tracking-tight">
    {teamInfo.name}
  </h1>
</div>

            <div className="flex items-stretch gap-3">
<div className="flex min-w-56 flex-col justify-center rounded-2xl bg-white/95 p-5 text-slate-900 shadow-lg shadow-black/10">
  <div className="text-xs font-bold text-slate-400">
    현재 총자산
  </div>

  <div className="mt-2 whitespace-nowrap text-3xl font-black tabular-nums">
    {totalAssets.toLocaleString("ko-KR")}원
  </div>
</div>

              <div className="grid min-w-44 grid-rows-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="text-xs text-white/50">
                    현금자산
                  </div>

                  <div className="mt-1 whitespace-nowrap font-black tabular-nums">
                    {currentCash.toLocaleString(
                      "ko-KR"
                    )}
                    원
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="text-xs text-white/50">
                    투자자산
                  </div>

                  <div className="mt-1 whitespace-nowrap font-black tabular-nums">
                    {stockAssets.toLocaleString(
                      "ko-KR"
                    )}
                    원
                  </div>
                </div>
              </div>

              <div className="flex min-w-28 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 to-indigo-300 px-4 text-slate-950 shadow-lg shadow-indigo-950/20">
                <div className="text-xs font-bold">
                  현재 순위
                </div>

                <div className="mt-1 text-3xl font-black">
                  {currentRank >
                  0
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
                  assets={
                    ASSETS
                  }
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