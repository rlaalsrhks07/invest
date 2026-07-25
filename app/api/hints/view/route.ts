import { NextRequest, NextResponse } from "next/server";

import {
  getHint,
  getRoundById,
  getTeamById,
  type HintLevel,
} from "@/lib/gameData";
import { supabase } from "@/lib/supabase";

function isHintLevel(value: unknown): value is HintLevel {
  return value === "low" || value === "middle" || value === "high";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const teamId = String(body.teamId ?? "");
    const roundId = String(body.roundId ?? "");
    const level = body.level;

    if (!getTeamById(teamId)) {
      return NextResponse.json(
        { error: "올바르지 않은 조입니다." },
        { status: 400 }
      );
    }

    if (!getRoundById(roundId)) {
      return NextResponse.json(
        { error: "올바르지 않은 라운드입니다." },
        { status: 400 }
      );
    }

    if (!isHintLevel(level)) {
      return NextResponse.json(
        { error: "올바르지 않은 힌트 단계입니다." },
        { status: 400 }
      );
    }

    const hint = getHint(roundId, level);

    if (!hint) {
      return NextResponse.json(
        { error: "힌트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const { data: existingView, error: existingViewError } = await supabase
      .from("team_hint_views")
      .select("hint_id, deducted_amount")
      .eq("team_id", teamId)
      .eq("round_id", roundId)
      .limit(1)
      .maybeSingle();

    if (existingViewError) {
      console.error("힌트 열람 기록 확인 실패:", existingViewError);
      return NextResponse.json(
        { error: "힌트 열람 기록 확인에 실패했습니다." },
        { status: 500 }
      );
    }

    if (existingView) {
      if (existingView.hint_id !== hint.id) {
        return NextResponse.json(
          {
            error:
              "이번 라운드에서는 힌트를 하나만 구매할 수 있습니다.",
          },
          { status: 409 }
        );
      }

      const { data: team } = await supabase
        .from("teams")
        .select("cash")
        .eq("id", teamId)
        .single();

      return NextResponse.json({
        hint,
        deductedAmount: Number(existingView.deducted_amount),
        remainingCash: Number(team?.cash ?? 0),
        alreadyViewed: true,
      });
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
        { error: "이미 결과가 공개되어 힌트를 구매할 수 없습니다." },
        { status: 400 }
      );
    }

    const { data: submittedInvestment, error: investmentError } =
      await supabase
        .from("investments")
        .select("id")
        .eq("team_id", teamId)
        .eq("round_id", roundId)
        .limit(1)
        .maybeSingle();

    if (investmentError) {
      console.error("투자 제출 여부 확인 실패:", investmentError);
      return NextResponse.json(
        { error: "투자 제출 여부 확인에 실패했습니다." },
        { status: 500 }
      );
    }

    if (submittedInvestment) {
      return NextResponse.json(
        { error: "투자를 제출한 뒤에는 새 힌트를 구매할 수 없습니다." },
        { status: 400 }
      );
    }

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

    if (!Number.isFinite(currentCash) || currentCash < 0) {
      return NextResponse.json(
        { error: "현재 자금 정보가 올바르지 않습니다." },
        { status: 500 }
      );
    }

    const deductedAmount = Math.floor(currentCash * hint.deductionRate);
    const remainingCash = currentCash - deductedAmount;

    const { data: updatedTeam, error: updateCashError } = await supabase
      .from("teams")
      .update({ cash: remainingCash })
      .eq("id", teamId)
      .eq("cash", currentCash)
      .select("cash")
      .maybeSingle();

    if (updateCashError || !updatedTeam) {
      console.error("힌트 비용 차감 실패:", updateCashError);
      return NextResponse.json(
        {
          error:
            "자금 정보가 동시에 변경되었습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.",
        },
        { status: 409 }
      );
    }

    const { error: insertViewError } = await supabase
      .from("team_hint_views")
      .insert({
        team_id: teamId,
        round_id: roundId,
        hint_id: hint.id,
        deducted_amount: deductedAmount,
      });

    if (insertViewError) {
      console.error("힌트 열람 기록 저장 실패:", insertViewError);

      const { error: rollbackError } = await supabase
        .from("teams")
        .update({ cash: currentCash })
        .eq("id", teamId)
        .eq("cash", remainingCash);

      if (rollbackError) {
        console.error("힌트 비용 복구 실패:", rollbackError);
      }

      if (insertViewError.code === "23505") {
        return NextResponse.json(
          {
            error:
              "이번 라운드에서는 힌트를 하나만 구매할 수 있습니다.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "힌트 열람 기록 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hint,
      deductedAmount,
      remainingCash,
      alreadyViewed: false,
    });
  } catch (error) {
    console.error("힌트 열람 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
