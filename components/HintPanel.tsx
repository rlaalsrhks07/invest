"use client";

import { useState } from "react";

type Hint = {
  id: string;
  level: "low" | "middle" | "high";
  content: string;
  cost: number;
};

type HintPanelProps = {
  teamId: string;
  roundId: string;
  initialViewedHints: Hint[];
};

const levelLabel = {
  low: "하",
  middle: "중",
  high: "상",
};

export default function HintPanel({
  teamId,
  roundId,
  initialViewedHints,
}: HintPanelProps) {
  const [viewedHints, setViewedHints] = useState<Hint[]>(initialViewedHints);
  const [loadingLevel, setLoadingLevel] = useState<string | null>(null);

  const handleViewHint = async (level: "low" | "middle" | "high") => {
    const alreadyViewed = viewedHints.find((hint) => hint.level === level);

    if (alreadyViewed) {
      alert("이미 열람한 힌트입니다.");
      return;
    }

    const ok = confirm(
      `${levelLabel[level]} 힌트를 열람하시겠습니까? 힌트 비용이 차감됩니다.`
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

      setViewedHints((prev) => [...prev, data.hint]);
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
        힌트를 보면 조 자금에서 비용이 차감됩니다. 이미 본 힌트는 다시 봐도
        추가 차감되지 않습니다.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {(["low", "middle", "high"] as const).map((level) => (
          <button
            key={level}
            onClick={() => handleViewHint(level)}
            disabled={loadingLevel === level}
            className="rounded-lg border px-4 py-3 font-semibold hover:bg-gray-100 disabled:opacity-50"
          >
            {levelLabel[level]} 힌트 보기
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {viewedHints.length === 0 ? (
          <p className="text-sm text-gray-500">아직 열람한 힌트가 없습니다.</p>
        ) : (
          viewedHints.map((hint) => (
            <div key={hint.id} className="rounded-lg bg-yellow-50 p-3">
              <div className="font-bold">
                {levelLabel[hint.level]} 힌트 ·{" "}
                {hint.cost.toLocaleString("ko-KR")}원
              </div>
              <p className="mt-1">{hint.content}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}