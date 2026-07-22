import HintPanel from "@/components/HintPanel";
import InvestmentForm from "@/components/InvestmentForm";
import RoundStatus from "@/components/RoundStatus";
import {
  ASSETS,
  HINTS,
  getRoundById,
  getTeamBySlug,
  type ViewedHint,
} from "@/lib/gameData";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

type HintViewRow = {
  hint_id: string;
  deducted_amount: number | string;
};

export default async function TeamPage({ params }: PageProps) {
  const { teamId } = await params;
  const teamInfo = getTeamBySlug(teamId);

  if (!teamInfo) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">존재하지 않는 조입니다.</h1>
        <p className="mt-2 text-gray-600">주소를 다시 확인해 주세요.</p>
      </main>
    );
  }

  const [teamResult, roundStateResult] = await Promise.all([
    supabase.from("teams").select("cash").eq("id", teamInfo.id).single(),
    supabase
      .from("rounds")
      .select("id, round_number, is_open, is_result_open")
      .eq("is_open", true)
      .order("round_number", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (teamResult.error || !teamResult.data) {
    console.error("팀 자금 조회 실패:", teamResult.error);

    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">
          팀 정보를 불러오지 못했습니다.
        </h1>
        <p className="mt-2 text-gray-600">
          Supabase 연결 상태와 초기화 SQL 실행 여부를 확인해 주세요.
        </p>
      </main>
    );
  }

  if (roundStateResult.error) {
    console.error("현재 라운드 조회 실패:", roundStateResult.error);
  }

  const currentCash = Number(teamResult.data.cash);
  const roundState = roundStateResult.data;
  const staticRound = roundState ? getRoundById(roundState.id) : undefined;

  const round =
    roundState && staticRound
      ? {
          ...staticRound,
          isOpen: Boolean(roundState.is_open),
          isResultOpen: Boolean(roundState.is_result_open),
        }
      : null;

  let viewedHints: ViewedHint[] = [];
  let alreadySubmitted = false;

  if (round) {
    const [hintViewsResult, investmentsResult] = await Promise.all([
      supabase
        .from("team_hint_views")
        .select("hint_id, deducted_amount")
        .eq("team_id", teamInfo.id)
        .eq("round_id", round.id),
      supabase
        .from("investments")
        .select("id")
        .eq("team_id", teamInfo.id)
        .eq("round_id", round.id)
        .limit(1),
    ]);

    if (hintViewsResult.error) {
      console.error("힌트 열람 기록 조회 실패:", hintViewsResult.error);
    } else {
      viewedHints = ((hintViewsResult.data ?? []) as HintViewRow[]).flatMap(
        (view) => {
          const hint = HINTS.find((item) => item.id === view.hint_id);

          return hint
            ? [
                {
                  ...hint,
                  deductedAmount: Number(view.deducted_amount),
                },
              ]
            : [];
        }
      );
    }

    if (investmentsResult.error) {
      console.error("투자 제출 기록 조회 실패:", investmentsResult.error);
    } else {
      alreadySubmitted = Boolean(investmentsResult.data?.length);
    }
  }

  const resultIsOpen = Boolean(round?.isResultOpen);
  const hintDisabled = alreadySubmitted || resultIsOpen;
  const hintDisabledReason = resultIsOpen
    ? "이미 결과가 공개되어 힌트를 구매할 수 없습니다."
    : alreadySubmitted
      ? "투자를 제출한 뒤에는 새 힌트를 구매할 수 없습니다."
      : undefined;
  const investmentDisabledReason = resultIsOpen
    ? "이미 결과가 공개되어 투자할 수 없습니다."
    : undefined;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="rounded-xl bg-black p-6 text-white">
        <div className="text-sm opacity-70">투자로 만나는 미래 진로</div>
        <h1 className="mt-1 text-3xl font-bold">{teamInfo.name}</h1>
        <p className="mt-2">
          현재 보유 자금: {currentCash.toLocaleString("ko-KR")}원
        </p>
      </header>

      <RoundStatus round={round} />

      {round && (
        <>
          <HintPanel
            teamId={teamInfo.id}
            roundId={round.id}
            initialViewedHints={viewedHints}
            disabled={hintDisabled}
            disabledReason={hintDisabledReason}
          />

          <InvestmentForm
            teamId={teamInfo.id}
            roundId={round.id}
            assets={ASSETS}
            currentCash={currentCash}
            alreadySubmitted={alreadySubmitted}
            disabled={resultIsOpen}
            disabledReason={investmentDisabledReason}
          />
        </>
      )}
    </main>
  );
}
