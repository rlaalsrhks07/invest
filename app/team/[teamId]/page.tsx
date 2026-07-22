import { supabase } from "@/lib/supabase";
import {
  ASSETS,
  HINTS,
  TEAMS,
  type StaticHint,
} from "@/lib/gameData";

import RoundStatus from "@/components/RoundStatus";
import HintPanel from "@/components/HintPanel";
import InvestmentForm from "@/components/InvestmentForm";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

export default async function TeamPage({
  params,
}: PageProps) {
  const { teamId } = await params;
  const teamSlug = teamId;

  const teamInfo = TEAMS.find(
    (team) => team.slug === teamSlug
  );

  if (!teamInfo) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">
          존재하지 않는 조입니다.
        </h1>

        <p className="mt-2 text-gray-600">
          주소를 다시 확인해 주세요.
        </p>
      </main>
    );
  }

  const [teamResult, roundResult] = await Promise.all([
    supabase
      .from("teams")
      .select("cash")
      .eq("id", teamInfo.id)
      .single(),

    supabase
      .from("rounds")
      .select("*")
      .eq("is_open", true)
      .order("round_number", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (teamResult.error || !teamResult.data) {
    console.error(
      "팀 자금 조회 실패:",
      teamResult.error
    );

    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">
          팀 정보를 불러오지 못했습니다.
        </h1>

        <p className="mt-2 text-gray-600">
          잠시 후 다시 시도해 주세요.
        </p>
      </main>
    );
  }

  if (roundResult.error) {
    console.error(
      "현재 라운드 조회 실패:",
      roundResult.error
    );
  }

  const team = {
    ...teamInfo,
    cash: Number(teamResult.data.cash),
  };

  const round = roundResult.data;

  let viewedHints: StaticHint[] = [];
  let alreadySubmitted = false;

  if (round) {
    const [
      hintViewsResult,
      existingInvestmentsResult,
    ] = await Promise.all([
      supabase
        .from("team_hint_views")
        .select("hint_id")
        .eq("team_id", team.id)
        .eq("round_id", round.id),

      supabase
        .from("investments")
        .select("id")
        .eq("team_id", team.id)
        .eq("round_id", round.id)
        .limit(1),
    ]);

    if (hintViewsResult.error) {
      console.error(
        "힌트 열람 기록 조회 실패:",
        hintViewsResult.error
      );
    } else {
      const viewedHintIds = new Set(
        (hintViewsResult.data ?? []).map(
          (item) => item.hint_id
        )
      );

      viewedHints = HINTS.filter(
        (hint) =>
          hint.round_id === round.id &&
          viewedHintIds.has(hint.id)
      );
    }

    if (existingInvestmentsResult.error) {
      console.error(
        "투자 제출 기록 조회 실패:",
        existingInvestmentsResult.error
      );
    } else {
      alreadySubmitted = Boolean(
        existingInvestmentsResult.data?.length
      );
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="rounded-xl bg-black p-6 text-white">
        <div className="text-sm opacity-70">
          투자로 만나는 미래 진로
        </div>

        <h1 className="mt-1 text-3xl font-bold">
          {team.name}
        </h1>

        <p className="mt-2">
          현재 보유 자금:{" "}
          {team.cash.toLocaleString("ko-KR")}원
        </p>
      </header>

      <RoundStatus round={round} />

      {round && (
        <>
          <HintPanel
            teamId={team.id}
            roundId={round.id}
            initialViewedHints={viewedHints}
          />

          <InvestmentForm
            teamId={team.id}
            roundId={round.id}
            assets={ASSETS}
            alreadySubmitted={alreadySubmitted}
          />
        </>
      )}
    </main>
  );
}