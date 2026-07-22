"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { HintLevel, ViewedHint } from "@/lib/gameData";

type HintPanelProps = {
  teamId: string;
  roundId: string;
  initialViewedHints: ViewedHint[];
  disabled: boolean;
  disabledReason?: string;
};

const LEVELS: HintLevel[] = ["low", "middle", "high"];

const LEVEL_LABEL: Record<HintLevel, string> = {
  low: "하",
  middle: "중",
  high: "상",
};

const LEVEL_PERCENT: Record<HintLevel, number> = {
  low: 10,
  middle: 20,
  high: 30,
};

export default function HintPanel({
  teamId,
  roundId,
  initialViewedHints,
  disabled,
  disabledReason,
}: HintPanelProps) {
  const router = useRouter();
  const [viewedHints, setViewedHints] =
    useState<ViewedHint[]>(initialViewedHints);
  const [loadingLevel, setLoadingLevel] = useState<HintLevel | null>(null);

  const handleViewHint = async (level: HintLevel) => {
    if (disabled) {
      alert(disabledReason ?? "현재는 힌트를 구매할 수 없습니다.");
      return;
    }

    const alreadyViewed = viewedHints.find((hint) => hint.level === level);

    if (alreadyViewed) {
      alert("이미 열람한 힌트입니다.");
      return;
    }

    const ok = confirm(
      `${LEVEL_LABEL[level]} 힌트를 열람하시겠습니까? 현재 보유 자금의 ${LEVEL_PERCENT[level]}%가 차감됩니다.`
    );

    if (!ok) return;

    try {
      setLoadingLevel(level);

      const response = await fetch("/api/hints/view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId,
          roundId,
          level,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error ?? "힌트 열람에 실패했습니다.");
        return;
      }

      const viewedHint = {
        ...data.hint,
        deductedAmount: Number(data.deductedAmount),
      } as ViewedHint;

      setViewedHints((previous) => {
        const exists = previous.some((hint) => hint.id === viewedHint.id);
        return exists ? previous : [...previous, viewedHint];
      });

      alert(
        `${Number(data.deductedAmount).toLocaleString("ko-KR")}원이 차감되었습니다. 남은 자금은 ${Number(data.remainingCash).toLocaleString("ko-KR")}원입니다.`
      );

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("힌트 열람 중 오류가 발생했습니다.");
    } finally {
      setLoadingLevel(null);
    }
  };

  return (
    <section className="rounded-xl border p-4">
      <h2 className="text-xl font-bold">힌트</h2>
      <p className="mt-2 text-sm text-gray-600">
        하·중·상 힌트는 구매 시점의 현재 보유 자금에서 각각 10%, 20%,
        30%가 차감됩니다. 이미 본 힌트는 다시 차감되지 않습니다.
      </p>

      {disabled && disabledReason && (
        <p className="mt-3 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          {disabledReason}
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {LEVELS.map((level) => {
          const alreadyViewed = viewedHints.some(
            (hint) => hint.level === level
          );
          const isLoading = loadingLevel === level;

          return (
            <button
              key={level}
              type="button"
              onClick={() => handleViewHint(level)}
              disabled={disabled || alreadyViewed || isLoading}
              className="rounded-lg border px-4 py-3 font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {alreadyViewed
                ? `${LEVEL_LABEL[level]} 힌트 열람 완료`
                : isLoading
                  ? "처리 중..."
                  : `${LEVEL_LABEL[level]} 힌트 보기 (${LEVEL_PERCENT[level]}%)`}
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-4">
        {viewedHints.length === 0 ? (
          <p className="text-gray-500">아직 열람한 힌트가 없습니다.</p>
        ) : (
          viewedHints
            .slice()
            .sort(
              (a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level)
            )
            .map((hint) => (
              <article key={hint.id} className="rounded-lg bg-gray-50 p-4">
                <div className="text-sm font-semibold text-gray-500">
                  {LEVEL_LABEL[hint.level]} 힌트 · 총자산의{" "}
                  {Math.round(hint.deductionRate * 100)}% · 실제 차감액{" "}
                  {hint.deductedAmount.toLocaleString("ko-KR")}원
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  [{hint.sourceLabel}]
                </div>
                <h3 className="mt-1 text-lg font-bold">{hint.title}</h3>
                <p className="mt-3 whitespace-pre-wrap leading-7">
                  {hint.content}
                </p>
              </article>
            ))
        )}
      </div>
    </section>
  );
}
