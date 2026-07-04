import { supabase } from "@/lib/supabase";
import RoundStatus from "@/components/RoundStatus";
import HintPanel from "@/components/HintPanel";
import InvestmentForm from "@/components/InvestmentForm";

type PageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

export default async function TeamPage({ params }: PageProps) {
  const { teamId } = await params;
  const teamSlug = teamId;

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", teamSlug)
    .single();

  if (teamError || !team) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">존재하지 않는 조입니다.</h1>
        <p className="mt-2 text-gray-600">주소를 다시 확인해 주세요.</p>
      </main>
    );
  }

  const { data: round } = await supabase
    .from("rounds")
    .select("*")
    .eq("is_open", true)
    .order("round_number", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .order("name", { ascending: true });

  let viewedHints: any[] = [];
  let alreadySubmitted = false;

  if (round) {
    const { data: hintViews } = await supabase
      .from("team_hint_views")
      .select(
        `
        hints (
          id,
          level,
          content,
          cost
        )
      `
      )
      .eq("team_id", team.id)
      .eq("round_id", round.id);

    viewedHints =
      hintViews?.map((item: any) => item.hints).filter(Boolean) ?? [];

    const { data: existingInvestments } = await supabase
      .from("investments")
      .select("id")
      .eq("team_id", team.id)
      .eq("round_id", round.id)
      .limit(1);

    alreadySubmitted = Boolean(existingInvestments?.length);
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="rounded-xl bg-black p-6 text-white">
        <div className="text-sm opacity-70">투자로 만나는 미래 진로</div>
        <h1 className="mt-1 text-3xl font-bold">{team.name}</h1>
        <p className="mt-2">
          현재 보유 자금: {Number(team.cash).toLocaleString("ko-KR")}원
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
            assets={assets ?? []}
            alreadySubmitted={alreadySubmitted}
          />
        </>
      )}
    </main>
  );
}