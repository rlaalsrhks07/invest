import { NextRequest, NextResponse } from "next/server";

import { ROUNDS, getRoundById } from "@/lib/gameData";
import { supabase } from "@/lib/supabase";

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

    const { data: targetRound, error: targetRoundError } = await supabase
      .from("rounds")
      .select("is_result_open")
      .eq("id", roundId)
      .single();

    if (targetRoundError || !targetRound) {
      return NextResponse.json(
        { error: "라운드 상태를 확인할 수 없습니다." },
        { status: 500 }
      );
    }

    if (targetRound.is_result_open) {
      return NextResponse.json(
        {
          error:
            "이미 결과가 공개된 라운드는 다시 열 수 없습니다. 다시 진행하려면 전체 초기화를 사용하세요.",
        },
        { status: 400 }
      );
    }

    const roundIds = ROUNDS.map((round) => round.id);

    const { error: closeError } = await supabase
      .from("rounds")
      .update({ is_open: false })
      .in("id", roundIds);

    if (closeError) {
      console.error("기존 라운드 닫기 실패:", closeError);
      return NextResponse.json(
        { error: "기존 라운드를 닫지 못했습니다." },
        { status: 500 }
      );
    }

    const { data: openedRound, error: openError } = await supabase
      .from("rounds")
      .update({
        is_open: true,
        is_result_open: false,
      })
      .eq("id", roundId)
      .select("id")
      .maybeSingle();

    if (openError || !openedRound) {
      console.error("라운드 열기 실패:", openError);
      return NextResponse.json(
        { error: "라운드를 열지 못했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("라운드 열기 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
