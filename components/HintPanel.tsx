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
    percent: number;
    cardClass: string;
    viewedClass: string;
    badgeClass: string;
    buttonClass: string;
  }
> = {
  low: {
    label: "하",
    percent: 5,
    cardClass:
      "border-sky-200 bg-gradient-to-br from-sky-50 to-white",
    viewedClass:
      "border-sky-500 bg-gradient-to-br from-sky-600 to-cyan-600 text-white",
    badgeClass:
      "bg-sky-100 text-sky-700",
    buttonClass:
      "bg-sky-600 hover:bg-sky-700",
  },
  middle: {
    label: "중",
    percent: 10,
    cardClass:
      "border-indigo-200 bg-gradient-to-br from-indigo-50 to-white",
    viewedClass:
      "border-indigo-500 bg-gradient-to-br from-indigo-600 to-blue-600 text-white",
    badgeClass:
      "bg-indigo-100 text-indigo-700",
    buttonClass:
      "bg-indigo-600 hover:bg-indigo-700",
  },
  high: {
    label: "상",
    percent: 15,
    cardClass:
      "border-violet-200 bg-gradient-to-br from-violet-50 to-white",
    viewedClass:
      "border-violet-500 bg-gradient-to-br from-violet-600 to-purple-600 text-white",
    badgeClass:
      "bg-violet-100 text-violet-700",
    buttonClass:
      "bg-violet-600 hover:bg-violet-700",
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

  const hasPurchasedHint =
    viewedHints.length > 0;

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

    if (hasPurchasedHint) {
      alert(
        "이번 라운드에서는 힌트를 하나만 구매할 수 있습니다."
      );
      return;
    }

    if (loadingLevel !== null) {
      return;
    }

    const alreadyViewed =
      viewedHints.find(
        (hint) =>
          hint.level === level
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
      `${meta.label} 힌트를 구매하시겠습니까?\n\n${estimatedCost.toLocaleString(
        "ko-KR"
      )}원이 차감됩니다.`
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

      const data =
        await response.json();

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
        const exists =
          previous.some(
            (hint) =>
              hint.id ===
              viewedHint.id
          );

        return exists
          ? previous
          : [
              ...previous,
              viewedHint,
            ];
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
    <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-lg shadow-indigo-100/40">
      <header>
        <h2 className="text-2xl font-black text-slate-900">
          힌트 상점
        </h2>
      </header>

      {disabled &&
        disabledReason && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
            {disabledReason}
          </div>
        )}

      <div className="mt-6 grid grid-cols-3 gap-4">
        {LEVELS.map((level) => {
          const meta =
            LEVEL_META[level];

          const viewedHint =
            viewedHints.find(
              (hint) =>
                hint.level ===
                level
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
              className={`rounded-2xl border p-5 shadow-sm transition ${
                viewedHint
                  ? meta.viewedClass
                  : meta.cardClass
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-black">
                  {meta.label} 힌트
                </h3>

                <span
                  className={
                    viewedHint
                      ? "rounded-full bg-white/15 px-3 py-1 text-sm font-black"
                      : `rounded-full px-3 py-1 text-sm font-black ${meta.badgeClass}`
                  }
                >
                  {meta.percent}%
                </span>
              </div>

              <div
                className={
                  viewedHint
                    ? "mt-5 rounded-xl bg-white/10 p-3"
                    : "mt-5 rounded-xl bg-white/80 p-3 shadow-sm"
                }
              >
                <div
                  className={
                    viewedHint
                      ? "text-xs text-white/60"
                      : "text-xs text-slate-400"
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
                  ).toLocaleString(
                    "ko-KR"
                  )}
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
                  hasPurchasedHint ||
                  loadingLevel !== null
                }
                className={
                  viewedHint
                    ? "mt-4 w-full rounded-xl bg-white/15 px-4 py-3 font-black text-white/70"
                    : `mt-4 w-full rounded-xl px-4 py-3 font-black text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${meta.buttonClass}`
                }
              >
                {viewedHint
                  ? "열람 완료"
                  : hasPurchasedHint
                    ? "구매 불가"
                    : isLoading
                      ? "처리 중..."
                      : "힌트 구매"}
              </button>
            </article>
          );
        })}
      </div>

      {viewedHints.length >
        0 && (
        <div className="mt-8 space-y-4 border-t border-indigo-100 pt-6">
          <h3 className="text-lg font-black text-slate-900">
            구매한 힌트
          </h3>

          {viewedHints
            .slice()
            .sort(
              (a, b) =>
                LEVELS.indexOf(
                  a.level
                ) -
                LEVELS.indexOf(
                  b.level
                )
            )
            .map((hint) => {
              const meta =
                LEVEL_META[
                  hint.level
                ];

              return (
                <article
                  key={hint.id}
                  className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-slate-50 to-indigo-50/50 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-indigo-500">
                        {meta.label} 힌트
                      </div>

                      <div className="mt-2 text-sm font-bold text-slate-500">
                        [
                        {
                          hint.sourceLabel
                        }
                        ]
                      </div>

                      <h4 className="mt-1 text-xl font-black text-slate-900">
                        {hint.title}
                      </h4>
                    </div>

                    <div className="shrink-0 rounded-xl bg-white px-4 py-3 text-right shadow-sm">
                      <div className="text-xs text-slate-400">
                        차감액
                      </div>

                      <div className="mt-1 whitespace-nowrap font-black text-slate-900">
                        {hint.deductedAmount.toLocaleString(
                          "ko-KR"
                        )}
                        원
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 whitespace-pre-wrap text-[15px] leading-8 text-slate-700">
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