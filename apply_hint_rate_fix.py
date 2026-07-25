from __future__ import annotations

from pathlib import Path
import re
import shutil
import sys


ROOT = Path.cwd()
HINT_PANEL = ROOT / "components" / "HintPanel.tsx"
INVESTMENT_FORM = ROOT / "components" / "InvestmentForm.tsx"

ONE_HINT_MESSAGE = "이번 라운드에서는 힌트를 하나만 구매할 수 있습니다."


def fail(message: str) -> None:
    print(f"오류: {message}")
    sys.exit(1)


def read_file(path: Path) -> str:
    if not path.exists():
        fail(f"파일을 찾을 수 없습니다: {path}")
    return path.read_text(encoding="utf-8")


def make_backup(path: Path) -> None:
    backup = path.with_name(path.name + ".before-ui-text-cleanup")
    if not backup.exists():
        shutil.copy2(path, backup)
        print(f"백업 생성: {backup}")


def matching_div_end(lines: list[str], start: int) -> int | None:
    depth = 0
    started = False

    for index in range(start, len(lines)):
        line = lines[index]
        opens = len(re.findall(r"<div(?:\s|>)", line))
        closes = line.count("</div>")

        if opens:
            started = True

        depth += opens
        depth -= closes

        if started and depth == 0:
            return index

    return None


def remove_div_containing(
    text: str,
    *,
    marker: str,
    preferred_start_terms: tuple[str, ...],
    label: str,
) -> tuple[str, bool]:
    lines = text.splitlines(keepends=True)

    marker_indexes = [
        index
        for index, line in enumerate(lines)
        if marker in line
    ]

    if not marker_indexes:
        print(f"변경 없음: {label}")
        return text, False

    for marker_index in marker_indexes:
        candidates: list[tuple[int, int, bool]] = []

        for start in range(
            marker_index,
            max(-1, marker_index - 30),
            -1,
        ):
            if "<div" not in lines[start]:
                continue

            end = matching_div_end(lines, start)
            if end is None or end < marker_index:
                continue

            block = "".join(lines[start : end + 1])
            if marker not in block:
                continue

            preferred = any(
                term in lines[start]
                for term in preferred_start_terms
            )
            candidates.append((start, end, preferred))

        if not candidates:
            continue

        preferred_candidates = [
            item for item in candidates if item[2]
        ]

        if preferred_candidates:
            start, end, _ = max(
                preferred_candidates,
                key=lambda item: item[0],
            )
        else:
            start, end, _ = max(
                candidates,
                key=lambda item: item[0],
            )

        del lines[start : end + 1]
        print(f"수정: {label}")
        return "".join(lines), True

    fail(f"삭제할 JSX 블록을 찾지 못했습니다: {label}")
    return text, False


# 1. HintPanel: 힌트 1개 구매 안내 박스 숨기기
hint_text = read_file(HINT_PANEL)
make_backup(HINT_PANEL)

if (
    "disabledReason !==" in hint_text
    and ONE_HINT_MESSAGE in hint_text
):
    print("변경 없음: 힌트 1개 구매 안내 박스")
else:
    pattern = re.compile(
        r'''\{disabled\s*&&\s*
            disabledReason\s*&&\s*
            \(''',
        re.VERBOSE,
    )

    replacement = '''{disabled &&
        disabledReason &&
        disabledReason !==
          "이번 라운드에서는 힌트를 하나만 구매할 수 있습니다." && ('''

    hint_text, count = pattern.subn(
        replacement,
        hint_text,
        count=1,
    )

    if count != 1:
        fail(
            "수정 지점을 찾지 못했습니다: "
            "HintPanel의 비활성화 안내 박스"
        )

    print("수정: 힌트 1개 구매 안내 박스")


# 2. HintPanel: 구매한 힌트 기사 오른쪽의 차감액 박스 제거
hint_lines = hint_text.splitlines()
has_standalone_deduction_label = any(
    line.strip() == "차감액"
    for line in hint_lines
)

if not has_standalone_deduction_label:
    print("변경 없음: 구매한 힌트 차감액 박스")
else:
    hint_text, _ = remove_div_containing(
        hint_text,
        marker="hint.deductedAmount.toLocaleString",
        preferred_start_terms=(
            "shrink-0",
            "text-right",
            "rounded-xl",
        ),
        label="구매한 힌트 차감액 박스",
    )

HINT_PANEL.write_text(hint_text, encoding="utf-8")


# 3. InvestmentForm: 우측 상단 투자 가능 현금 카드 제거
investment_text = read_file(INVESTMENT_FORM)
make_backup(INVESTMENT_FORM)

investment_text, investment_changed = remove_div_containing(
    investment_text,
    marker="투자 가능 현금",
    preferred_start_terms=(
        "text-right",
        "rounded-xl",
        "bg-indigo-50",
    ),
    label="투자 가능 현금 카드",
)

if investment_changed:
    investment_text = re.sub(
        r'<header className="flex items-end justify-between gap-6">',
        "<header>",
        investment_text,
        count=1,
    )

INVESTMENT_FORM.write_text(
    investment_text,
    encoding="utf-8",
)


# 최종 확인
final_hint = HINT_PANEL.read_text(encoding="utf-8")
final_investment = INVESTMENT_FORM.read_text(encoding="utf-8")

checks = {
    "힌트 제한 안내 숨김":
        'disabledReason !==\n          "이번 라운드에서는 힌트를 하나만 구매할 수 있습니다."' in final_hint,
    "구매 기사 차감액 박스 삭제":
        "hint.deductedAmount.toLocaleString" not in final_hint,
    "투자 가능 현금 카드 삭제":
        "투자 가능 현금" not in final_investment,
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
print("- 힌트 1개 구매 안내 박스 숨김")
print("- 구매한 힌트 기사 안의 차감액 표시 삭제")
print("- 산업별 투자 우측 상단의 투자 가능 현금 카드 삭제")
print("- 힌트 구매 제한, 차감 계산, 투자 계산 기능은 유지")
print("")
print("다음 명령을 실행하세요:")
print("npm run build")