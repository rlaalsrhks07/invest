import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, roundId, investments } = body;

    if (!teamId || !roundId || !Array.isArray(investments)) {
      return NextResponse.json(
        { error: "teamId, roundId, investments가 필요합니다." },
        { status: 400 }
      );
    }

    const { data: existingInvestments } = await supabase
      .from("investments")
      .select("id")
      .eq("team_id", teamId)
      .eq("round_id", roundId)
      .limit(1);

    if (existingInvestments && existingInvestments.length > 0) {
      return NextResponse.json(
        { error: "이미 이번 라운드 투자를 제출했습니다." },
        { status: 400 }
      );
    }

    const cleanedInvestments = investments
      .map((item: any) => ({
        team_id: teamId,
        round_id: roundId,
        asset_id: item.assetId,
        amount: Number(item.amount),
      }))
      .filter((item: any) => item.asset_id && item.amount > 0);

    if (cleanedInvestments.length === 0) {
      return NextResponse.json(
        { error: "유효한 투자 항목이 없습니다." },
        { status: 400 }
      );
    }

    const totalAmount = cleanedInvestments.reduce(
      (sum: number, item: any) => sum + item.amount,
      0
    );

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("cash")
      .eq("id", teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: "팀 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const currentCash = Number(team.cash);

    if (totalAmount > currentCash) {
      return NextResponse.json(
        { error: "보유 자금보다 많이 투자할 수 없습니다." },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase
      .from("investments")
      .insert(cleanedInvestments);

    if (insertError) {
      return NextResponse.json(
        { error: "투자 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    const { error: updateCashError } = await supabase
      .from("teams")
      .update({
        cash: currentCash - totalAmount,
      })
      .eq("id", teamId);

    if (updateCashError) {
      return NextResponse.json(
        { error: "투자금 차감에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      totalAmount,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}