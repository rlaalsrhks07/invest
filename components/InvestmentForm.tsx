"use client";

import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  useMemo,
  useState,
} from "react";

import AssetPriceChart from "@/components/AssetPriceChart";
import type { StaticAsset } from "@/lib/gameData";

type InvestmentFormProps = {
  teamId: string;
  roundId: string;
  assets: StaticAsset[];
  currentCash: number;
  alreadySubmitted: boolean;
  disabled: boolean;
  disabledReason?: string;
};

export default function InvestmentForm({
  teamId,
  roundId,
  assets,
  currentCash,
  alreadySubmitted,
  disabled,
  disabledReason,
}: InvestmentFormProps) {
  const router = useRouter();

  const [amounts, setAmounts] =
    useState<Record<string, string>>(
      {}
    );

  const [isSubmitted, setIsSubmitted] =
    useState(alreadySubmitted);

  const [loading, setLoading] =
    useState(false);

  const totalAmount = useMemo(() => {
    return assets.reduce(
      (sum, asset) => {
        const rawValue =
          amounts[asset.id] ?? "";

        if (rawValue.trim() === "") {
          return sum;
        }

        const amount =
          Number(rawValue);

        if (!Number.isFinite(amount)) {
          return sum;
        }

        return sum + amount;
      },
      0
    );
  }, [amounts, assets]);

  const hasInvalidAmount =
    useMemo(() => {
      return assets.some((asset) => {
        const rawValue =
          amounts[asset.id] ?? "";

        if (rawValue.trim() === "") {
          return false;
        }

        const amount =
          Number(rawValue);

        return (
          !Number.isSafeInteger(
            amount
          ) || amount < 0
        );
      });
    }, [amounts, assets]);

  const remainingCash =
    currentCash - totalAmount;

  const formDisabled =
    disabled ||
    isSubmitted ||
    loading;

  const handleChange = (
    assetId: string,
    value: string
  ) => {
    if (formDisabled) {
      return;
    }

    setAmounts((previous) => ({
      ...previous,
      [assetId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (disabled) {
      alert(
        disabledReason ??
          "현재는 투자할 수 없습니다."
      );
      return;
    }

    if (isSubmitted) {
      alert(
        "이미 투자를 제출했습니다."
      );
      return;
    }

    if (hasInvalidAmount) {
      alert(
        "투자 금액은 0원 이상의 정수로 입력해 주세요."
      );
      return;
    }

    if (totalAmount > currentCash) {
      alert(
        "총 투자 금액이 현재 보유 자금을 초과합니다."
      );
      return;
    }

    const investments =
      assets.map((asset) => {
        const rawValue =
          amounts[asset.id] ?? "";

        return {
          assetId: asset.id,
          amount:
            rawValue.trim() === ""
              ? 0
              : Number(rawValue),
        };
      });

    const confirmationMessage =
      totalAmount === 0
        ? "이번 라운드에는 투자하지 않고 전액을 현금으로 보유합니다.\n\n제출 후에는 수정할 수 없습니다."
        : `총 ${totalAmount.toLocaleString(
            "ko-KR"
          )}원을 투자합니다.\n\n투자 후 현금은 ${remainingCash.toLocaleString(
            "ko-KR"
          )}원이며 제출 후에는 수정할 수 없습니다.`;

    const ok = confirm(
      confirmationMessage
    );

    if (!ok) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/investments/submit",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            teamId,
            roundId,
            investments,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ??
            "투자 제출에 실패했습니다."
        );
        return;
      }

      setIsSubmitted(true);

      alert(
        totalAmount === 0
          ? "0원 투자가 제출되었습니다. 전액을 현금으로 보유합니다."
          : `투자가 제출되었습니다.\n남은 현금은 ${Number(
              data.remainingCash
            ).toLocaleString(
              "ko-KR"
            )}원입니다.`
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "투자 제출 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <header className="flex items-end justify-between gap-6">
        <div>
          <div className="text-xs font-bold tracking-[0.18em] text-zinc-400">
            INVESTMENT
          </div>

          <h2 className="mt-2 text-2xl font-black text-zinc-950">
            산업별 투자
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            이전 라운드의 가격 흐름을 살펴보고 산업별
            투자 금액을 결정하세요.
          </p>
        </div>

        <div className="rounded-xl bg-zinc-100 px-5 py-3 text-right">
          <div className="text-xs text-zinc-400">
            투자 가능 현금
          </div>

          <div className="mt-1 text-xl font-black tabular-nums text-zinc-950">
            {currentCash.toLocaleString(
              "ko-KR"
            )}
            원
          </div>
        </div>
      </header>

      {(disabled || isSubmitted) && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          {isSubmitted
            ? "이미 투자를 제출했습니다. 제출한 투자는 수정할 수 없습니다."
            : disabledReason ??
              "현재는 투자할 수 없습니다."}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-5">
        {assets.map(
          (asset, index) => (
            <article
              key={asset.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-400 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-sm font-black text-white">
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </div>

                <div>
                  <h3 className="text-xl font-black text-zinc-950">
                    {asset.name}
                  </h3>

                  <p className="mt-1 min-h-12 text-sm leading-6 text-zinc-500">
                    {asset.description}
                  </p>
                </div>
              </div>

              <AssetPriceChart
                assetId={asset.id}
                currentRoundId={
                  roundId
                }
                revealCurrentRoundResult={
                  disabled
                }
              />

              <label
                htmlFor={`investment-${asset.id}`}
                className="mt-5 block text-sm font-black text-zinc-700"
              >
                투자 금액
              </label>

              <div className="mt-2 flex items-center overflow-hidden rounded-xl border border-zinc-300 bg-white focus-within:border-zinc-950 focus-within:ring-2 focus-within:ring-zinc-950/10">
                <input
                  id={`investment-${asset.id}`}
                  type="number"
                  min="0"
                  step="1000"
                  inputMode="numeric"
                  value={
                    amounts[
                      asset.id
                    ] ?? ""
                  }
                  onChange={(
                    event: ChangeEvent<HTMLInputElement>
                  ) =>
                    handleChange(
                      asset.id,
                      event.target
                        .value
                    )
                  }
                  disabled={
                    formDisabled
                  }
                  placeholder="0"
                  className="w-full border-0 px-4 py-3 text-right text-lg font-black outline-none disabled:bg-zinc-100 disabled:text-zinc-400"
                />

                <span className="border-l border-zinc-200 bg-zinc-50 px-4 py-3 font-bold text-zinc-500">
                  원
                </span>
              </div>
            </article>
          )
        )}
      </div>

      <div className="sticky bottom-4 z-20 mt-6 rounded-2xl border border-zinc-300 bg-white/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between gap-6">
          <div className="flex gap-8">
            <div>
              <div className="text-xs font-bold text-zinc-400">
                총 투자 금액
              </div>

              <div
                className={`mt-1 text-xl font-black tabular-nums ${
                  totalAmount >
                    currentCash ||
                  hasInvalidAmount
                    ? "text-red-600"
                    : "text-zinc-950"
                }`}
              >
                {totalAmount.toLocaleString(
                  "ko-KR"
                )}
                원
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-zinc-400">
                투자 후 현금
              </div>

              <div
                className={`mt-1 text-xl font-black tabular-nums ${
                  remainingCash < 0
                    ? "text-red-600"
                    : "text-zinc-950"
                }`}
              >
                {remainingCash.toLocaleString(
                  "ko-KR"
                )}
                원
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              formDisabled ||
              hasInvalidAmount ||
              totalAmount >
                currentCash
            }
            className="min-w-48 rounded-xl bg-zinc-950 px-7 py-4 text-base font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading
              ? "제출 중..."
              : isSubmitted
                ? "제출 완료"
                : totalAmount ===
                    0
                  ? "0원 투자 제출"
                  : "투자 제출"}
          </button>
        </div>
      </div>
    </section>
  );
}