import { NextRequest, NextResponse } from "next/server";

import { INITIAL_CASH, ROUNDS, TEAMS } from "@/lib/gameData";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.confirmation !== "reset") {
      return NextResponse.json(
        { error: '초기화하려면 "reset"을 정확히 입력해야 합니다.' },
        { status: 400 }
      );
    }

    const { error: hintDeleteError } = await supabase
      .from("team_hint_views")
      .delete()
      .not("id", "is", null);

    if (hintDeleteError) {
      console.error("힌트 기록 삭제 실패:", hintDeleteError);
      return NextResponse.json(
        { error: "힌트 기록 초기화에 실패했습니다." },
        { status: 500 }
      );
    }

    const { error: investmentDeleteError } = await supabase
      .from("investments")
      .delete()
      .not("id", "is", null);

    if (investmentDeleteError) {
      console.error("투자 기록 삭제 실패:", investmentDeleteError);
      return NextResponse.json(
        { error: "투자 기록 초기화에 실패했습니다." },
        { status: 500 }
      );
    }

    const { error: teamResetError } = await supabase
      .from("teams")
      .update({ cash: INITIAL_CASH })
      .in(
        "id",
        TEAMS.map((team) => team.id)
      );

    if (teamResetError) {
      console.error("팀 자금 초기화 실패:", teamResetError);
      return NextResponse.json(
        { error: "팀 자금 초기화에 실패했습니다." },
        { status: 500 }
      );
    }

    const { error: roundResetError } = await supabase
      .from("rounds")
      .update({
        is_open: false,
        is_result_open: false,
      })
      .in(
        "id",
        ROUNDS.map((round) => round.id)
      );

    if (roundResetError) {
      console.error("라운드 초기화 실패:", roundResetError);
      return NextResponse.json(
        { error: "라운드 초기화에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("전체 초기화 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
