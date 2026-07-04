import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateResultAmount } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roundId } = body;

    if (!roundId) {
      return NextResponse.json(
        { error: "roundId가 필요합니다." },
        { status: 400 }
      );
    }

    const { data: round, error: roundError } = await supabase
      .from("rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (roundError || !round) {
      return NextResponse.json(
        { error: "라운드를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (round.is_result_open) {
      return NextResponse.json(
        { error: "이미 결과가 공개된 라운드입니다." },
        { status: 400 }
      );
    }

    const { data: investments, error: investmentError } = await supabase
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
      return NextResponse.json(
        { error: "투자 내역 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    const { data: prices, error: priceError } = await supabase
      .from("asset_prices")
      .select("*")
      .eq("round_id", roundId);

    if (priceError) {
      return NextResponse.json(
        { error: "가격 데이터 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    const teamResultMap = new Map<string, number>();

    for (const investment of investments ?? []) {
      const price = prices?.find(
        (item) => item.asset_id === investment.asset_id
      );

      if (!price) continue;

      const resultAmount = calculateResultAmount(
        Number(investment.amount),
        Number(price.start_price),
        Number(price.end_price)
      );

      const previous = teamResultMap.get(investment.team_id) ?? 0;
      teamResultMap.set(investment.team_id, previous + resultAmount);
    }

    for (const [teamId, resultAmount] of teamResultMap.entries()) {
      const { data: team } = await supabase
        .from("teams")
        .select("cash")
        .eq("id", teamId)
        .single();

      if (!team) continue;

      await supabase
        .from("teams")
        .update({
          cash: Number(team.cash) + resultAmount,
        })
        .eq("id", teamId);
    }

    const { error: updateRoundError } = await supabase
      .from("rounds")
      .update({
        is_result_open: true,
      })
      .eq("id", roundId);

    if (updateRoundError) {
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
    console.error(error);

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}