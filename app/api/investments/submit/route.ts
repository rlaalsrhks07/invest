import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  ASSETS,
  getRoundById,
  getTeamById,
} from "@/lib/gameData";

import {
  getMaxInvestmentPerAsset,
} from "@/lib/investmentRules";
import { supabase } from "@/lib/supabase";

type InvestmentInput = {
  assetId?: unknown;
  amount?: unknown;
};

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const teamId = String(
      body.teamId ?? ""
    );

    const roundId = String(
      body.roundId ?? ""
    );

    const rawInvestments =
      body.investments;

    if (!getTeamById(teamId)) {
      return NextResponse.json(
        {
          error:
            "올바르지 않은 조입니다.",
        },
        { status: 400 }
      );
    }

    if (
      !getRoundById(roundId)
    ) {
      return NextResponse.json(
        {
          error:
            "올바르지 않은 라운드입니다.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(
        rawInvestments
      )
    ) {
      return NextResponse.json(
        {
          error:
            "투자 내역이 올바르지 않습니다.",
        },
        { status: 400 }
      );
    }

    const validAssetIds =
      new Set(
        ASSETS.map(
          (asset) =>
            asset.id
        )
      );

    const mergedInvestments =
      new Map<
        string,
        number
      >();

    for (
      const rawItem of
        rawInvestments as InvestmentInput[]
    ) {
      const assetId = String(
        rawItem.assetId ?? ""
      );

      const amount = Number(
        rawItem.amount
      );

      if (
        !validAssetIds.has(
          assetId
        )
      ) {
        return NextResponse.json(
          {
            error: `존재하지 않는 산업입니다: ${assetId}`,
          },
          { status: 400 }
        );
      }

      if (
        !Number.isSafeInteger(
          amount
        ) ||
        amount < 0
      ) {
        return NextResponse.json(
          {
            error:
              "투자 금액은 0원 이상의 정수여야 합니다.",
          },
          { status: 400 }
        );
      }

      const previousAmount =
        mergedInvestments.get(
          assetId
        ) ?? 0;

      const mergedAmount =
        previousAmount +
        amount;

      if (
        !Number.isSafeInteger(
          mergedAmount
        )
      ) {
        return NextResponse.json(
          {
            error:
              "산업별 투자 금액이 너무 큽니다.",
          },
          { status: 400 }
        );
      }

      mergedInvestments.set(
        assetId,
        mergedAmount
      );
    }

    const investments =
      ASSETS.map(
        (asset) => ({
          assetId: asset.id,
          amount:
            mergedInvestments.get(
              asset.id
            ) ?? 0,
        })
      );

    const totalAmount =
      investments.reduce(
        (
          sum,
          investment
        ) =>
          sum +
          investment.amount,
        0
      );

    if (
      !Number.isSafeInteger(
        totalAmount
      )
    ) {
      return NextResponse.json(
        {
          error:
            "총 투자 금액이 너무 큽니다.",
        },
        { status: 400 }
      );
    }

    const {
      data: roundState,
      error: roundError,
    } = await supabase
      .from("rounds")
      .select(
        "is_open, is_result_open"
      )
      .eq("id", roundId)
      .single();

    if (
      roundError ||
      !roundState
    ) {
      return NextResponse.json(
        {
          error:
            "라운드 상태를 확인할 수 없습니다.",
        },
        { status: 500 }
      );
    }

    if (
      !roundState.is_open
    ) {
      return NextResponse.json(
        {
          error:
            "현재 열려 있는 라운드가 아닙니다.",
        },
        { status: 400 }
      );
    }

    if (
      roundState.is_result_open
    ) {
      return NextResponse.json(
        {
          error:
            "이미 결과가 공개되어 투자할 수 없습니다.",
        },
        { status: 400 }
      );
    }

    const {
      data:
        existingInvestment,
      error: existingError,
    } = await supabase
      .from("investments")
      .select("id")
      .eq("team_id", teamId)
      .eq(
        "round_id",
        roundId
      )
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error(
        "기존 투자 확인 실패:",
        existingError
      );

      return NextResponse.json(
        {
          error:
            "기존 투자 내역 확인에 실패했습니다.",
        },
        { status: 500 }
      );
    }

    if (
      existingInvestment
    ) {
      return NextResponse.json(
        {
          error:
            "이미 투자를 제출했습니다.",
        },
        { status: 400 }
      );
    }

    const {
      data: team,
      error: teamError,
    } = await supabase
      .from("teams")
      .select("cash")
      .eq("id", teamId)
      .single();

    if (
      teamError ||
      !team
    ) {
      return NextResponse.json(
        {
          error:
            "팀 정보를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    const currentCash =
      Number(team.cash);

    if (
      !Number.isSafeInteger(
        currentCash
      ) ||
      currentCash < 0
    ) {
      return NextResponse.json(
        {
          error:
            "현재 자금 정보가 올바르지 않습니다.",
        },
        { status: 500 }
      );
    }

    const maxInvestmentPerAsset =
      getMaxInvestmentPerAsset(
        currentCash
      );

    const overLimitInvestment =
      investments.find(
        (investment) =>
          investment.amount >
          maxInvestmentPerAsset
      );

    if (overLimitInvestment) {
      const assetName =
        ASSETS.find(
          (asset) =>
            asset.id ===
            overLimitInvestment.assetId
        )?.name ??
        overLimitInvestment.assetId;

      return NextResponse.json(
        {
          error: `${assetName}에는 현재 재산의 50%인 ${maxInvestmentPerAsset.toLocaleString(
            "ko-KR"
          )}원까지만 투자할 수 있습니다.`,
        },
        { status: 400 }
      );
    }

    if (
      totalAmount >
      currentCash
    ) {
      return NextResponse.json(
        {
          error:
            "총 투자 금액이 현재 보유 자금을 초과합니다.",
        },
        { status: 400 }
      );
    }

    const rows =
      investments.map(
        (investment) => ({
          team_id: teamId,
          round_id:
            roundId,
          asset_id:
            investment.assetId,
          amount:
            investment.amount,
        })
      );

    const {
      error: insertError,
    } = await supabase
      .from("investments")
      .insert(rows);

    if (insertError) {
      console.error(
        "투자 내역 저장 실패:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "투자 내역 저장에 실패했습니다.",
        },
        { status: 500 }
      );
    }

    if (totalAmount === 0) {
      return NextResponse.json({
        success: true,
        investedAmount: 0,
        remainingCash:
          currentCash,
      });
    }

    const remainingCash =
      currentCash -
      totalAmount;

    const {
      data: updatedTeam,
      error:
        updateCashError,
    } = await supabase
      .from("teams")
      .update({
        cash: remainingCash,
      })
      .eq("id", teamId)
      .eq(
        "cash",
        currentCash
      )
      .select("cash")
      .maybeSingle();

    if (
      updateCashError ||
      !updatedTeam
    ) {
      console.error(
        "투자금 차감 실패:",
        updateCashError
      );

      const {
        error:
          rollbackError,
      } = await supabase
        .from("investments")
        .delete()
        .eq(
          "team_id",
          teamId
        )
        .eq(
          "round_id",
          roundId
        );

      if (rollbackError) {
        console.error(
          "투자 내역 복구 실패:",
          rollbackError
        );
      }

      return NextResponse.json(
        {
          error:
            "자금 정보가 동시에 변경되었습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      investedAmount:
        totalAmount,
      remainingCash,
    });
  } catch (error) {
    console.error(
      "투자 제출 API 오류:",
      error
    );

    return NextResponse.json(
      {
        error:
          "서버 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}