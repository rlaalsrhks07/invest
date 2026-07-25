import { HINT_DEDUCTION_RATES } from "./hintConfig";
import type { HintLevel } from "./hintConfig";

export { HINT_DEDUCTION_RATES };
export type { HintLevel };

export type StaticTeam = {
  id: string;
  slug: string;
  name: string;
};

export type StaticRound = {
  id: string;
  roundNumber: number;
  startYear: number;
  endYear: number;
  scenarioText: string;
};

export type StaticAsset = {
  id: string;
  name: string;
  etf: string;
  description: string;
};

export type StaticAssetReturn = {
  roundId: string;
  assetId: string;
  returnRate: number;
};

export type StaticHint = {
  id: string;
  roundId: string;
  level: HintLevel;
  deductionRate: number;
  sourceLabel: string;
  title: string;
  content: string;
};

export type ViewedHint = StaticHint & {
  deductedAmount: number;
};

export const INITIAL_CASH = 1_000_000;

export const TEAMS: StaticTeam[] = [
  { id: "team-1", slug: "team-1", name: "1조" },
  { id: "team-2", slug: "team-2", name: "2조" },
  { id: "team-3", slug: "team-3", name: "3조" },
  { id: "team-4", slug: "team-4", name: "4조" },
  { id: "team-5", slug: "team-5", name: "5조" },
  { id: "team-6", slug: "team-6", name: "6조" },
  { id: "team-7", slug: "team-7", name: "7조" },
  { id: "team-8", slug: "team-8", name: "8조" },
];

export const ROUNDS: StaticRound[] = [
  {
    id: "round-1",
    roundNumber: 1,
    startYear: 2015,
    endYear: 2017,
    scenarioText:
      "2015년의 사회·경제 변화를 바탕으로 2017년까지 성장할 산업을 예측해 투자하세요.",
  },
  {
    id: "round-2",
    roundNumber: 2,
    startYear: 2017,
    endYear: 2019,
    scenarioText:
      "2017년의 기술 경쟁과 세계 시장 변화를 바탕으로 2019년까지의 산업 흐름을 예측하세요.",
  },
  {
    id: "round-3",
    roundNumber: 3,
    startYear: 2019,
    endYear: 2021,
    scenarioText:
      "2019년 말의 불확실한 사회 상황을 바탕으로 2021년까지 산업별 변화를 예측하세요.",
  },
  {
    id: "round-4",
    roundNumber: 4,
    startYear: 2021,
    endYear: 2023,
    scenarioText:
      "2021년의 경기 회복, 물가와 금리 변화를 바탕으로 2023년까지의 산업 흐름을 예측하세요.",
  },
  {
    id: "round-5",
    roundNumber: 5,
    startYear: 2023,
    endYear: 2025,
    scenarioText:
      "2023년의 인공지능 확산과 소비 회복을 바탕으로 2025년까지 성장할 산업을 예측하세요.",
  },
];

export const ASSETS: StaticAsset[] = [
  {
    id: "it",
    name: "IT",
    etf: "XLK",
    description: "반도체, 소프트웨어, 클라우드 등 정보기술 산업",
  },
  {
    id: "bio",
    name: "바이오",
    etf: "XBI",
    description: "신약 개발, 생명공학, 바이오 기술 관련 산업",
  },
  {
    id: "materials",
    name: "화학·소재",
    etf: "XLB",
    description: "화학제품, 원자재, 산업용 소재 관련 산업",
  },
  {
    id: "housing",
    name: "주택건설·주거",
    etf: "XHB",
    description: "주택 건설, 건축자재, 인테리어와 주거 관련 산업",
  },
  {
    id: "communication",
    name: "통신·미디어·플랫폼",
    etf: "VOX",
    description: "통신망, 미디어, 광고, 온라인 플랫폼 관련 산업",
  },
  {
    id: "healthcare",
    name: "의료·헬스케어",
    etf: "XLV",
    description: "의료서비스, 제약, 의료기기와 건강관리 관련 산업",
  },
  {
    id: "aviation",
    name: "항공",
    etf: "JETS",
    description: "항공사와 항공 운송 관련 산업",
  },
  {
    id: "entertainment",
    name: "엔터·레저",
    etf: "PEJ",
    description: "공연, 콘텐츠, 여행, 여가와 오락 관련 산업",
  },
  {
    id: "food",
    name: "식품·음료",
    etf: "PBJ",
    description: "식품 제조, 음료와 생활 소비재 관련 산업",
  },
  {
    id: "logistics",
    name: "운송·물류",
    etf: "XTN",
    description: "육상 운송, 배송, 물류와 유통망 관련 산업",
  },
];

export const ASSET_RETURNS: StaticAssetReturn[] = [
  { roundId: "round-1", assetId: "it", returnRate: 36.2 },
  { roundId: "round-1", assetId: "bio", returnRate: 5.1 },
  { roundId: "round-1", assetId: "materials", returnRate: 18.0 },
  { roundId: "round-1", assetId: "housing", returnRate: 9.0 },
  { roundId: "round-1", assetId: "communication", returnRate: 9.9 },
  { roundId: "round-1", assetId: "healthcare", returnRate: 9.0 },
  { roundId: "round-1", assetId: "aviation", returnRate: 25.1 },
  { roundId: "round-1", assetId: "entertainment", returnRate: 12.9 },
  { roundId: "round-1", assetId: "food", returnRate: 2.2 },
  { roundId: "round-1", assetId: "logistics", returnRate: 17.7 },

  { roundId: "round-2", assetId: "it", returnRate: 37.4 },
  { roundId: "round-2", assetId: "bio", returnRate: 11.6 },
  { roundId: "round-2", assetId: "materials", returnRate: 3.5 },
  { roundId: "round-2", assetId: "housing", returnRate: 6.8 },
  { roundId: "round-2", assetId: "communication", returnRate: -7.3 },
  { roundId: "round-2", assetId: "healthcare", returnRate: 18.1 },
  { roundId: "round-2", assetId: "aviation", returnRate: 1.5 },
  { roundId: "round-2", assetId: "entertainment", returnRate: 3.9 },
  { roundId: "round-2", assetId: "food", returnRate: 2.7 },
  { roundId: "round-2", assetId: "logistics", returnRate: 7.7 },

  { roundId: "round-3", assetId: "it", returnRate: 88.9 },
  { roundId: "round-3", assetId: "bio", returnRate: 52.8 },
  { roundId: "round-3", assetId: "materials", returnRate: 43.7 },
  { roundId: "round-3", assetId: "housing", returnRate: 77.4 },
  { roundId: "round-3", assetId: "communication", returnRate: 57.4 },
  { roundId: "round-3", assetId: "healthcare", returnRate: 36.3 },
  { roundId: "round-3", assetId: "aviation", returnRate: -21.6 },
  { roundId: "round-3", assetId: "entertainment", returnRate: 10.9 },
  { roundId: "round-3", assetId: "food", returnRate: 22.6 },
  { roundId: "round-3", assetId: "logistics", returnRate: 40.2 },

  { roundId: "round-4", assetId: "it", returnRate: 10.5 },
  { roundId: "round-4", assetId: "bio", returnRate: -38.7 },
  { roundId: "round-4", assetId: "materials", returnRate: -0.8 },
  { roundId: "round-4", assetId: "housing", returnRate: 3.8 },
  { roundId: "round-4", assetId: "communication", returnRate: -24.1 },
  { roundId: "round-4", assetId: "healthcare", returnRate: 3.8 },
  { roundId: "round-4", assetId: "aviation", returnRate: -21.0 },
  { roundId: "round-4", assetId: "entertainment", returnRate: -16.0 },
  { roundId: "round-4", assetId: "food", returnRate: 8.6 },
  { roundId: "round-4", assetId: "logistics", returnRate: -10.6 },

  { roundId: "round-5", assetId: "it", returnRate: 54.1 },
  { roundId: "round-5", assetId: "bio", returnRate: 18.5 },
  { roundId: "round-5", assetId: "materials", returnRate: 8.2 },
  { roundId: "round-5", assetId: "housing", returnRate: 34.7 },
  { roundId: "round-5", assetId: "communication", returnRate: 65.4 },
  { roundId: "round-5", assetId: "healthcare", returnRate: 9.0 },
  { roundId: "round-5", assetId: "aviation", returnRate: 29.3 },
  { roundId: "round-5", assetId: "entertainment", returnRate: 39.4 },
  { roundId: "round-5", assetId: "food", returnRate: 3.7 },
  { roundId: "round-5", assetId: "logistics", returnRate: 7.0 },
];


export const HINTS: StaticHint[] = [
  {
    id: "round-1-low",
    roundId: "round-1",
    level: "low",
    deductionRate: HINT_DEDUCTION_RATES.low,
    sourceLabel: "2015년 가상기사",
    title: "일상의 선택 방식이 조용히 바뀌고 있다",
    content: `사람들이 정보를 얻고, 물건을 고르고, 시간을 보내는 방식이 조금씩 달라지고 있다. 과거에는 정해진 장소와 시간에 맞춰 이루어지던 활동들이 많았지만, 이제는 개인이 더 빠르게 선택하고 더 즉각적으로 반응하는 모습이 나타나고 있다.

기업들도 소비자의 선택이 어디에서 시작되고, 어떤 경로를 거쳐 실제 소비로 이어지는지에 주목하고 있다. 단순히 좋은 상품을 만드는 것만으로는 부족하고, 소비자와 만나는 방식 자체가 경쟁력이 될 수 있다는 인식이 커지고 있다. 한편 사람과 상품이 오가는 범위도 점점 넓어지고 있다. 국내 시장만으로는 설명하기 어려운 소비 흐름이 나타나고 있으며, 기업들은 더 넓은 시장과 더 빠른 변화 속도에 적응해야 하는 상황을 맞고 있다.`,
  },
  {
    id: "round-1-middle",
    roundId: "round-1",
    level: "middle",
    deductionRate: HINT_DEDUCTION_RATES.middle,
    sourceLabel: "2015년 가상기사",
    title: "더 빠른 선택, 더 넓은 이동, 달라지는 소비의 경로",
    content: `소비자들은 예전보다 더 빠르게 정보를 찾고, 비교하고, 구매하는 방식에 익숙해지고 있다. 기업들은 소비자의 행동을 분석하고, 더 가까운 곳에서 상품과 서비스를 제안하는 방법을 찾고 있다. 광고와 판매의 중심도 점점 소비자가 머무는 공간을 따라 이동하고 있다.

사람들의 이동과 교류도 회복되는 분위기다. 해외를 오가는 사람들이 늘고, 국내외 시장을 연결하는 흐름도 강해지고 있다. 이러한 변화는 여행, 교류, 운반, 제조, 유통과 연결된 여러 분야에 영향을 줄 수 있다.

반면 생활에 꼭 필요한 소비나 건강 관련 지출은 꾸준히 유지되겠지만, 빠른 변화의 중심에 서기보다는 안정적인 흐름을 보일 가능성이 있다. 연구개발 성과에 따라 크게 움직이는 분야는 기대와 불확실성을 동시에 안고 있다.`,
  },
  {
    id: "round-1-high",
    roundId: "round-1",
    level: "high",
    deductionRate: HINT_DEDUCTION_RATES.high,
    sourceLabel: "2015년 가상 분석기사",
    title: "모바일 소비와 이동 회복, 성장의 중심을 바꿀까",
    content: `2015년의 변화는 크게 두 가지로 볼 수 있다. 하나는 소비자가 작은 화면을 통해 정보를 찾고, 구매하고, 여가를 즐기기 시작했다는 점이다. 이 흐름은 IT 산업에 가장 우호적인 환경을 만들 수 있다. 통신·미디어·플랫폼 산업도 장기적 주목을 받기 시작하겠지만, 당장 눈에 띄는 성장은 이동과 교류가 회복되는 항공 산업과 운송·물류, 그리고 제조업의 기반이 되는 화학·소재 산업에서 더 강하게 나타날 수 있다.

다만 모든 산업이 같은 폭으로 움직이지는 않을 수 있다. 식품·음료와 의료·헬스케어는 꾸준한 수요가 장점이지만, 급격한 성장의 중심에 서기는 어려울 수 있다. 바이오는 신약과 기술 기대감이 있지만, 실제 성과가 확인되기 전까지는 변동성이 클 수 있다. 엔터·레저는 소비 회복의 수혜를 받을 수 있으나 경기와 유행에 민감하다는 점도 고려해야 한다.`,
  },
  {
    id: "round-2-low",
    roundId: "round-2",
    level: "low",
    deductionRate: HINT_DEDUCTION_RATES.low,
    sourceLabel: "2017년 가상기사",
    title: "성장의 속도는 빨라지고, 세계 시장은 예민해지다",
    content: `세계 각국과 기업들이 미래 성장 동력을 확보하기 위해 경쟁을 강화하고 있다. 새로운 기술을 누가 먼저 확보하느냐가 국가와 기업의 경쟁력을 좌우할 수 있다는 인식이 커지고 있다.

하지만 세계 시장의 분위기는 마냥 안정적이지 않다. 국가 간 갈등과 규제 움직임이 커지면서, 어떤 기업들은 기회를 얻고 어떤 기업들은 예상치 못한 부담을 안게 될 가능성이 있다. 앞으로의 성장은 단순히 좋은 상품을 만드는 것만으로 결정되지 않을 수 있다. 변화에 빠르게 적응하는 능력, 외부 충격을 버티는 능력, 세계 시장과의 연결 방식이 모두 중요해지고 있다.`,
  },
  {
    id: "round-2-middle",
    roundId: "round-2",
    level: "middle",
    deductionRate: HINT_DEDUCTION_RATES.middle,
    sourceLabel: "2017년 가상기사",
    title: "더 빠른 연결과 더 복잡한 거래 환경이 함께 온다",
    content: `기업들은 더 빠르게 정보를 처리하고, 더 많은 데이터를 활용하며, 업무를 자동화하기 위한 준비를 하고 있다. 새로운 연결 환경이 자리 잡으면 기업용 서비스, 데이터 활용, 업무 효율화와 관련된 분야에는 기회가 생길 수 있다.

건강과 돌봄에 대한 관심도 꾸준히 이어지고 있다. 인구 구조 변화와 만성질환 관리, 의료 서비스의 효율화는 경기 흐름과 상관없이 계속 중요한 과제가 될 가능성이 있다.

반면 국가 간 갈등이 커질 경우, 해외 거래에 의존하거나 여러 나라에 생산·판매망을 두고 있는 분야는 부담을 느낄 수 있다. 빠르게 성장하는 분야라 해도 경쟁이 심해지고 투자 비용이 커지면 단기 성과는 기대보다 약할 수 있다.`,
  },
  {
    id: "round-2-high",
    roundId: "round-2",
    level: "high",
    deductionRate: HINT_DEDUCTION_RATES.high,
    sourceLabel: "2017년 가상 분석기사",
    title: "기술은 기회지만, 갈등은 산업별 온도 차를 만든다",
    content: `2017년 이후 산업을 움직일 핵심 축은 기술 경쟁과 교역 갈등이다. IT 산업은 기업용 소프트웨어, 데이터 처리, 반도체, 자동화 수요 확대와 연결되어 성장 기대를 받을 수 있다. 실제 수익성과 시장 지배력을 갖춘 기술 기업일수록 유리한 평가를 받을 가능성이 있다.

의료·헬스케어 산업도 주목할 만하다. 고령화, 병원·제약 수요, 건강관리 서비스는 단기 경기와 관계없이 비교적 꾸준한 수요를 갖고 있다. 바이오 산업 역시 혁신 기술과 신약 기대감이 있지만, 연구개발 성과와 승인 여부에 따라 성과 차이가 클 수 있다.

반면 무역 갈등은 화학·소재, 운송·물류, 항공처럼 글로벌 교역과 원자재 흐름에 연결된 산업에 부담을 줄 수 있다. 통신·미디어·플랫폼은 장기적으로 데이터 사용 증가라는 기회가 있지만, 인프라 투자 부담과 경쟁 심화가 단기적으로는 위험 요인이 될 수 있다. 엔터·레저와 식품·음료는 소비심리에 따라 완만한 흐름을 보일 가능성이 있다.`,
  },
  {
    id: "round-3-low",
    roundId: "round-3",
    level: "low",
    deductionRate: HINT_DEDUCTION_RATES.low,
    sourceLabel: "2019년 말 가상기사",
    title: "일상의 속도가 갑자기 느려질 수 있다는 우려",
    content: `최근 해외 일부 지역에서 원인을 알 수 없는 호흡기 질환 사례가 보고되며 각국 보건당국이 상황을 주시하고 있다. 아직 확산 규모나 지속 기간은 불확실하지만, 전문가들은 만약 상황이 길어질 경우 사람들의 생활 반경과 소비 방식이 평소와 달라질 수 있다고 보고 있다.

그동안 당연하게 여겨졌던 등교, 출근, 여행, 모임, 외식 같은 활동도 사회적 분위기와 정책 변화에 따라 영향을 받을 수 있다. 기업과 가정은 갑작스러운 변화에 대비해 새로운 생활 방식과 업무 방식을 고민하기 시작했다.

이번 변화가 일시적인 사건으로 끝날지, 아니면 생활 전반의 구조를 바꾸는 계기가 될지는 아직 알 수 없다. 다만 사람들의 시간, 공간, 이동 방식이 달라질 경우 산업별 영향도 서로 다르게 나타날 가능성이 있다.`,
  },
  {
    id: "round-3-middle",
    roundId: "round-3",
    level: "middle",
    deductionRate: HINT_DEDUCTION_RATES.middle,
    sourceLabel: "2019년 말 가상기사",
    title: "이동이 줄어들면 소비의 장소도 바뀔까",
    content: `감염병 확산 가능성이 커지면서 사람들의 활동 공간이 외부에서 실내와 가정으로 이동할 수 있다는 전망이 나온다. 학교와 직장, 상점과 공연장처럼 많은 사람이 한 공간에 모이는 장소는 운영 방식의 변화를 고민하고 있다.

이 경우 사람들은 물건을 사고, 음식을 먹고, 여가를 즐기고, 일을 처리하는 방식을 바꿔야 할 수 있다. 직접 방문하던 활동이 줄어들면 이를 대신할 새로운 연결 방식과 전달 방식이 중요해질 수 있다. 건강과 안전에 대한 관심도 커질 가능성이 높다.

반면 사람의 이동, 밀집된 공간, 해외 왕래에 크게 의존하던 분야는 불확실성이 커질 수 있다. 다만 물건의 이동이나 집 안에서의 소비처럼 일부 수요는 오히려 늘어날 수 있어, 같은 변화라도 산업별 영향은 단순하지 않을 것으로 보인다.`,
  },
  {
    id: "round-3-high",
    roundId: "round-3",
    level: "high",
    deductionRate: HINT_DEDUCTION_RATES.high,
    sourceLabel: "2019년 말 가상 분석기사",
    title: "생활 반경의 축소가 산업의 승자와 패자를 가를까",
    content: `감염병 확산이 장기화될 경우 산업별 영향은 사람들의 생활 반경이 어디로 이동하느냐에 따라 갈릴 가능성이 크다. 외부 활동이 줄고 가정에 머무는 시간이 늘어나면, 집 안에서 일하고 배우고 소비하고 여가를 보내도록 돕는 서비스와 인프라가 중요해질 수 있다. 이 흐름은 IT, 통신·미디어·플랫폼, 주택건설·주거 분야에 긍정적으로 작용할 가능성이 있다.

건강과 안전에 대한 관심도 커질 수 있다. 진단, 예방, 치료 기술에 대한 기대가 높아지면 바이오 산업이 주목받을 수 있다. 다만 연구개발 성과가 실제로 확인되기까지는 불확실성도 크다. 반면 의료·헬스케어는 기본적인 의료 서비스와 건강관리 수요가 유지된다는 점에서 상대적으로 안정적인 흐름을 기대할 수 있다.

소비와 이동의 방향도 달라질 수 있다. 외식과 오프라인 여가가 줄어드는 대신 집 안에서 소비하는 식품, 포장, 배송 관련 수요가 늘면 식품·음료, 운송·물류, 일부 화학·소재 분야에 기회가 생길 수 있다. 그러나 국제 이동과 대규모 모임, 해외 왕래에 의존하는 항공과 오프라인 중심 엔터·레저는 큰 압박을 받을 수 있다.`,
  },
  {
    id: "round-4-low",
    roundId: "round-4",
    level: "low",
    deductionRate: HINT_DEDUCTION_RATES.low,
    sourceLabel: "2021년 가상기사",
    title: "회복의 기대감 뒤에 비용의 문제가 떠오르다",
    content: `세계 경제가 긴 침체에서 벗어나 조금씩 움직이기 시작했다. 멈췄던 소비와 생산이 다시 살아나고, 사람들은 이전의 생활로 돌아갈 수 있다는 기대를 품고 있다.

그러나 회복은 생각보다 비싼 비용을 동반하고 있다. 물건을 만들고 운반하는 데 드는 비용이 오르고, 생활비 부담도 커지고 있다. 각국은 치솟는 물가를 잡기 위해 돈의 흐름을 조절하는 방안을 고민하고 있다.

회복이라는 단어만 보면 모든 산업에 좋은 소식처럼 보이지만, 실제로는 비용을 감당할 수 있는 분야와 그렇지 못한 분야 사이에 차이가 커질 수 있다. 기대감이 컸던 분야일수록 변화에 더 민감하게 반응할 가능성도 있다.`,
  },
  {
    id: "round-4-middle",
    roundId: "round-4",
    level: "middle",
    deductionRate: HINT_DEDUCTION_RATES.middle,
    sourceLabel: "2021년 가상기사",
    title: "물가와 돈의 흐름이 기업의 체력을 시험하다",
    content: `세계 경제가 다시 열리기 시작했지만, 원자재 가격, 물류비, 인건비가 빠르게 오르면서 기업들의 부담이 커지고 있다. 돈을 빌리는 비용이 올라갈 경우, 대규모 투자나 장기간 연구개발에 의존하는 분야는 더 큰 압박을 받을 수 있다.

사람들의 외부 활동은 회복될 가능성이 있지만, 유가와 물가가 높아지면 여행, 여가, 이동 관련 소비가 예상만큼 빠르게 살아나지 못할 수도 있다. 콘텐츠와 온라인 서비스도 장기적으로는 수요가 있지만, 광고 경기와 투자 비용의 영향을 받을 수 있다.

반면 사람들이 매일 소비해야 하는 필수재나 기본적인 건강관리 서비스는 경기 불안 속에서도 비교적 꾸준한 수요를 유지할 수 있다. 주거 관련 분야는 돈을 빌리는 비용의 영향을 받지만, 실제 주택 수요와 공급 상황에 따라 예상과 다른 흐름을 보일 수도 있다.`,
  },
  {
    id: "round-4-high",
    roundId: "round-4",
    level: "high",
    deductionRate: HINT_DEDUCTION_RATES.high,
    sourceLabel: "2021년 가상 분석기사",
    title: "회복기 시장에서 중요한 것은 성장성보다 버틸 힘일까",
    content: `2021년 이후 산업 환경은 단순한 회복 국면으로만 보기 어렵다. 물가 상승, 금리 인상, 원자재 가격 부담, 공급망 불안이 동시에 나타나면서 기업의 성장 가능성뿐 아니라 현재의 수익성과 비용 관리 능력이 중요해지고 있다.

이 환경에서는 미래의 큰 성장을 기대하며 높은 평가를 받던 분야가 흔들릴 수 있다. 바이오 산업은 장기적으로 유망하지만, 연구개발 기간이 길고 아직 안정적인 이익을 내지 못하는 기업이 많아 금리 상승에 취약할 수 있다. 통신·미디어·플랫폼 역시 장기 수요는 존재하지만, 광고 시장 둔화와 콘텐츠 투자 부담, 경쟁 심화가 위험 요인이 될 수 있다.

경제 재개는 항공과 엔터·레저에 기회처럼 보일 수 있지만, 유가 상승, 인건비 부담, 소비 위축이 수익성을 제한할 수 있다. 운송·물류와 화학·소재는 원자재 가격과 공급망 변화에 따라 기회와 부담을 동시에 안게 될 가능성이 있다.

반면 식품·음료와 의료·헬스케어는 경기와 관계없이 기본 수요가 유지되는 방어적 성격을 가질 수 있다. IT 산업도 금리 상승의 부담을 받을 수 있지만, 실제 수익성과 시장 지배력을 가진 대형 기술 기업은 상대적으로 버틸 가능성이 있다. 주택건설·주거는 금리 부담이 크지만, 주택 공급 부족이나 지역별 수요가 예상 밖의 버팀목이 될 수 있다.`,
  },
  {
    id: "round-5-low",
    roundId: "round-5",
    level: "low",
    deductionRate: HINT_DEDUCTION_RATES.low,
    sourceLabel: "2023년 가상기사",
    title: "새로운 도구가 일하는 방식과 즐기는 방식을 바꾸기 시작하다",
    content: `최근 사람들은 글을 쓰고, 이미지를 만들고, 정보를 찾고, 업무를 처리하는 새로운 도구에 주목하고 있다. 아직 초기 단계이지만, 이 도구가 기업의 일하는 방식과 개인의 생활 방식에 영향을 줄 수 있다는 기대가 커지고 있다.

동시에 사람들은 멈췄던 활동을 다시 시작하려는 모습을 보이고 있다. 여행을 가고, 공연을 보고, 여가를 즐기며, 이전에 미뤄두었던 소비를 회복하려는 분위기가 나타나고 있다.

하지만 새로운 기술과 소비 회복이 모든 분야에 같은 기회를 주는 것은 아니다. 이미 안정적인 수요를 가진 분야는 큰 변화보다 완만한 흐름을 보일 수 있고, 비용 부담이나 경기 둔화가 남아 있는 분야는 회복 속도가 제한될 수 있다.`,
  },
  {
    id: "round-5-middle",
    roundId: "round-5",
    level: "middle",
    deductionRate: HINT_DEDUCTION_RATES.middle,
    sourceLabel: "2023년 가상기사",
    title: "자동화 도구와 소비 회복, 시장의 관심을 다시 바꾸다",
    content: `새로운 인공지능 도구가 등장하면서 기업들은 글쓰기, 고객 응대, 디자인, 분석, 개발 업무에 이를 활용할 방법을 찾고 있다. 이런 변화가 커질수록 많은 데이터를 저장하고 처리하는 기반, 빠른 연결망, 기업용 서비스, 온라인 유통망의 중요성도 함께 높아질 수 있다.

광고와 콘텐츠 시장도 다시 주목받고 있다. 사람들이 온라인에서 보내는 시간이 길어지고, 영상·음악·팬덤·게임·공연 관련 소비가 회복되면서 소비자와 직접 연결되는 기업들의 역할이 커질 가능성이 있다. 여행과 여가 활동도 이전보다 살아나는 분위기다.

다만 건강, 식품, 운송, 소재처럼 사회에 꼭 필요한 분야가 모두 높은 성장률을 보장받는 것은 아니다. 안정적인 수요는 장점이지만, 시장의 관심이 빠르게 성장하는 기술과 플랫폼 분야로 쏠릴 경우 상대적으로 덜 주목받을 수 있다. 주거 관련 분야는 금리 부담이 남아 있지만, 실제 수요와 공급 상황에 따라 예상보다 강할 수도 있다.`,
  },
  {
    id: "round-5-high",
    roundId: "round-5",
    level: "high",
    deductionRate: HINT_DEDUCTION_RATES.high,
    sourceLabel: "2023년 가상 분석기사",
    title: "새 기술의 가치는 누가 데이터를 모으고 연결하느냐에 달려 있을까",
    content: `2023년 이후 산업의 핵심 변화는 인공지능의 대중화와 소비 활동의 정상화다. 인공지능 도구가 업무와 콘텐츠 제작 과정에 들어오면, 이를 구동하기 위한 반도체, 서버, 클라우드, 데이터센터, 기업용 소프트웨어의 중요성이 커질 수 있다. 이 흐름은 IT 산업에 직접적인 기회를 줄 수 있다.

동시에 기술을 직접 만드는 분야만 주목받는 것은 아니다. 사용자 데이터, 광고, 콘텐츠 유통망, 빠른 연결 인프라를 가진 통신·미디어·플랫폼 산업도 새로운 기술을 결합하기 쉬운 위치에 있다. 디지털 광고와 스트리밍, 온라인 콘텐츠 소비가 회복되면 이 분야는 더 강한 기대를 받을 수 있다.

소비 활동의 정상화는 엔터·레저와 항공에도 긍정적인 신호가 될 수 있다. 여행, 공연, 여가 소비가 살아나면 그동안 눌려 있던 수요가 회복될 가능성이 있다. 주택건설·주거는 높은 금리라는 부담이 있지만, 공급 부족과 지역별 수요가 강하면 예상보다 좋은 흐름을 보일 수 있다.

반면 식품·음료, 의료·헬스케어, 화학·소재, 운송·물류는 경제 전반에 필요한 분야이지만, AI와 플랫폼처럼 강한 성장 서사를 받지 못하면 상대적으로 주목도가 낮을 수 있다. 바이오는 AI를 활용한 신약 개발이라는 장기 기회가 있지만, 단기적으로는 실제 성과와 투자 기대감 사이의 차이를 확인해야 한다.`,
  },
];

export function getTeamById(teamId: string) {
  return TEAMS.find((team) => team.id === teamId);
}

export function getTeamBySlug(slug: string) {
  return TEAMS.find((team) => team.slug === slug);
}

export function getRoundById(roundId: string) {
  return ROUNDS.find((round) => round.id === roundId);
}

export function getHint(roundId: string, level: HintLevel) {
  return HINTS.find(
    (hint) => hint.roundId === roundId && hint.level === level
  );
}

export function getAssetReturn(roundId: string, assetId: string) {
  return ASSET_RETURNS.find(
    (item) => item.roundId === roundId && item.assetId === assetId
  );
}