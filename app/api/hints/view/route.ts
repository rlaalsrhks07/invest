import {
  NextRequest,
  NextResponse,
} from "next/server";

import { HINTS, type HintLevel } from "@/lib/gameData";
import { supabase } from "@/lib/supabase";

function isHintLevel(value: unknown): value is HintLevel {
  return (
    value === "low" ||
    value === "middle" ||
    value === "high"
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const teamId = body.teamId;
    const roundId = body.roundId;
    const level = body.level;

    if (!teamId || !roundId || !isHintLevel(level)) {
      return NextResponse.json(
        {
          error:
            "올바른 teamId, roundId, level이 필요합니다.",
        },
        { status: 400 }
      );
    }

    const hint = HINTS.find(
      (item) =>
        item.round_id === roundId &&
        item.level === level
    );

    if (!hint) {
      return NextResponse.json(
        {
          error: "힌트를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    const {
      data: existingView,
      error: existingViewError,
    } = await supabase
      .from("team_hint_views")
      .select("id")
      .eq("team_id", teamId)
      .eq("hint_id", hint.id)
      .maybeSingle();

    if (existingViewError) {
      console.error(
        "힌트 열람 기록 확인 실패:",
        existingViewError
      );

      return NextResponse.json(
        {
          error: "힌트 열람 기록 확인에 실패했습니다.",
        },
        { status: 500 }
      );
    }

    if (existingView) {
      return NextResponse.json({
        hint,
      });
    }

    const {
      data: team,
      error: teamError,
    } = await supabase
      .from("teams")
      .select("cash")
      .eq("id", teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        {
          error: "팀 정보를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    const currentCash = Number(team.cash);
    const cost = Number(hint.cost);

    if (
      !Number.isFinite(currentCash) ||
      !Number.isFinite(cost)
    ) {
      return NextResponse.json(
        {
          error: "자금 또는 힌트 가격 정보가 올바르지 않습니다.",
        },
        { status: 500 }
      );
    }

    if (currentCash < cost) {
      return NextResponse.json(
        {
          error: "힌트를 열람할 자금이 부족합니다.",
        },
        { status: 400 }
      );
    }

    const { error: updateCashError } = await supabase
      .from("teams")
      .update({
        cash: currentCash - cost,
      })
      .eq("id", teamId);

    if (updateCashError) {
      console.error(
        "힌트 비용 차감 실패:",
        updateCashError
      );

      return NextResponse.json(
        {
          error: "힌트 비용 차감에 실패했습니다.",
        },
        { status: 500 }
      );
    }

    const { error: insertViewError } = await supabase
      .from("team_hint_views")
      .insert({
        team_id: teamId,
        round_id: roundId,
        hint_id: hint.id,
      });

    if (insertViewError) {
      console.error(
        "힌트 열람 기록 저장 실패:",
        insertViewError
      );

      // 기록 저장 실패 시 차감한 돈을 되돌립니다.
      const { error: rollbackError } = await supabase
        .from("teams")
        .update({
          cash: currentCash,
        })
        .eq("id", teamId);

      if (rollbackError) {
        console.error(
          "힌트 비용 복구 실패:",
          rollbackError
        );
      }

      return NextResponse.json(
        {
          error: "힌트 열람 기록 저장에 실패했습니다.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hint,
    });
  } catch (error) {
    console.error(
      "힌트 열람 API 오류:",
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