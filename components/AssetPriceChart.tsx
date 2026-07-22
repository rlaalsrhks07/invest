import {
  ASSET_RETURNS,
  ROUNDS,
} from "@/lib/gameData";

type AssetPriceChartProps = {
  assetId: string;
  currentRoundId: string;
  revealCurrentRoundResult: boolean;
};

type PricePoint = {
  year: number;
  value: number;
};

const WIDTH = 420;
const HEIGHT = 180;

const PADDING = {
  top: 24,
  right: 20,
  bottom: 32,
  left: 48,
};

function buildPriceSeries(
  assetId: string,
  currentRoundId: string,
  revealCurrentRoundResult: boolean
): PricePoint[] {
  const currentRoundIndex = ROUNDS.findIndex(
    (round) => round.id === currentRoundId
  );

  if (currentRoundIndex < 0) {
    return [];
  }

  const points: PricePoint[] = [
    {
      year: ROUNDS[0].startYear,
      value: 100,
    },
  ];

  let currentValue = 100;

  const finalRoundIndex = revealCurrentRoundResult
    ? currentRoundIndex
    : currentRoundIndex - 1;

  for (
    let index = 0;
    index <= finalRoundIndex;
    index += 1
  ) {
    const round = ROUNDS[index];

    const returnData = ASSET_RETURNS.find(
      (item) =>
        item.roundId === round.id &&
        item.assetId === assetId
    );

    if (!returnData) {
      continue;
    }

    currentValue *=
      1 + returnData.returnRate / 100;

    points.push({
      year: round.endYear,
      value: currentValue,
    });
  }

  return points;
}

export default function AssetPriceChart({
  assetId,
  currentRoundId,
  revealCurrentRoundResult,
}: AssetPriceChartProps) {
  const points = buildPriceSeries(
    assetId,
    currentRoundId,
    revealCurrentRoundResult
  );

  if (points.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        가격 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  if (points.length === 1) {
    const minValue = 80;
    const maxValue = 120;

    const chartHeight =
      HEIGHT - PADDING.top - PADDING.bottom;

    const getY = (value: number) =>
      PADDING.top +
      ((maxValue - value) /
        (maxValue - minValue)) *
        chartHeight;

    const ticks = [120, 100, 80];
    const baselineY = getY(100);

    return (
      <div className="mt-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-slate-50 to-indigo-50/50 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-400">
              과거 가격지수
            </div>

            <div className="mt-1 text-sm font-black text-slate-900">
              2015년 = 100
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">
              누적 변화
            </div>

            <div className="mt-1 text-sm font-black text-slate-600">
              0.0%
            </div>
          </div>
        </div>

        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="mt-2 h-auto w-full"
          role="img"
          aria-label="2015년 가격지수 100 기준선"
        >
          {ticks.map((tick) => {
            const y = getY(tick);

            return (
              <g key={tick}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={WIDTH - PADDING.right}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200"
                  strokeWidth="1"
                />

                <text
                  x={PADDING.left - 7}
                  y={y + 4}
                  textAnchor="end"
                  fill="currentColor"
                  className="text-[10px] text-slate-400"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <line
            x1={PADDING.left}
            y1={baselineY}
            x2={WIDTH - PADDING.right}
            y2={baselineY}
            stroke="currentColor"
            className="text-indigo-600"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <text
            x={PADDING.left}
            y={HEIGHT - 9}
            textAnchor="start"
            fill="currentColor"
            className="text-[10px] text-slate-500"
          >
            2015
          </text>

          <text
            x={WIDTH - PADDING.right}
            y={HEIGHT - 9}
            textAnchor="end"
            fill="currentColor"
            className="text-[10px] text-slate-500"
          >
            투자 시점
          </text>
        </svg>
      </div>
    );
  }

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  const cumulativeReturn =
    (lastPoint.value / firstPoint.value - 1) *
    100;

  const values = points.map(
    (point) => point.value
  );

  let minValue = Math.min(...values, 100);
  let maxValue = Math.max(...values, 100);

  if (minValue === maxValue) {
    minValue -= 10;
    maxValue += 10;
  } else {
    const range = maxValue - minValue;

    const margin = Math.max(
      range * 0.15,
      5
    );

    minValue -= margin;
    maxValue += margin;
  }

  minValue =
    Math.floor(minValue / 5) * 5;

  maxValue =
    Math.ceil(maxValue / 5) * 5;

  const middleValue =
    (minValue + maxValue) / 2;

  const ticks = Array.from(
    new Set([
      maxValue,
      Math.round(middleValue),
      minValue,
    ])
  );

  const chartWidth =
    WIDTH - PADDING.left - PADDING.right;

  const chartHeight =
    HEIGHT - PADDING.top - PADDING.bottom;

  const getX = (index: number) =>
    PADDING.left +
    (index / (points.length - 1)) *
      chartWidth;

  const getY = (value: number) =>
    PADDING.top +
    ((maxValue - value) /
      (maxValue - minValue)) *
      chartHeight;

  const pathData = points
    .map((point, index) => {
      const command =
        index === 0 ? "M" : "L";

      return `${command} ${getX(
        index
      )} ${getY(point.value)}`;
    })
    .join(" ");

  const baselineY = getY(100);

  return (
    <div className="mt-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-slate-50 to-indigo-50/50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-slate-400">
            과거 가격지수
          </div>

          <div className="mt-1 text-sm font-black text-slate-900">
            2015년 = 100
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">
            누적 변화
          </div>

          <div
            className={`mt-1 text-sm font-black ${
              cumulativeReturn > 0
                ? "text-red-600"
                : cumulativeReturn < 0
                  ? "text-blue-600"
                  : "text-slate-600"
            }`}
          >
            {cumulativeReturn > 0 ? "+" : ""}
            {cumulativeReturn.toFixed(1)}%
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-2 h-auto w-full"
        role="img"
        aria-label={`${firstPoint.year}년부터 ${lastPoint.year}년까지 가격지수 그래프`}
      >
        {ticks.map((tick) => {
          const y = getY(tick);

          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={WIDTH - PADDING.right}
                y2={y}
                stroke="currentColor"
                className="text-slate-200"
                strokeWidth="1"
              />

              <text
                x={PADDING.left - 7}
                y={y + 4}
                textAnchor="end"
                fill="currentColor"
                className="text-[10px] text-slate-400"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {baselineY >= PADDING.top &&
          baselineY <=
            HEIGHT - PADDING.bottom && (
            <line
              x1={PADDING.left}
              y1={baselineY}
              x2={WIDTH - PADDING.right}
              y2={baselineY}
              stroke="currentColor"
              className="text-indigo-200"
              strokeWidth="1.5"
              strokeDasharray="5 5"
            />
          )}

        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          className="text-indigo-600"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => {
          const x = getX(index);
          const y = getY(point.value);

          const labelY =
            y < PADDING.top + 14
              ? y + 16
              : y - 8;

          return (
            <g
              key={`${point.year}-${point.value}`}
            >
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="currentColor"
                className="text-indigo-600"
              />

              <text
                x={x}
                y={HEIGHT - 9}
                textAnchor="middle"
                fill="currentColor"
                className="text-[10px] text-slate-500"
              >
                {point.year}
              </text>

              <text
                x={x}
                y={labelY}
                textAnchor="middle"
                fill="currentColor"
                className="text-[9px] font-bold text-slate-600"
              >
                {point.value.toFixed(0)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}