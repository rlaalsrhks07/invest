export type HintLevel = "low" | "middle" | "high";

export type TeamData = {
  id: string;
  slug: string;
  name: string;
};

export type AssetData = {
  id: string;
  name: string;
  category: string;
  description: string;
};

export type RoundData = {
  id: string;
  roundNumber: number;
  startYear: number;
  endYear: number;
};

export type PriceData = {
  roundId: string;
  assetId: string;
  startPrice: number;
  endPrice: number;
};

export type HintData = {
  id: string;
  roundId: string;
  level: HintLevel;
  content: string;
  cost: number;
};

export const teams: TeamData[] = [
  { id: "team-1", slug: "1", name: "1조" },
  { id: "team-2", slug: "2", name: "2조" },
  { id: "team-3", slug: "3", name: "3조" },
  { id: "team-4", slug: "4", name: "4조" },
  { id: "team-5", slug: "5", name: "5조" },
  { id: "team-6", slug: "6", name: "6조" },
  { id: "team-7", slug: "7", name: "7조" },
  { id: "team-8", slug: "8", name: "8조" },
];

export const rounds: RoundData[] = [
  {
    id: "round-1",
    roundNumber: 1,
    startYear: 2015,
    endYear: 2017,
  },
  {
    id: "round-2",
    roundNumber: 2,
    startYear: 2017,
    endYear: 2019,
  },
  {
    id: "round-3",
    roundNumber: 3,
    startYear: 2019,
    endYear: 2021,
  },
  {
    id: "round-4",
    roundNumber: 4,
    startYear: 2021,
    endYear: 2023,
  },
  {
    id: "round-5",
    roundNumber: 5,
    startYear: 2023,
    endYear: 2025,
  },
];

export const assets: AssetData[] = [
  {
    id: "it",
    name: "IT",
    category: "정보기술",
    description: "반도체, 소프트웨어, 인공지능 관련 산업",
  },
  {
    id: "healthcare",
    name: "의료·헬스케어",
    category: "바이오·의료",
    description: "의약품, 의료기기, 헬스케어 관련 산업",
  },

  // 나머지 산업 추가
];

export const prices: PriceData[] = [
  {
    roundId: "round-1",
    assetId: "it",
    startPrice: 100,
    endPrice: 154.4,
  },
  {
    roundId: "round-1",
    assetId: "healthcare",
    startPrice: 100,
    endPrice: 121.6,
  },

  // 모든 라운드 × 모든 산업 데이터 추가
];

export const hints: HintData[] = [
  {
    id: "round-1-low",
    roundId: "round-1",
    level: "low",
    content: "1라운드 하 힌트 내용",
    cost: 10000,
  },
  {
    id: "round-1-middle",
    roundId: "round-1",
    level: "middle",
    content: "1라운드 중 힌트 내용",
    cost: 30000,
  },
  {
    id: "round-1-high",
    roundId: "round-1",
    level: "high",
    content: "1라운드 상 힌트 내용",
    cost: 50000,
  },

  // 2~5라운드 힌트 추가
];