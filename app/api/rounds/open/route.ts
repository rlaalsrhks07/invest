import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    const { error: closeError } = await supabase
      .from("rounds")
      .update({ is_open: false })
      .neq("id", roundId);

    if (closeError) {
      console.error("closeError", closeError);
      return NextResponse.json(
        { error: closeError.message },
        { status: 500 }
      );
    }

    const { error: openError } = await supabase
      .from("rounds")
      .update({
        is_open: true,
        is_result_open: false,
      })
      .eq("id", roundId);

    if (openError) {
      console.error("openError", openError);
      return NextResponse.json(
        { error: openError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("round open route error", error);

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}