/*
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

export const TEAMS: StaticTeam[] = [
  {
    "id": "3b8bfd0b-c975-4924-9aeb-3c9289beb91f",
    "slug": "team-1",
    "name": "1조"
  },
  {
    "id": "ca8daf6a-9a31-41fa-9a27-d0b43fff0dd7",
    "slug": "team-2",
    "name": "2조"
  },
  {
    "id": "fa31eee9-1ef9-47f5-8e8f-7ed9bc800bd6",
    "slug": "team-3",
    "name": "3조"
  },
  {
    "id": "4d819fd0-aa3b-45f7-bc1c-d244dedb9f2c",
    "slug": "team-4",
    "name": "4조"
  },
  {
    "id": "c05a72f4-2eb0-4df3-9b51-a97670d4d49f",
    "slug": "team-5",
    "name": "5조"
  },
  {
    "id": "0bf04eab-2626-4e29-af29-b09f241f717f",
    "slug": "team-6",
    "name": "6조"
  },
  {
    "id": "a5d565f1-d42f-4212-b7f3-4994b3cb2db3",
    "slug": "team-7",
    "name": "7조"
  },
  {
    "id": "1a4e5031-26e5-4996-9829-871d4e19bb9b",
    "slug": "team-8",
    "name": "8조"
  }
];

export const ASSETS: StaticAsset[] = [
  {
    "id": "4708ac30-5ca2-44ef-960f-526a9f3f455a",
    "name": "2차전지",
    "category": "제조",
    "description": "전기차 배터리, 에너지 저장 장치와 관련된 산업"
  },
  {
    "id": "6dda9871-2613-4f75-8e9d-257820697cb0",
    "name": "게임·콘텐츠",
    "category": "콘텐츠",
    "description": "게임, 엔터테인먼트, 미디어 콘텐츠와 관련된 산업"
  },
  {
    "id": "997f3d4a-2f6e-411c-97e4-7a8c985e6bed",
    "name": "금융",
    "category": "서비스",
    "description": "은행, 증권, 보험, 금융 서비스와 관련된 산업"
  },
  {
    "id": "c24f1ba9-c628-4d73-ae27-548e85ba1d0f",
    "name": "바이오·헬스케어",
    "category": "의료",
    "description": "제약, 백신, 헬스케어, 의료 기술과 관련된 산업"
  },
  {
    "id": "29331eeb-3bfc-4881-95f2-c76429b49d95",
    "name": "반도체",
    "category": "기술",
    "description": "메모리 반도체, 시스템 반도체, AI 반도체 등과 관련된 산업"
  },
  {
    "id": "41c2aa59-cc6c-4a31-842c-561951129e98",
    "name": "에너지",
    "category": "인프라",
    "description": "석유, 가스, 신재생에너지와 관련된 산업"
  },
  {
    "id": "f1d53b8e-7278-424d-af3b-262ffdb39142",
    "name": "조선·해운",
    "category": "제조",
    "description": "선박, 해운, 물류와 관련된 산업"
  },
  {
    "id": "2e97bacb-37a9-434d-b7e8-e7deb443bf6a",
    "name": "플랫폼·인터넷",
    "category": "기술",
    "description": "검색, 쇼핑, SNS, 온라인 플랫폼과 관련된 산업"
  }
];

export const ASSET_PRICES: StaticAssetPrice[] = [
  {
    "round_id": "7548f6fc-7087-47ef-96c2-deb40b726c37",
    "asset_id": "29331eeb-3bfc-4881-95f2-c76429b49d95",
    "start_price": 100,
    "end_price": 180
  },
  {
    "round_id": "4680ad0c-1698-409b-8d34-9bf97b6eda45",
    "asset_id": "29331eeb-3bfc-4881-95f2-c76429b49d95",
    "start_price": 100,
    "end_price": 90
  },
  {
    "round_id": "460ad515-af75-429b-b74b-1bc5dbe7fdaf",
    "asset_id": "29331eeb-3bfc-4881-95f2-c76429b49d95",
    "start_price": 100,
    "end_price": 160
  },
  {
    "round_id": "2a401cad-67ff-459d-a5e0-1114a37001f5",
    "asset_id": "29331eeb-3bfc-4881-95f2-c76429b49d95",
    "start_price": 100,
    "end_price": 95
  },
  {
    "round_id": "1098d6d4-3018-4425-bad8-273405ecfe98",
    "asset_id": "29331eeb-3bfc-4881-95f2-c76429b49d95",
    "start_price": 100,
    "end_price": 150
  },
  {
    "round_id": "7548f6fc-7087-47ef-96c2-deb40b726c37",
    "asset_id": "4708ac30-5ca2-44ef-960f-526a9f3f455a",
    "start_price": 100,
    "end_price": 95
  },
  {
    "round_id": "4680ad0c-1698-409b-8d34-9bf97b6eda45",
    "asset_id": "4708ac30-5ca2-44ef-960f-526a9f3f455a",
    "start_price": 100,
    "end_price": 140
  },
  {
    "round_id": "460ad515-af75-429b-b74b-1bc5dbe7fdaf",
    "asset_id": "4708ac30-5ca2-44ef-960f-526a9f3f455a",
    "start_price": 100,
    "end_price": 210
  },
  {
    "round_id": "2a401cad-67ff-459d-a5e0-1114a37001f5",
    "asset_id": "4708ac30-5ca2-44ef-960f-526a9f3f455a",
    "start_price": 100,
    "end_price": 130
  },
  {
    "round_id": "1098d6d4-3018-4425-bad8-273405ecfe98",
    "asset_id": "4708ac30-5ca2-44ef-960f-526a9f3f455a",
    "start_price": 100,
    "end_price": 120
  },
  {
    "round_id": "7548f6fc-7087-47ef-96c2-deb40b726c37",
    "asset_id": "c24f1ba9-c628-4d73-ae27-548e85ba1d0f",
    "start_price": 100,
    "end_price": 110
  },
  {
    "round_id": "4680ad0c-1698-409b-8d34-9bf97b6eda45",
    "asset_id": "c24f1ba9-c628-4d73-ae27-548e85ba1d0f",
    "start_price": 100,
    "end_price": 85
  },
  {
    "round_id": "460ad515-af75-429b-b74b-1bc5dbe7fdaf",
    "asset_id": "c24f1ba9-c628-4d73-ae27-548e85ba1d0f",
    "start_price": 100,
    "end_price": 170
  },
  {
    "round_id": "2a401cad-67ff-459d-a5e0-1114a37001f5",
    "asset_id": "c24f1ba9-c628-4d73-ae27-548e85ba1d0f",
    "start_price": 100,
    "end_price": 105
  },
  {
    "round_id": "1098d6d4-3018-4425-bad8-273405ecfe98",
    "asset_id": "c24f1ba9-c628-4d73-ae27-548e85ba1d0f",
    "start_price": 100,
    "end_price": 90
  },
  {
    "round_id": "7548f6fc-7087-47ef-96c2-deb40b726c37",
    "asset_id": "2e97bacb-37a9-434d-b7e8-e7deb443bf6a",
    "start_price": 100,
    "end_price": 140
  },
  {
    "round_id": "4680ad0c-1698-409b-8d34-9bf97b6eda45",
    "asset_id": "2e97bacb-37a9-434d-b7e8-e7deb443bf6a",
    "start_price": 100,
    "end_price": 65
  },
  {
    "round_id": "460ad515-af75-429b-b74b-1bc5dbe7fdaf",
    "asset_id": "2e97bacb-37a9-434d-b7e8-e7deb443bf6a",
    "start_price": 100,
    "end_price": 190
  },
  {
    "round_id": "2a401cad-67ff-459d-a5e0-1114a37001f5",
    "asset_id": "2e97bacb-37a9-434d-b7e8-e7deb443bf6a",
    "start_price": 100,
    "end_price": 125
  },
  {
    "round_id": "1098d6d4-3018-4425-bad8-273405ecfe98",
    "asset_id": "2e97bacb-37a9-434d-b7e8-e7deb443bf6a",
    "start_price": 100,
    "end_price": 130
  },
  {
    "round_id": "7548f6fc-7087-47ef-96c2-deb40b726c37",
    "asset_id": "6dda9871-2613-4f75-8e9d-257820697cb0",
    "start_price": 100,
    "end_price": 120
  },
  {
    "round_id": "4680ad0c-1698-409b-8d34-9bf97b6eda45",
    "asset_id": "6dda9871-2613-4f75-8e9d-257820697cb0",
    "start_price": 100,
    "end_price": 70
  },
  {
    "round_id": "460ad515-af75-429b-b74b-1bc5dbe7fdaf",
    "asset_id": "6dda9871-2613-4f75-8e9d-257820697cb0",
    "start_price": 100,
    "end_price": 150
  },
  {
    "round_id": "2a401cad-67ff-459d-a5e0-1114a37001f5",
    "asset_id": "6dda9871-2613-4f75-8e9d-257820697cb0",
    "start_price": 100,
    "end_price": 100
  },
  {
    "round_id": "1098d6d4-3018-4425-bad8-273405ecfe98",
    "asset_id": "6dda9871-2613-4f75-8e9d-257820697cb0",
    "start_price": 100,
    "end_price": 115
  },
  {
    "round_id": "7548f6fc-7087-47ef-96c2-deb40b726c37",
    "asset_id": "f1d53b8e-7278-424d-af3b-262ffdb39142",
    "start_price": 100,
    "end_price": 125
  },
  {
    "round_id": "4680ad0c-1698-409b-8d34-9bf97b6eda45",
    "asset_id": "f1d53b8e-7278-424d-af3b-262ffdb39142",
    "start_price": 100,
    "end_price": 135
  },
  {
    "round_id": "460ad515-af75-429b-b74b-1bc5dbe7fdaf",
    "asset_id": "f1d53b8e-7278-424d-af3b-262ffdb39142",
    "start_price": 100,
    "end_price": 95
  },
  {
    "round_id": "2a401cad-67ff-459d-a5e0-1114a37001f5",
    "asset_id": "f1d53b8e-7278-424d-af3b-262ffdb39142",
    "start_price": 100,
    "end_price": 85
  },
  {
    "round_id": "1098d6d4-3018-4425-bad8-273405ecfe98",
    "asset_id": "f1d53b8e-7278-424d-af3b-262ffdb39142",
    "start_price": 100,
    "end_price": 80
  },
  {
    "round_id": "7548f6fc-7087-47ef-96c2-deb40b726c37",
    "asset_id": "41c2aa59-cc6c-4a31-842c-561951129e98",
    "start_price": 100,
    "end_price": 100
  },
  {
    "round_id": "4680ad0c-1698-409b-8d34-9bf97b6eda45",
    "asset_id": "41c2aa59-cc6c-4a31-842c-561951129e98",
    "start_price": 100,
    "end_price": 150
  },
  {
    "round_id": "460ad515-af75-429b-b74b-1bc5dbe7fdaf",
    "asset_id": "41c2aa59-cc6c-4a31-842c-561951129e98",
    "start_price": 100,
    "end_price": 70
  },
  {
    "round_id": "2a401cad-67ff-459d-a5e0-1114a37001f5",
    "asset_id": "41c2aa59-cc6c-4a31-842c-561951129e98",
    "start_price": 100,
    "end_price": 110
  },
  {
    "round_id": "1098d6d4-3018-4425-bad8-273405ecfe98",
    "asset_id": "41c2aa59-cc6c-4a31-842c-561951129e98",
    "start_price": 100,
    "end_price": 105
  },
  {
    "round_id": "7548f6fc-7087-47ef-96c2-deb40b726c37",
    "asset_id": "997f3d4a-2f6e-411c-97e4-7a8c985e6bed",
    "start_price": 100,
    "end_price": 105
  },
  {
    "round_id": "4680ad0c-1698-409b-8d34-9bf97b6eda45",
    "asset_id": "997f3d4a-2f6e-411c-97e4-7a8c985e6bed",
    "start_price": 100,
    "end_price": 115
  },
  {
    "round_id": "460ad515-af75-429b-b74b-1bc5dbe7fdaf",
    "asset_id": "997f3d4a-2f6e-411c-97e4-7a8c985e6bed",
    "start_price": 100,
    "end_price": 100
  },
  {
    "round_id": "2a401cad-67ff-459d-a5e0-1114a37001f5",
    "asset_id": "997f3d4a-2f6e-411c-97e4-7a8c985e6bed",
    "start_price": 100,
    "end_price": 90
  },
  {
    "round_id": "1098d6d4-3018-4425-bad8-273405ecfe98",
    "asset_id": "997f3d4a-2f6e-411c-97e4-7a8c985e6bed",
    "start_price": 100,
    "end_price": 110
  }
];

export const HINTS: StaticHint[] = [
  {
    "id": "932d79e6-d616-43c4-a73b-5d6707dfe4b1",
    "round_id": "1098d6d4-3018-4425-bad8-273405ecfe98",
    "level": "low",
    "content": "스마트폰과 모바일 서비스 사용이 계속 늘어나고 있습니다.",
    "cost": 100000
  },
  {
    "id": "64c5f593-0362-4d9d-8232-9e37002b01e2",
    "round_id": "1098d6d4-3018-4425-bad8-273405ecfe98",
    "level": "middle",
    "content": "모바일 기기, 메모리 반도체, 온라인 플랫폼 관련 산업에 주목할 필요가 있습니다.",
    "cost": 300000
  },
  {
    "id": "ea33c8dd-0b7e-4a4a-a067-19015af0c6d1",
    "round_id": "1098d6d4-3018-4425-bad8-273405ecfe98",
    "level": "high",
    "content": "반도체와 플랫폼 산업은 성장 가능성이 크고, 전통 제조업 일부는 상대적으로 부진할 수 있습니다.",
    "cost": 700000
  },
  {
    "id": "24869539-17ce-4fca-b883-c75458e83347",
    "round_id": "2a401cad-67ff-459d-a5e0-1114a37001f5",
    "level": "low",
    "content": "전기차와 친환경 기술에 대한 관심이 점점 커지고 있습니다.",
    "cost": 100000
  },
  {
    "id": "2bd0b632-681a-4dfc-b9e4-957ca3bef79c",
    "round_id": "2a401cad-67ff-459d-a5e0-1114a37001f5",
    "level": "middle",
    "content": "배터리, 플랫폼, 에너지 관련 산업의 변화가 중요하게 작용할 수 있습니다.",
    "cost": 300000
  },
  {
    "id": "50ac56a8-4835-47f5-bb09-458375f4b49c",
    "round_id": "2a401cad-67ff-459d-a5e0-1114a37001f5",
    "level": "high",
    "content": "2차전지와 인터넷 플랫폼은 성장 여지가 있지만, 일부 경기민감 산업은 약세를 보일 수 있습니다.",
    "cost": 700000
  },
  {
    "id": "46fac7be-6267-4b0d-a3da-183678bcd6c7",
    "round_id": "460ad515-af75-429b-b74b-1bc5dbe7fdaf",
    "level": "low",
    "content": "비대면 생활 방식이 갑자기 중요해지는 시기입니다.",
    "cost": 100000
  },
  {
    "id": "4813a220-0138-4fd2-9fe6-ebad53ed22da",
    "round_id": "460ad515-af75-429b-b74b-1bc5dbe7fdaf",
    "level": "middle",
    "content": "온라인 쇼핑, 플랫폼, 바이오, 게임, 배터리 관련 산업이 주목받을 수 있습니다.",
    "cost": 300000
  },
  {
    "id": "4c348382-d3b4-42c4-a730-4cca96e18b7b",
    "round_id": "460ad515-af75-429b-b74b-1bc5dbe7fdaf",
    "level": "high",
    "content": "코로나19 이후 플랫폼, 바이오, 게임, 2차전지 산업은 강세를 보일 가능성이 큽니다.",
    "cost": 700000
  },
  {
    "id": "66546f1a-0a33-45d0-b080-170d1b2dfae8",
    "round_id": "4680ad0c-1698-409b-8d34-9bf97b6eda45",
    "level": "low",
    "content": "금리 상승과 물가 상승이 시장 전체에 부담을 주는 시기입니다.",
    "cost": 100000
  },
  {
    "id": "ad02dc96-6a87-46c4-b5ac-325ba3e39973",
    "round_id": "4680ad0c-1698-409b-8d34-9bf97b6eda45",
    "level": "middle",
    "content": "성장주 일부는 약세를 보이고, 에너지와 조선·해운 같은 산업이 주목받을 수 있습니다.",
    "cost": 300000
  },
  {
    "id": "85d2afd4-1cb2-46a7-91a7-d7444deea0c3",
    "round_id": "4680ad0c-1698-409b-8d34-9bf97b6eda45",
    "level": "high",
    "content": "플랫폼, 게임 등 고성장 기술주는 부진할 수 있고, 에너지와 조선·해운은 상대적으로 강세를 보일 수 있습니다.",
    "cost": 700000
  },
  {
    "id": "df6b6530-d315-4f9c-97fc-4eda196d8127",
    "round_id": "7548f6fc-7087-47ef-96c2-deb40b726c37",
    "level": "low",
    "content": "인공지능 기술이 빠르게 주목받는 시기입니다.",
    "cost": 100000
  },
  {
    "id": "7cd3a127-9674-48e0-a307-f618c3f4d037",
    "round_id": "7548f6fc-7087-47ef-96c2-deb40b726c37",
    "level": "middle",
    "content": "AI 확산으로 반도체와 플랫폼 산업의 중요성이 커질 수 있습니다.",
    "cost": 300000
  },
  {
    "id": "93b2b347-623f-4ca8-9595-fadb3df23132",
    "round_id": "7548f6fc-7087-47ef-96c2-deb40b726c37",
    "level": "high",
    "content": "AI 투자 확대로 반도체 산업은 강세를 보일 가능성이 크며, 플랫폼 산업도 수혜를 받을 수 있습니다.",
    "cost": 700000
  }
];
