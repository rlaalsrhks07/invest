"use client";

import { useState } from "react";

type Asset = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
};

type InvestmentFormProps = {
  teamId: string;
  roundId: string;
  assets: Asset[];
  alreadySubmitted: boolean;
};

export default function InvestmentForm({
  teamId,
  roundId,
  assets,
  alreadySubmitted,
}: InvestmentFormProps) {
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(alreadySubmitted);
  const [loading, setLoading] = useState(false);

  const totalAmount = Object.values(amounts).reduce((sum, value) => {
    return sum + Number(value || 0);
  }, 0);

  const handleChange = (assetId: string, value: string) => {
    if (isSubmitted) return;

    setAmounts((prev) => ({
      ...prev,
      [assetId]: value,
    }));
  };

  const handleSubmit = async () => {
    const investments = Object.entries(amounts)
      .map(([assetId, amount]) => ({
        assetId,
        amount: Number(amount),
      }))
      .filter((item) => item.amount > 0);

    if (investments.length === 0) {
      alert("최소 하나 이상의 산업에 투자해야 합니다.");
      return;
    }

    const ok = confirm(
      `총 ${totalAmount.toLocaleString(
        "ko-KR"
      )}원을 투자합니다. 제출 후 수정할 수 없습니다.`
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

      alert("투자가 제출되었습니다.");
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("투자 제출 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border p-4">
      <h2 className="text-xl font-bold">투자하기</h2>

      {isSubmitted && (
        <div className="mt-3 rounded-lg bg-blue-50 p-3 text-blue-700">
          이미 이번 라운드 투자를 제출했습니다.
        </div>
      )}

      <div className="mt-4 space-y-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_180px]"
          >
            <div>
              <div className="font-bold">{asset.name}</div>
              <div className="text-sm text-gray-500">{asset.category}</div>
              {asset.description && (
                <p className="mt-1 text-sm text-gray-600">
                  {asset.description}
                </p>
              )}
            </div>

            <input
              type="number"
              min="0"
              placeholder="투자 금액"
              value={amounts[asset.id] ?? ""}
              onChange={(event) => handleChange(asset.id, event.target.value)}
              disabled={isSubmitted}
              className="rounded-lg border px-3 py-2"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="font-bold">
          총 투자 금액: {totalAmount.toLocaleString("ko-KR")}원
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || isSubmitted}
          className="rounded-lg bg-black px-5 py-3 font-bold text-white disabled:opacity-50"
        >
          투자 제출
        </button>
      </div>
    </section>
  );
}