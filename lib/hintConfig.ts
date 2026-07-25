export const HINT_LEVELS = [
  "low",
  "middle",
  "high",
] as const;

export type HintLevel =
  (typeof HINT_LEVELS)[number];

export const HINT_LABELS: Record<HintLevel, string> = {
  low: "하",
  middle: "중",
  high: "상",
};

export const HINT_DEDUCTION_RATES: Record<HintLevel, number> = {
  low: 0.05,
  middle: 0.1,
  high: 0.15,
};

export function getHintPercent(level: HintLevel) {
  return Math.round(HINT_DEDUCTION_RATES[level] * 100);
}
