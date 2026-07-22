"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  INITIAL_CASH,
  ROUNDS,
  TEAMS,
  type StaticRound,
  type StaticTeam,
} from "@/lib/gameData";
import { supabase } from "@/lib/supabase";

type RoundStateRow = {
  id: string;
  is_open: boolean;
  is_result_open: boolean;
};

type TeamStateRow = {
  id: string;
  cash: number | string;
};

type InvestmentRow = {
  id: number;
  team_id: string;
  round_id: string;
  amount: number | string;
};

type HintViewRow = {
  id: number;
  team_id: string;
  round_id: string;
};

type AdminRound = StaticRound & {
  isOpen: boolean;
  isResultOpen: boolean;
};

type AdminTeam = StaticTeam & {
  cash: number;
};

type RankedTeam = AdminTeam & {
  stockAssets: number;
  totalAssets: number;
};

export default function AdminPage() {
  const [rounds, setRounds] = useState<AdminRound[]>([]);
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [investments, setInvestments] = useState<InvestmentRow[]>([]);
  const [hintViews, setHintViews] = useState<HintViewRow[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const currentRound = rounds.find((round) => round.isOpen);

  const rankedTeams = useMemo<RankedTeam[]>(() => {
    return teams
      .map((team) => {
        /*
         * 결과 공개 전에는 투자 금액이 현금에서 빠져 있으므로
         * 현재 라운드 투자 원금을 주식자산으로 계산합니다.
         *
         * 결과 공개 후에는 투자 결과가 cash에 다시 들어오므로
         * 주식자산을 0원으로 처리해야 중복 계산되지 않습니다.
         */
        const shouldCountStockAssets =
          currentRound !== undefined && !currentRound.isResultOpen;

        const stockAssets = shouldCountStockAssets
          ? investments
              .filter(
                (investment) =>
                  investment.team_id === team.id &&
                  investment.round_id === currentRound.id
              )
              .reduce((sum, investment) => {
                const amount = Number(investment.amount);

                return Number.isFinite(amount) ? sum + amount : sum;
              }, 0)
          : 0;

        return {
          ...team,
          stockAssets,
          totalAssets: team.cash + stockAssets,
        };
      })
      .sort((a, b) => {
        if (b.totalAssets !== a.totalAssets) {
          return b.totalAssets - a.totalAssets;
        }

        return a.name.localeCompare(b.name, "ko", {
          numeric: true,
        });
      });
  }, [teams, investments, currentRound]);

  const loadData = useCallback(async () => {
    setLoadError(null);

    const [roundResult, teamResult, investmentResult, hintViewResult] =
      await Promise.all([
        supabase
          .from("rounds")
          .select("id, is_open, is_result_open"),

        supabase
          .from("teams")
          .select("id, cash"),

        supabase
          .from("investments")
          .select("id, team_id, round_id, amount"),

        supabase
          .from("team_hint_views")
          .select("id, team_id, round_id"),
      ]);

    const firstError =
      roundResult.error ??
      teamResult.error ??
      investmentResult.error ??
      hintViewResult.error;

    if (firstError) {
      console.error("관리자 데이터 조회 실패:", firstError);

      setLoadError(
        "데이터를 불러오지 못했습니다. Supabase 연결과 초기화 SQL을 확인해 주세요."
      );

      return;
    }

    const roundStateMap = new Map(
      ((roundResult.data ?? []) as RoundStateRow[]).map((round) => [
        round.id,
        round,
      ])
    );

    const teamStateMap = new Map(
      ((teamResult.data ?? []) as TeamStateRow[]).map((team) => [
        team.id,
        team,
      ])
    );

    setRounds(
      ROUNDS.map((round) => {
        const state = roundStateMap.get(round.id);

        return {
          ...round,
          isOpen: Boolean(state?.is_open),
          isResultOpen: Boolean(state?.is_result_open),
        };
      })
    );

    setTeams(
      TEAMS.map((team) => ({
        ...team,
        cash: Number(teamStateMap.get(team.id)?.cash ?? 0),
      }))
    );

    setInvestments((investmentResult.data ?? []) as InvestmentRow[]);
    setHintViews((hintViewResult.data ?? []) as HintViewRow[]);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openRound = async (roundId: string) => {
    const round = rounds.find((item) => item.id === roundId);

    if (!round) return;

    const ok = confirm(
      `${round.roundNumber}라운드(${round.startYear}~${round.endYear})를 여시겠습니까? 현재 열린 라운드는 닫힙니다.`
    );

    if (!ok) return;

    try {
      setLoadingAction(`open-${roundId}`);

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
        return;
      }

      await loadData();
    } catch (error) {
      console.error(error);
      alert("라운드 열기 중 오류가 발생했습니다.");
    } finally {
      setLoadingAction(null);
    }
  };

  const openResult = async (roundId: string) => {
    const ok = confirm(
      "결과를 공개하시겠습니까? 각 조의 자금에 투자 결과가 반영되며 되돌릴 수 없습니다."
    );

    if (!ok) return;

    try {
      setLoadingAction(`result-${roundId}`);

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
        return;
      }

      await loadData();
    } catch (error) {
      console.error(error);
      alert("결과 공개 중 오류가 발생했습니다.");
    } finally {
      setLoadingAction(null);
    }
  };

  const resetGame = async () => {
    const confirmation = prompt(
      `모든 투자·힌트 기록을 삭제하고 각 조의 자금을 ${INITIAL_CASH.toLocaleString(
        "ko-KR"
      )}원으로 되돌립니다. 계속하려면 reset을 입력하세요.`
    );

    if (confirmation === null) return;

    if (confirmation !== "reset") {
      alert('입력값이 올바르지 않습니다. "reset"을 정확히 입력해야 합니다.');
      return;
    }

    const finalCheck = confirm(
      "정말 전체 게임을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );

    if (!finalCheck) return;

    try {
      setLoadingAction("reset");

      const response = await fetch("/api/admin/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmation }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error ?? "초기화에 실패했습니다.");
        return;
      }

      alert("전체 게임이 초기화되었습니다.");
      await loadData();
    } catch (error) {
      console.error(error);
      alert("초기화 중 오류가 발생했습니다.");
    } finally {
      setLoadingAction(null);
    }
  };

  const didSubmit = (teamId: string) => {
    if (!currentRound) return false;

    return investments.some(
      (investment) =>
        investment.team_id === teamId &&
        investment.round_id === currentRound.id
    );
  };

  const hintCount = (teamId: string) => {
    if (!currentRound) return 0;

    return hintViews.filter(
      (view) =>
        view.team_id === teamId &&
        view.round_id === currentRound.id
    ).length;
  };

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6">
      <header>
        <h1 className="text-3xl font-bold">관리자 페이지</h1>

        <p className="mt-2 text-gray-600">
          라운드를 열고, 제출 현황과 총자산 순위를 확인할 수 있습니다.
        </p>
      </header>

      {loadError && (
        <div className="rounded-xl bg-red-50 p-4 text-red-700">
          {loadError}
        </div>
      )}

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
                  {round.roundNumber}라운드 · {round.startYear}~
                  {round.endYear}
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  {round.isOpen ? "현재 열림" : "닫힘"} ·{" "}
                  {round.isResultOpen
                    ? "결과 공개됨"
                    : "결과 미공개"}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openRound(round.id)}
                  disabled={
                    loadingAction !== null ||
                    round.isOpen ||
                    round.isResultOpen
                  }
                  className="rounded-lg border px-4 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingAction === `open-${round.id}`
                    ? "여는 중..."
                    : round.isResultOpen
                      ? "진행 완료"
                      : round.isOpen
                        ? "현재 라운드"
                        : "라운드 열기"}
                </button>

                <button
                  type="button"
                  onClick={() => openResult(round.id)}
                  disabled={
                    loadingAction !== null ||
                    !round.isOpen ||
                    round.isResultOpen
                  }
                  className="rounded-lg bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingAction === `result-${round.id}`
                    ? "반영 중..."
                    : round.isResultOpen
                      ? "결과 공개됨"
                      : "결과 공개"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-xl font-bold">현재 진행 현황</h2>

        <p className="mt-2 text-gray-600">
          {currentRound
            ? `현재 ${currentRound.roundNumber}라운드(${currentRound.startYear}~${currentRound.endYear}) 진행 중입니다.`
            : "현재 열린 라운드가 없습니다."}
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3">순위</th>
                <th className="p-3">조</th>
                <th className="p-3">총자산</th>
                <th className="p-3">현금자산</th>
                <th className="p-3">주식자산</th>
                <th className="p-3">투자 제출</th>
                <th className="p-3">힌트 사용 수</th>
                <th className="p-3">팀 링크</th>
              </tr>
            </thead>

            <tbody>
              {rankedTeams.map((team, index) => (
                <tr key={team.id} className="border-b">
                  <td className="p-3">{index + 1}위</td>

                  <td className="p-3 font-semibold">
                    {team.name}
                  </td>

                  <td className="p-3 font-bold">
                    {team.totalAssets.toLocaleString("ko-KR")}원
                  </td>

                  <td className="p-3">
                    {team.cash.toLocaleString("ko-KR")}원
                  </td>

                  <td className="p-3">
                    {team.stockAssets.toLocaleString("ko-KR")}원
                  </td>

                  <td className="p-3">
                    {didSubmit(team.id) ? (
                      <span className="font-semibold text-green-700">
                        제출 완료
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        미제출
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    {hintCount(team.id)}개
                  </td>

                  <td className="p-3">
                    <Link
                      href={`/team/${team.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      열기
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          결과 공개 전 주식자산은 현재 라운드에 투자한 원금으로
          계산됩니다. 결과 공개 후에는 투자 결과가 현금자산에
          반영되므로 주식자산은 0원으로 표시됩니다.
        </p>
      </section>

      <section className="rounded-xl border border-red-200 bg-red-50 p-4">
        <h2 className="text-xl font-bold text-red-800">
          전체 초기화
        </h2>

        <p className="mt-2 text-sm leading-6 text-red-700">
          모든 투자 내역과 힌트 열람 기록을 삭제하고, 8개 조의
          자금을 각각{" "}
          {INITIAL_CASH.toLocaleString("ko-KR")}원으로 되돌리며
          모든 라운드를 닫습니다.
        </p>

        <button
          type="button"
          onClick={resetGame}
          disabled={loadingAction !== null}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingAction === "reset"
            ? "초기화 중..."
            : "전체 게임 초기화"}
        </button>
      </section>
    </main>
  );
}