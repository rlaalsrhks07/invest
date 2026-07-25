from __future__ import annotations

from pathlib import Path
import re
import shutil
import sys

ROOT = Path.cwd()

HINT_PANEL = ROOT / "components" / "HintPanel.tsx"
TEAM_PAGE = ROOT / "app" / "team" / "[teamId]" / "page.tsx"
HINT_API = ROOT / "app" / "api" / "hints" / "view" / "route.ts"
RESET_SQL = ROOT / "supabase_reset.sql"
MIGRATION_SQL = ROOT / "supabase_one_hint_per_round.sql"


def fail(message: str) -> None:
    print(f"오류: {message}")
    sys.exit(1)


def read(path: Path) -> str:
    if not path.exists():
        fail(f"파일을 찾을 수 없습니다: {path}")
    return path.read_text(encoding="utf-8")


def write(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8")


def backup(path: Path) -> None:
    backup_path = path.with_name(path.name + ".before-one-hint-fix-v2")
    if not backup_path.exists():
        shutil.copy2(path, backup_path)
        print(f"백업 생성: {backup_path}")


def replace_once(
    text: str,
    old: str,
    new: str,
    label: str,
) -> str:
    if new in text:
        print(f"변경 없음: {label}")
        return text

    if old not in text:
        fail(f"수정 지점을 찾지 못했습니다: {label}")

    print(f"수정: {label}")
    return text.replace(old, new, 1)


# ---------------------------------------------------------------------------
# 1. HintPanel.tsx
# 이전 스크립트가 이 파일만 먼저 수정한 뒤 중단됐을 수 있으므로
# 각 변경을 개별적으로 확인하고 이어서 적용합니다.
# ---------------------------------------------------------------------------
hint_panel = read(HINT_PANEL)
backup(HINT_PANEL)

if "const hasPurchasedHint" not in hint_panel:
    loading_pattern = re.compile(
        r'''(?P<block>
  const \[loadingLevel,\s*setLoadingLevel\] =
    useState<HintLevel \| null>\(null\);
)''',
        re.VERBOSE,
    )
    match = loading_pattern.search(hint_panel)

    if not match:
        fail("수정 지점을 찾지 못했습니다: HintPanel 구매 상태")

    replacement = (
        match.group("block")
        + "\n"
        + "  const hasPurchasedHint =\n"
        + "    viewedHints.length > 0;\n"
    )

    hint_panel = (
        hint_panel[:match.start()]
        + replacement
        + hint_panel[match.end():]
    )
    print("수정: HintPanel 구매 상태")
else:
    print("변경 없음: HintPanel 구매 상태")

if "if (hasPurchasedHint)" not in hint_panel:
    marker = '''    const alreadyViewed =
      viewedHints.find(
'''
    insertion = '''    if (hasPurchasedHint) {
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
'''
    hint_panel = replace_once(
        hint_panel,
        marker,
        insertion,
        "HintPanel 구매 함수 차단",
    )
else:
    print("변경 없음: HintPanel 구매 함수 차단")

if "hasPurchasedHint ||\n                  loadingLevel !== null" not in hint_panel:
    disabled_pattern = re.compile(
        r'''disabled=\{
\s*disabled\s*\|\|
\s*Boolean\(
\s*viewedHint
\s*\)\s*\|\|
\s*isLoading
\s*\}''',
        re.VERBOSE,
    )

    hint_panel, count = disabled_pattern.subn(
        '''disabled={
                  disabled ||
                  hasPurchasedHint ||
                  loadingLevel !== null
                }''',
        hint_panel,
        count=1,
    )

    if count != 1:
        fail("수정 지점을 찾지 못했습니다: 전체 힌트 버튼 비활성화")

    print("수정: 전체 힌트 버튼 비활성화")
else:
    print("변경 없음: 전체 힌트 버튼 비활성화")

if '? "구매 불가"' not in hint_panel:
    old_label = '''                {viewedHint
                  ? "열람 완료"
                  : isLoading
                    ? "처리 중..."
                    : "힌트 구매"}
'''
    new_label = '''                {viewedHint
                  ? "열람 완료"
                  : hasPurchasedHint
                    ? "구매 불가"
                    : isLoading
                      ? "처리 중..."
                      : "힌트 구매"}
'''
    hint_panel = replace_once(
        hint_panel,
        old_label,
        new_label,
        "힌트 버튼 문구",
    )
else:
    print("변경 없음: 힌트 버튼 문구")

write(HINT_PANEL, hint_panel)


# ---------------------------------------------------------------------------
# 2. app/team/[teamId]/page.tsx
# 현재 저장소의 줄바꿈 형식에 맞춰 작은 단위로 수정합니다.
# ---------------------------------------------------------------------------
team_page = read(TEAM_PAGE)
backup(TEAM_PAGE)

if "const hasPurchasedHint" not in team_page:
    marker = '''  const hintDisabled =
'''
    insertion = '''  const hasPurchasedHint =
    viewedHints.length > 0;

  const hintDisabled =
'''
    team_page = replace_once(
        team_page,
        marker,
        insertion,
        "팀 페이지 구매 여부 계산",
    )
else:
    print("변경 없음: 팀 페이지 구매 여부 계산")

if '''const hintDisabled =
    hasPurchasedHint ||''' not in team_page:
    old_disabled = '''  const hintDisabled =
    alreadySubmitted ||
    resultIsOpen;
'''
    new_disabled = '''  const hintDisabled =
    hasPurchasedHint ||
    alreadySubmitted ||
    resultIsOpen;
'''
    team_page = replace_once(
        team_page,
        old_disabled,
        new_disabled,
        "팀 페이지 힌트 상점 비활성화",
    )
else:
    print("변경 없음: 팀 페이지 힌트 상점 비활성화")

if '"이번 라운드에서는 힌트를 하나만 구매할 수 있습니다."' not in team_page:
    old_reason = '''      : alreadySubmitted
        ? "투자를 제출한 뒤에는 새 힌트를 구매할 수 없습니다."
        : undefined;
'''
    new_reason = '''      : alreadySubmitted
        ? "투자를 제출한 뒤에는 새 힌트를 구매할 수 없습니다."
        : hasPurchasedHint
          ? "이번 라운드에서는 힌트를 하나만 구매할 수 있습니다."
          : undefined;
'''
    team_page = replace_once(
        team_page,
        old_reason,
        new_reason,
        "팀 페이지 비활성화 안내",
    )
else:
    print("변경 없음: 팀 페이지 비활성화 안내")

write(TEAM_PAGE, team_page)


# ---------------------------------------------------------------------------
# 3. API
# 같은 힌트 ID가 아니라 같은 팀·같은 라운드의 구매 기록 전체를 검사합니다.
# ---------------------------------------------------------------------------
hint_api = read(HINT_API)
backup(HINT_API)

if '.select("hint_id, deducted_amount")' not in hint_api:
    old_query = '''    const { data: existingView, error: existingViewError } = await supabase
      .from("team_hint_views")
      .select("deducted_amount")
      .eq("team_id", teamId)
      .eq("round_id", roundId)
      .eq("hint_id", hint.id)
      .maybeSingle();
'''
    new_query = '''    const { data: existingView, error: existingViewError } = await supabase
      .from("team_hint_views")
      .select("hint_id, deducted_amount")
      .eq("team_id", teamId)
      .eq("round_id", roundId)
      .limit(1)
      .maybeSingle();
'''
    hint_api = replace_once(
        hint_api,
        old_query,
        new_query,
        "API 기존 구매 조회 범위",
    )
else:
    print("변경 없음: API 기존 구매 조회 범위")

if "existingView.hint_id !== hint.id" not in hint_api:
    marker = '''    if (existingView) {
      const { data: team } = await supabase
'''
    replacement = '''    if (existingView) {
      if (existingView.hint_id !== hint.id) {
        return NextResponse.json(
          {
            error:
              "이번 라운드에서는 힌트를 하나만 구매할 수 있습니다.",
          },
          { status: 409 }
        );
      }

      const { data: team } = await supabase
'''
    hint_api = replace_once(
        hint_api,
        marker,
        replacement,
        "API 다른 단계 구매 차단",
    )
else:
    print("변경 없음: API 다른 단계 구매 차단")

if 'insertViewError.code === "23505"' not in hint_api:
    marker = '''      if (rollbackError) {
        console.error("힌트 비용 복구 실패:", rollbackError);
      }

      return NextResponse.json(
        { error: "힌트 열람 기록 저장에 실패했습니다." },
        { status: 500 }
      );
'''
    replacement = '''      if (rollbackError) {
        console.error("힌트 비용 복구 실패:", rollbackError);
      }

      if (insertViewError.code === "23505") {
        return NextResponse.json(
          {
            error:
              "이번 라운드에서는 힌트를 하나만 구매할 수 있습니다.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "힌트 열람 기록 저장에 실패했습니다." },
        { status: 500 }
      );
'''
    hint_api = replace_once(
        hint_api,
        marker,
        replacement,
        "API 동시 구매 충돌 처리",
    )
else:
    print("변경 없음: API 동시 구매 충돌 처리")

write(HINT_API, hint_api)


# ---------------------------------------------------------------------------
# 4. 초기화 SQL
# ---------------------------------------------------------------------------
reset_sql = read(RESET_SQL)
backup(RESET_SQL)

if "  unique (team_id, round_id)\n" not in reset_sql:
    reset_sql = replace_once(
        reset_sql,
        "  unique (team_id, round_id, hint_id)\n",
        "  unique (team_id, round_id)\n",
        "초기화 SQL 고유 제약",
    )
else:
    print("변경 없음: 초기화 SQL 고유 제약")

write(RESET_SQL, reset_sql)


# ---------------------------------------------------------------------------
# 5. 현재 Supabase DB에 한 번 실행할 SQL 생성
# 기존 중복 기록이 있다면 가장 먼저 구매한 하나만 남기고
# 삭제되는 기록의 차감액을 팀 현금에 돌려줍니다.
# ---------------------------------------------------------------------------
migration = '''-- Supabase Dashboard > SQL Editor에서 한 번 실행하세요.
-- 팀별·라운드별로 힌트 하나만 구매할 수 있도록 변경합니다.

begin;

create temporary table duplicate_hint_views
on commit drop
as
select
  id,
  team_id,
  deducted_amount
from (
  select
    id,
    team_id,
    deducted_amount,
    row_number() over (
      partition by team_id, round_id
      order by created_at asc, id asc
    ) as purchase_order
  from public.team_hint_views
) ranked
where purchase_order > 1;

update public.teams as team
set cash = team.cash + refund.total_refund
from (
  select
    team_id,
    sum(deducted_amount) as total_refund
  from duplicate_hint_views
  group by team_id
) as refund
where team.id = refund.team_id;

delete from public.team_hint_views
where id in (
  select id
  from duplicate_hint_views
);

alter table public.team_hint_views
  drop constraint if exists team_hint_views_team_id_round_id_hint_id_key;

alter table public.team_hint_views
  drop constraint if exists team_hint_views_one_per_round_key;

alter table public.team_hint_views
  add constraint team_hint_views_one_per_round_key
  unique (team_id, round_id);

commit;
'''

write(MIGRATION_SQL, migration)
print(f"생성: {MIGRATION_SQL}")


# ---------------------------------------------------------------------------
# 최종 확인
# ---------------------------------------------------------------------------
checks = {
    "HintPanel 구매 여부": "const hasPurchasedHint" in hint_panel,
    "HintPanel 전체 버튼 차단":
        "hasPurchasedHint ||\n                  loadingLevel !== null"
        in hint_panel,
    "팀 페이지 구매 여부": "const hasPurchasedHint" in team_page,
    "팀 페이지 상점 차단":
        "const hintDisabled =\n    hasPurchasedHint ||"
        in team_page,
    "API 팀·라운드 조회":
        '.select("hint_id, deducted_amount")'
        in hint_api,
    "API 다른 단계 차단":
        "existingView.hint_id !== hint.id"
        in hint_api,
    "초기화 SQL 제약":
        "  unique (team_id, round_id)\n"
        in reset_sql,
}

failed = [
    name
    for name, passed in checks.items()
    if not passed
]

if failed:
    fail("최종 확인 실패: " + ", ".join(failed))

print("")
print("수정 완료")
print("- 같은 라운드에서 힌트 하나만 구매 가능")
print("- 구매 직후 다른 버튼 즉시 비활성화")
print("- 새로고침 후에도 구매 차단 유지")
print("- API 직접 호출과 동시 구매도 차단")
print("")
print("다음 순서로 진행하세요:")
print("1. Supabase SQL Editor에서 supabase_one_hint_per_round.sql 실행")
print("2. npm run build")