import {
  NextRequest,
  NextResponse,
} from "next/server";

import { ASSET_PRICES } from "@/lib/gameData";
import { calculateResultAmount } from "@/lib/scoring";
import { supabase } from "@/lib/supabase";

type InvestmentRow = {
  id: string;
  team_id: string;
  asset_id: string;
  amount: number | string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const roundId = body.roundId;

    if (!roundId) {
      return NextResponse.json(
        {
          error: "roundId가 필요합니다.",
        },
        { status: 400 }
      );
    }

    const {
      data: round,
      error: roundError,
    } = await supabase
      .from("rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (roundError || !round) {
      return NextResponse.json(
        {
          error: "라운드를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    if (round.is_result_open) {
      return NextResponse.json(
        {
          error: "이미 결과가 공개된 라운드입니다.",
        },
        { status: 400 }
      );
    }

    const {
      data: investmentData,
      error: investmentError,
    } = await supabase
      .from("investments")
      .select(
        `
        id,
        team_id,
        asset_id,
        amount
        `
      )
      .eq("round_id", roundId);

    if (investmentError) {
      console.error(
        "투자 내역 조회 실패:",
        investmentError
      );

      return NextResponse.json(
        {
          error: "투자 내역 조회에 실패했습니다.",
        },
        { status: 500 }
      );
    }

    const investments =
      (investmentData ?? []) as InvestmentRow[];

    const prices = ASSET_PRICES.filter(
      (price) => price.round_id === roundId
    );

    if (prices.length === 0) {
      return NextResponse.json(
        {
          error:
            "현재 라운드의 가격 데이터가 코드에 없습니다.",
        },
        { status: 500 }
      );
    }

    const teamResultMap = new Map<string, number>();

    for (const investment of investments) {
      const price = prices.find(
        (item) =>
          item.asset_id === investment.asset_id
      );

      if (!price) {
        console.error(
          `가격 정보 없음: round=${roundId}, asset=${investment.asset_id}`
        );
        continue;
      }

      const investmentAmount = Number(
        investment.amount
      );

      if (
        !Number.isFinite(investmentAmount) ||
        investmentAmount <= 0
      ) {
        continue;
      }

      const resultAmount = calculateResultAmount(
        investmentAmount,
        price.start_price,
        price.end_price
      );

      const previousAmount =
        teamResultMap.get(investment.team_id) ?? 0;

      teamResultMap.set(
        investment.team_id,
        previousAmount + resultAmount
      );
    }

    for (const [
      teamId,
      resultAmount,
    ] of teamResultMap.entries()) {
      const {
        data: team,
        error: teamError,
      } = await supabase
        .from("teams")
        .select("cash")
        .eq("id", teamId)
        .single();

      if (teamError || !team) {
        console.error(
          `팀 자금 조회 실패: ${teamId}`,
          teamError
        );

        return NextResponse.json(
          {
            error:
              "일부 팀의 자금 정보를 불러오지 못했습니다.",
          },
          { status: 500 }
        );
      }

      const currentCash = Number(team.cash);

      if (!Number.isFinite(currentCash)) {
        return NextResponse.json(
          {
            error:
              "팀의 현재 자금 정보가 올바르지 않습니다.",
          },
          { status: 500 }
        );
      }

      const { error: updateTeamError } =
        await supabase
          .from("teams")
          .update({
            cash: currentCash + resultAmount,
          })
          .eq("id", teamId);

      if (updateTeamError) {
        console.error(
          `팀 자금 반영 실패: ${teamId}`,
          updateTeamError
        );

        return NextResponse.json(
          {
            error:
              "일부 팀의 투자 결과 반영에 실패했습니다.",
          },
          { status: 500 }
        );
      }
    }

    const { error: updateRoundError } =
      await supabase
        .from("rounds")
        .update({
          is_result_open: true,
        })
        .eq("id", roundId);

    if (updateRoundError) {
      console.error(
        "결과 공개 상태 변경 실패:",
        updateRoundError
      );

      return NextResponse.json(
        {
          error: "결과 공개 상태 변경에 실패했습니다.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      results: Object.fromEntries(teamResultMap),
    });
  } catch (error) {
    console.error(
      "결과 공개 API 오류:",
      error
    );

    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}