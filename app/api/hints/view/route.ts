import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, roundId, level } = body;

    if (!teamId || !roundId || !level) {
      return NextResponse.json(
        { error: "teamId, roundId, level이 필요합니다." },
        { status: 400 }
      );
    }

    const { data: hint, error: hintError } = await supabase
      .from("hints")
      .select("*")
      .eq("round_id", roundId)
      .eq("level", level)
      .single();

    if (hintError || !hint) {
      return NextResponse.json(
        { error: "힌트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const { data: existingView } = await supabase
      .from("team_hint_views")
      .select("id")
      .eq("team_id", teamId)
      .eq("hint_id", hint.id)
      .maybeSingle();

    if (existingView) {
      return NextResponse.json({ hint });
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
    const cost = Number(hint.cost);

    if (currentCash < cost) {
      return NextResponse.json(
        { error: "힌트를 열람할 자금이 부족합니다." },
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
      return NextResponse.json(
        { error: "힌트 비용 차감에 실패했습니다." },
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
      return NextResponse.json(
        { error: "힌트 열람 기록 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ hint });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}