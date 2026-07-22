import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL이 없습니다. .env.local 파일을 확인하세요."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY가 없습니다. .env.local 파일을 확인하세요."
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase에서 고정 데이터를 불러오는 중입니다.");

const [
  teamsResult,
  assetsResult,
  pricesResult,
  hintsResult,
] = await Promise.all([
  supabase
    .from("teams")
    .select("id, slug, name")
    .order("slug", { ascending: true }),

  supabase
    .from("assets")
    .select("id, name, category, description")
    .order("name", { ascending: true }),

  supabase
    .from("asset_prices")
    .select("round_id, asset_id, start_price, end_price"),

  supabase
    .from("hints")
    .select("id, round_id, level, content, cost"),
]);

if (teamsResult.error) {
  throw new Error(
    `teams 조회 실패: ${teamsResult.error.message}`
  );
}

if (assetsResult.error) {
  throw new Error(
    `assets 조회 실패: ${assetsResult.error.message}`
  );
}

if (pricesResult.error) {
  throw new Error(
    `asset_prices 조회 실패: ${pricesResult.error.message}`
  );
}

if (hintsResult.error) {
  throw new Error(
    `hints 조회 실패: ${hintsResult.error.message}`
  );
}

const teams = (teamsResult.data ?? []).map((team) => ({
  id: String(team.id),
  slug: String(team.slug),
  name: String(team.name),
}));

const assets = (assetsResult.data ?? []).map((asset) => ({
  id: String(asset.id),
  name: String(asset.name),
  category:
    asset.category === null
      ? null
      : String(asset.category),
  description:
    asset.description === null
      ? null
      : String(asset.description),
}));

const assetPrices = (pricesResult.data ?? []).map((price) => ({
  round_id: String(price.round_id),
  asset_id: String(price.asset_id),
  start_price: Number(price.start_price),
  end_price: Number(price.end_price),
}));

const hints = (hintsResult.data ?? []).map((hint) => ({
  id: String(hint.id),
  round_id: String(hint.round_id),
  level: String(hint.level),
  content: String(hint.content),
  cost: Number(hint.cost),
}));

if (teams.length !== 8) {
  throw new Error(
    `teams 테이블에 ${teams.length}개 팀이 있습니다. 8개 팀으로 수정한 뒤 다시 실행하세요.`
  );
}

if (assets.length === 0) {
  throw new Error("assets 테이블에 산업 정보가 없습니다.");
}

if (assetPrices.length === 0) {
  throw new Error("asset_prices 테이블에 가격 정보가 없습니다.");
}

if (hints.length !== 15) {
  throw new Error(
    `hints 테이블에 ${hints.length}개 힌트가 있습니다. 5라운드 × 3개인 총 15개여야 합니다.`
  );
}

const fileContent = `/*
 * 이 파일은 scripts/export-static-data.mjs가 자동으로 생성했습니다.
 * 직접 수정하기보다 Supabase 데이터를 수정한 뒤
 * npm run export:data를 다시 실행하세요.
 */

export type StaticTeam = {
  id: string;
  slug: string;
  name: string;
};

export type StaticAsset = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
};

export type StaticAssetPrice = {
  round_id: string;
  asset_id: string;
  start_price: number;
  end_price: number;
};

export type HintLevel = "low" | "middle" | "high";

export type StaticHint = {
  id: string;
  round_id: string;
  level: HintLevel;
  content: string;
  cost: number;
};

export const TEAMS: StaticTeam[] = ${JSON.stringify(
  teams,
  null,
  2
)};

export const ASSETS: StaticAsset[] = ${JSON.stringify(
  assets,
  null,
  2
)};

export const ASSET_PRICES: StaticAssetPrice[] = ${JSON.stringify(
  assetPrices,
  null,
  2
)};

export const HINTS: StaticHint[] = ${JSON.stringify(
  hints,
  null,
  2
)};
`;

const libDirectory = new URL("../lib/", import.meta.url);
const outputFile = new URL("../lib/gameData.ts", import.meta.url);

await mkdir(libDirectory, { recursive: true });
await writeFile(outputFile, fileContent, "utf8");

console.log("");
console.log("lib/gameData.ts 생성이 완료되었습니다.");
console.log(`팀: ${teams.length}개`);
console.log(`산업: ${assets.length}개`);
console.log(`가격 데이터: ${assetPrices.length}개`);
console.log(`힌트: ${hints.length}개`);