from __future__ import annotations

from pathlib import Path
import shutil
import sys

path = Path("components/InvestmentForm.tsx")

if not path.exists():
    print(f"오류: 파일을 찾을 수 없습니다: {path}")
    sys.exit(1)

text = path.read_text(encoding="utf-8")
lines = text.splitlines(keepends=True)

targets = (
    "원 (현재 재산의 50%)",
    "종목당 최대",
)

target_indexes = [
    i for i, line in enumerate(lines)
    if any(target in line for target in targets)
]

if not target_indexes:
    print("오류: 깨진 안내 문구 블록을 찾지 못했습니다.")
    print("InvestmentForm.tsx의 오류 줄 주변을 직접 확인해 주세요.")
    sys.exit(1)

backup = path.with_name(path.name + ".before-jsx-repair")
if not backup.exists():
    shutil.copy2(path, backup)
    print(f"백업 생성: {backup}")

remove_ranges: list[tuple[int, int]] = []

for target_index in target_indexes:
    # 투자 금액 입력칸의 '원' span을 찾습니다.
    span_close = None
    for i in range(target_index - 1, -1, -1):
        if "</span>" in lines[i]:
            span_close = i
            break
        if "<article" in lines[i]:
            break

    if span_close is None:
        print("오류: 안내 문구 앞의 입력칸 </span>을 찾지 못했습니다.")
        sys.exit(1)

    # span 다음의 입력칸 wrapper </div>를 찾습니다.
    input_div_close = None
    for i in range(span_close + 1, target_index + 1):
        if "</div>" in lines[i]:
            input_div_close = i
            break

    if input_div_close is None:
        print("오류: 입력칸 wrapper의 </div>를 찾지 못했습니다.")
        sys.exit(1)

    # 해당 종목 카드의 </article>을 찾습니다.
    article_close = None
    for i in range(target_index + 1, len(lines)):
        if "</article>" in lines[i]:
            article_close = i
            break
        if "<article" in lines[i]:
            break

    if article_close is None:
        print("오류: 안내 문구 뒤의 </article>을 찾지 못했습니다.")
        sys.exit(1)

    # 입력칸 wrapper와 article 사이에는 삭제 대상 안내 JSX만 있어야 합니다.
    remove_ranges.append((input_div_close + 1, article_close))

# 뒤쪽 범위부터 삭제합니다.
for start, end in sorted(set(remove_ranges), reverse=True):
    del lines[start:end]

updated = "".join(lines)

# 문제를 일으킨 고아 JSX 조각이 남았는지 확인합니다.
remaining = [
    phrase for phrase in targets
    if phrase in updated
]

if remaining:
    print("오류: 일부 안내 문구가 여전히 남아 있습니다:", ", ".join(remaining))
    sys.exit(1)

path.write_text(updated, encoding="utf-8")

print("JSX 문법 복구 완료")
print("- 입력칸 아래에 남은 조건부 안내 블록과 고아 )} 제거")
print("- 하단 전체 경고, 빨간 테두리, 제출 제한 로직은 건드리지 않음")
print("")
print("다음 명령을 실행하세요:")
print("npm run build")