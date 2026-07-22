import { NextRequest, NextResponse } from "next/server";

import {
  getAssetReturn,
  getRoundById,
  getTeamById,
} from "@/lib/gameData";
import { calculateResultAmount } from "@/lib/scoring";
import { supabase } from "@/lib/supabase";

type InvestmentRow = {
  team_id: string;
  asset_id: string;
  amount: number | string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const roundId = String(body.roundId ?? "");

    if (!getRoundById(roundId)) {
      return NextResponse.json(
        { error: "올바르지 않은 라운드입니다." },
        { status: 400 }
      );
    }

    const { data: roundState, error: roundError } = await supabase
      .from("rounds")
      .select("is_open, is_result_open")
      .eq("id", roundId)
      .single();

    if (roundError || !roundState) {
      return NextResponse.json(
        { error: "라운드 상태를 확인할 수 없습니다." },
        { status: 500 }
      );
    }

    if (!roundState.is_open) {
      return NextResponse.json(
        { error: "현재 열려 있는 라운드가 아닙니다." },
        { status: 400 }
      );
    }

    if (roundState.is_result_open) {
      return NextResponse.json(
        { error: "이미 결과가 공개된 라운드입니다." },
        { status: 400 }
      );
    }

    const { data: investmentData, error: investmentError } = await supabase
      .from("investments")
      .select("team_id, asset_id, amount")
      .eq("round_id", roundId);

    if (investmentError) {
      console.error("투자 내역 조회 실패:", investmentError);
      return NextResponse.json(
        { error: "투자 내역 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    const teamResultMap = new Map<string, number>();

    for (const investment of (investmentData ?? []) as InvestmentRow[]) {
      if (!getTeamById(investment.team_id)) {
        console.error("알 수 없는 팀 투자 내역:", investment.team_id);
        continue;
      }

      const returnData = getAssetReturn(roundId, investment.asset_id);

      if (!returnData) {
        console.error(
          `가격 데이터 없음: round=${roundId}, asset=${investment.asset_id}`
        );
        return NextResponse.json(
          {
            error: `산업 ${investment.asset_id}의 수익률 데이터가 없습니다.`,
          },
          { status: 500 }
        );
      }

      const amount = Number(investment.amount);

      if (!Number.isSafeInteger(amount) || amount <= 0) {
        console.error("올바르지 않은 투자 금액:", investment);
        continue;
      }

      const resultAmount = calculateResultAmount(
        amount,
        100,
        100 + returnData.returnRate
      );

      teamResultMap.set(
        investment.team_id,
        (teamResultMap.get(investment.team_id) ?? 0) + resultAmount
      );
    }

    for (const [teamId, resultAmount] of teamResultMap.entries()) {
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("cash")
        .eq("id", teamId)
        .single();

      if (teamError || !team) {
        console.error(`팀 자금 조회 실패: ${teamId}`, teamError);
        return NextResponse.json(
          { error: "일부 팀의 자금 정보를 불러오지 못했습니다." },
          { status: 500 }
        );
      }

      const currentCash = Number(team.cash);
      const nextCash = currentCash + resultAmount;

      const { data: updatedTeam, error: updateTeamError } = await supabase
        .from("teams")
        .update({ cash: nextCash })
        .eq("id", teamId)
        .eq("cash", currentCash)
        .select("id")
        .maybeSingle();

      if (updateTeamError || !updatedTeam) {
        console.error(`팀 자금 반영 실패: ${teamId}`, updateTeamError);
        return NextResponse.json(
          {
            error:
              "일부 팀의 자금이 동시에 변경되었습니다. 다시 시도하기 전에 팀별 자금을 확인해 주세요.",
          },
          { status: 409 }
        );
      }
    }

    const { data: updatedRound, error: updateRoundError } = await supabase
      .from("rounds")
      .update({ is_result_open: true })
      .eq("id", roundId)
      .eq("is_result_open", false)
      .select("id")
      .maybeSingle();

    if (updateRoundError || !updatedRound) {
      console.error("결과 공개 상태 변경 실패:", updateRoundError);
      return NextResponse.json(
        { error: "결과 공개 상태 변경에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      results: Object.fromEntries(teamResultMap),
    });
  } catch (error) {
    console.error("결과 공개 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
