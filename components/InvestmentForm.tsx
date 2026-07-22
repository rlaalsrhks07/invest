"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, useMemo, useState } from "react";

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
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(alreadySubmitted);
  const [loading, setLoading] = useState(false);

  const totalAmount = useMemo(
    () =>
      Object.values(amounts).reduce((sum, value) => {
        const amount = Number(value || 0);
        return Number.isFinite(amount) ? sum + amount : sum;
      }, 0),
    [amounts]
  );

  const formDisabled = disabled || isSubmitted || loading;

  const handleChange = (assetId: string, value: string) => {
    if (formDisabled) return;

    setAmounts((previous) => ({
      ...previous,
      [assetId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (disabled) {
      alert(disabledReason ?? "현재는 투자할 수 없습니다.");
      return;
    }

    if (isSubmitted) {
      alert("이미 투자를 제출했습니다.");
      return;
    }

    const investments = Object.entries(amounts)
      .map(([assetId, amount]) => ({
        assetId,
        amount: Number(amount),
      }))
      .filter(
        (item) => Number.isFinite(item.amount) && item.amount > 0
      );

    if (investments.length === 0) {
      alert("최소 하나 이상의 산업에 투자해야 합니다.");
      return;
    }

    if (!Number.isInteger(totalAmount)) {
      alert("투자 금액은 원 단위의 정수로 입력해 주세요.");
      return;
    }

    if (totalAmount > currentCash) {
      alert("총 투자 금액이 현재 보유 자금을 초과합니다.");
      return;
    }

    const ok = confirm(
      `총 ${totalAmount.toLocaleString("ko-KR")}원을 투자합니다. 제출 후 수정할 수 없습니다.`
    );

    if (!ok) return;

    try {
      setLoading(true);

      const response = await fetch("/api/investments/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId,
          roundId,
          investments,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error ?? "투자 제출에 실패했습니다.");
        return;
      }

      setIsSubmitted(true);
      alert(
        `투자가 제출되었습니다. 남은 현금은 ${Number(data.remainingCash).toLocaleString("ko-KR")}원입니다.`
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("투자 제출 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">산업별 투자</h2>
          <p className="mt-2 text-sm text-gray-600">
            현재 투자 가능 금액: {currentCash.toLocaleString("ko-KR")}원
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">총 투자 금액</div>
          <div
            className={`text-xl font-bold ${
              totalAmount > currentCash ? "text-red-600" : ""
            }`}
          >
            {totalAmount.toLocaleString("ko-KR")}원
          </div>
        </div>
      </div>

      {(disabled || isSubmitted) && (
        <p className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          {isSubmitted
            ? "이미 투자를 제출했습니다. 제출한 투자는 수정할 수 없습니다."
            : disabledReason ?? "현재는 투자할 수 없습니다."}
        </p>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {assets.map((asset) => (
          <label key={asset.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold">{asset.name}</div>
                <div className="text-sm text-gray-500">ETF: {asset.etf}</div>
              </div>
            </div>

            <p className="mt-2 text-sm text-gray-600">{asset.description}</p>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1000"
                inputMode="numeric"
                value={amounts[asset.id] ?? ""}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange(asset.id, event.target.value)
                }
                disabled={formDisabled}
                placeholder="0"
                className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100"
              />
              <span className="shrink-0">원</span>
            </div>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={formDisabled || totalAmount <= 0 || totalAmount > currentCash}
        className="mt-5 w-full rounded-lg bg-black px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "제출 중..." : isSubmitted ? "제출 완료" : "투자 제출"}
      </button>
    </section>
  );
}
