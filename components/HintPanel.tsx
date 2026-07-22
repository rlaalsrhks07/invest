"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  HintLevel,
  ViewedHint,
} from "@/lib/gameData";

type HintPanelProps = {
  teamId: string;
  roundId: string;
  currentCash: number;
  initialViewedHints: ViewedHint[];
  disabled: boolean;
  disabledReason?: string;
};

const LEVELS: HintLevel[] = [
  "low",
  "middle",
  "high",
];

const LEVEL_META: Record<
  HintLevel,
  {
    label: string;
    englishLabel: string;
    percent: number;
  }
> = {
  low: {
    label: "하",
    englishLabel: "BASIC",
    percent: 10,
  },
  middle: {
    label: "중",
    englishLabel: "DETAIL",
    percent: 20,
  },
  high: {
    label: "상",
    englishLabel: "ANALYSIS",
    percent: 30,
  },
};

export default function HintPanel({
  teamId,
  roundId,
  currentCash,
  initialViewedHints,
  disabled,
  disabledReason,
}: HintPanelProps) {
  const router = useRouter();

  const [viewedHints, setViewedHints] =
    useState<ViewedHint[]>(
      initialViewedHints
    );

  const [availableCash, setAvailableCash] =
    useState(currentCash);

  const [loadingLevel, setLoadingLevel] =
    useState<HintLevel | null>(null);

  const handleViewHint = async (
    level: HintLevel
  ) => {
    if (disabled) {
      alert(
        disabledReason ??
          "현재는 힌트를 구매할 수 없습니다."
      );
      return;
    }

    const alreadyViewed = viewedHints.find(
      (hint) => hint.level === level
    );

    if (alreadyViewed) {
      alert("이미 열람한 힌트입니다.");
      return;
    }

    const meta = LEVEL_META[level];

    const estimatedCost = Math.floor(
      availableCash *
        (meta.percent / 100)
    );

    const ok = confirm(
      `${meta.label} 힌트를 열람하시겠습니까?\n\n현재 자산의 ${
        meta.percent
      }%인 ${estimatedCost.toLocaleString(
        "ko-KR"
      )}원이 차감될 예정입니다.`
    );

    if (!ok) {
      return;
    }

    try {
      setLoadingLevel(level);

      const response = await fetch(
        "/api/hints/view",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            teamId,
            roundId,
            level,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ??
            "힌트 열람에 실패했습니다."
        );
        return;
      }

      const viewedHint = {
        ...data.hint,
        deductedAmount: Number(
          data.deductedAmount
        ),
      } as ViewedHint;

      setViewedHints((previous) => {
        const exists = previous.some(
          (hint) =>
            hint.id === viewedHint.id
        );

        return exists
          ? previous
          : [...previous, viewedHint];
      });

      setAvailableCash(
        Number(data.remainingCash)
      );

      alert(
        `${Number(
          data.deductedAmount
        ).toLocaleString(
          "ko-KR"
        )}원이 차감되었습니다.`
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "힌트 열람 중 오류가 발생했습니다."
      );
    } finally {
      setLoadingLevel(null);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <header>
        <div className="text-xs font-bold tracking-[0.18em] text-zinc-400">
          HINT SHOP
        </div>

        <h2 className="mt-2 text-2xl font-black text-zinc-950">
          힌트 상점
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          힌트 비용은 구매 직전의 현재 자산을
          기준으로 계산됩니다.
        </p>
      </header>

      {disabled && disabledReason && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          {disabledReason}
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4">
        {LEVELS.map((level) => {
          const meta = LEVEL_META[level];

          const viewedHint =
            viewedHints.find(
              (hint) =>
                hint.level === level
            );

          const isLoading =
            loadingLevel === level;

          const estimatedCost =
            Math.floor(
              availableCash *
                (meta.percent / 100)
            );

          return (
            <article
              key={level}
              className={
                viewedHint
                  ? "rounded-2xl border border-zinc-950 bg-zinc-950 p-5 text-white"
                  : "rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className={
                      viewedHint
                        ? "text-xs font-bold tracking-[0.16em] text-white/50"
                        : "text-xs font-bold tracking-[0.16em] text-zinc-400"
                    }
                  >
                    {meta.englishLabel}
                  </div>

                  <h3 className="mt-1 text-xl font-black">
                    {meta.label} 힌트
                  </h3>
                </div>

                <span
                  className={
                    viewedHint
                      ? "rounded-full bg-white/15 px-3 py-1 text-sm font-black"
                      : "rounded-full bg-white px-3 py-1 text-sm font-black text-zinc-900 shadow-sm"
                  }
                >
                  {meta.percent}%
                </span>
              </div>

              <div
                className={
                  viewedHint
                    ? "mt-4 rounded-xl bg-white/10 p-3"
                    : "mt-4 rounded-xl bg-white p-3"
                }
              >
                <div
                  className={
                    viewedHint
                      ? "text-xs text-white/50"
                      : "text-xs text-zinc-400"
                  }
                >
                  {viewedHint
                    ? "실제 차감액"
                    : "현재 예상 비용"}
                </div>

                <div className="mt-1 text-lg font-black tabular-nums">
                  {(
                    viewedHint?.deductedAmount ??
                    estimatedCost
                  ).toLocaleString("ko-KR")}
                  원
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleViewHint(level)
                }
                disabled={
                  disabled ||
                  Boolean(viewedHint) ||
                  isLoading
                }
                className={
                  viewedHint
                    ? "mt-4 w-full rounded-xl bg-white/10 px-4 py-3 font-black text-white/60"
                    : "mt-4 w-full rounded-xl bg-zinc-950 px-4 py-3 font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                }
              >
                {viewedHint
                  ? "열람 완료"
                  : isLoading
                    ? "처리 중..."
                    : "힌트 구매"}
              </button>
            </article>
          );
        })}
      </div>

      {viewedHints.length > 0 && (
        <div className="mt-8 space-y-4 border-t border-zinc-200 pt-6">
          <h3 className="text-lg font-black text-zinc-950">
            구매한 힌트
          </h3>

          {viewedHints
            .slice()
            .sort(
              (a, b) =>
                LEVELS.indexOf(a.level) -
                LEVELS.indexOf(b.level)
            )
            .map((hint) => {
              const meta =
                LEVEL_META[hint.level];

              return (
                <article
                  key={hint.id}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-zinc-400">
                        {meta.label} 힌트 ·{" "}
                        {Math.round(
                          hint.deductionRate *
                            100
                        )}
                        %
                      </div>

                      <div className="mt-2 text-sm font-bold text-zinc-500">
                        [{hint.sourceLabel}]
                      </div>

                      <h4 className="mt-1 text-xl font-black text-zinc-950">
                        {hint.title}
                      </h4>
                    </div>

                    <div className="shrink-0 rounded-xl bg-white px-4 py-3 text-right shadow-sm">
                      <div className="text-xs text-zinc-400">
                        차감액
                      </div>

                      <div className="mt-1 font-black">
                        {hint.deductedAmount.toLocaleString(
                          "ko-KR"
                        )}
                        원
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 whitespace-pre-wrap text-[15px] leading-8 text-zinc-700">
                    {hint.content}
                  </p>
                </article>
              );
            })}
        </div>
      )}
    </section>
  );
}