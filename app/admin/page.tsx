"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Round = {
  id: string;
  round_number: number;
  start_year: number;
  end_year: number;
  is_open: boolean;
  is_result_open: boolean;
};

type Team = {
  id: string;
  slug: string;
  name: string;
  cash: number;
};

type Investment = {
  id: string;
  team_id: string;
  round_id: string;
};

type HintView = {
  id: string;
  team_id: string;
  round_id: string;
};

export default function AdminPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [hintViews, setHintViews] = useState<HintView[]>([]);
  const [loading, setLoading] = useState(false);

  const currentRound = rounds.find((round) => round.is_open);

  const loadData = async () => {
    const { data: roundData } = await supabase
      .from("rounds")
      .select("*")
      .order("round_number", { ascending: true });

    const { data: teamData } = await supabase
      .from("teams")
      .select("*")
      .order("slug", { ascending: true });

    const { data: investmentData } = await supabase
      .from("investments")
      .select("id, team_id, round_id");

    const { data: hintViewData } = await supabase
      .from("team_hint_views")
      .select("id, team_id, round_id");

    setRounds(roundData ?? []);
    setTeams((teamData ?? []) as Team[]);
    setInvestments(investmentData ?? []);
    setHintViews(hintViewData ?? []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openRound = async (roundId: string) => {
    const ok = confirm("이 라운드를 여시겠습니까?");
    if (!ok) return;

    setLoading(true);

    const response = await fetch("/api/rounds/open", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roundId }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error ?? "라운드 열기에 실패했습니다.");
    }

    await loadData();
    setLoading(false);
  };

  const openResult = async (roundId: string) => {
    const ok = confirm(
      "결과를 공개하시겠습니까? 각 조의 자금에 투자 결과가 반영됩니다."
    );
    if (!ok) return;

    setLoading(true);

    const response = await fetch("/api/rounds/result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roundId }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error ?? "결과 공개에 실패했습니다.");
    }

    await loadData();
    setLoading(false);
  };

  const didSubmit = (teamId: string) => {
    if (!currentRound) return false;

    return investments.some(
      (investment) =>
        investment.team_id === teamId && investment.round_id === currentRound.id
    );
  };

  const hintCount = (teamId: string) => {
    if (!currentRound) return 0;

    return hintViews.filter(
      (view) => view.team_id === teamId && view.round_id === currentRound.id
    ).length;
  };

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header>
        <h1 className="text-3xl font-bold">관리자 페이지</h1>
        <p className="mt-2 text-gray-600">
          라운드를 열고, 제출 현황과 순위를 확인할 수 있습니다.
        </p>
      </header>

      <section className="rounded-xl border p-4">
        <h2 className="text-xl font-bold">라운드 관리</h2>

        <div className="mt-4 grid gap-3">
          {rounds.map((round) => (
            <div
              key={round.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div>
                <div className="font-bold">
                  {round.round_number}라운드 · {round.start_year}~
                  {round.end_year}
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  {round.is_open ? "현재 열림" : "닫힘"} ·{" "}
                  {round.is_result_open ? "결과 공개됨" : "결과 미공개"}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openRound(round.id)}
                  disabled={loading}
                  className="rounded-lg border px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                >
                  라운드 열기
                </button>

                <button
                  onClick={() => openResult(round.id)}
                  disabled={loading || round.is_result_open}
                  className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                  결과 공개
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-xl font-bold">현재 진행 현황</h2>

        {!currentRound ? (
          <p className="mt-3 text-gray-500">현재 열린 라운드가 없습니다.</p>
        ) : (
          <p className="mt-3">
            현재 {currentRound.round_number}라운드 진행 중입니다.
          </p>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">조</th>
                <th className="p-3">보유 자금</th>
                <th className="p-3">투자 제출</th>
                <th className="p-3">힌트 사용 수</th>
                <th className="p-3">학생 링크</th>
              </tr>
            </thead>

            <tbody>
              {teams
                .slice()
                .sort((a, b) => Number(b.cash) - Number(a.cash))
                .map((team) => (
                  <tr key={team.id} className="border-b">
                    <td className="p-3 font-bold">{team.name}</td>
                    <td className="p-3">
                      {Number(team.cash).toLocaleString("ko-KR")}원
                    </td>
                    <td className="p-3">
                      {didSubmit(team.id) ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                          제출 완료
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">
                          미제출
                        </span>
                      )}
                    </td>
                    <td className="p-3">{hintCount(team.id)}개</td>
                    <td className="p-3">
                      <a
                        href={`/team/${team.slug}`}
                        target="_blank"
                        className="text-blue-600 underline"
                      >
                        열기
                      </a>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}