from __future__ import annotations

import re
import shutil
from pathlib import Path

TARGET = Path("components/InvestmentForm.tsx")
BACKUP = Path("components/InvestmentForm.tsx.before-summary-fix")


def fail(message: str) -> None:
    raise SystemExit(f"수정 실패: {message}")


def replace_last(text: str, old: str, new: str, label: str) -> str:
    index = text.rfind(old)
    if index == -1:
        fail(f"{label} 위치를 찾지 못했습니다.")
    return text[:index] + new + text[index + len(old):]


if not TARGET.exists():
    fail("components/InvestmentForm.tsx 파일이 없습니다. 프로젝트 최상위 폴더에서 실행해 주세요.")

if not BACKUP.exists():
    shutil.copy2(TARGET, BACKUP)

text = TARGET.read_text(encoding="utf-8")
original = text

# 1. 제출 직후 화면에 고정해 둘 요약 상태를 추가한다.
if not re.search(r"const\s*\[\s*submittedSummary\s*,\s*setSubmittedSummary", text):
    loading_pattern = re.compile(
        r"(?P<block>\n\s*const \[loading, setLoading\]\s*=\s*\n?\s*useState\(false\);)"
    )
    match = loading_pattern.search(text)
    if not match:
        fail("loading 상태 선언")

    insertion = match.group("block") + """

  const [
    submittedSummary,
    setSubmittedSummary,
  ] = useState<{
    totalAmount: number;
    remainingCash: number;
  } | null>(null);"""
    text = text[: match.start()] + insertion + text[match.end() :]

# 2. 입력 중 계산값과 제출 완료 후 표시값을 분리한다.
if "const displayedTotalAmount" not in text:
    remaining_pattern = re.compile(
        r"(?P<block>\n\s*const remainingCash\s*=\s*\n?\s*currentCash\s*-\s*totalAmount;)"
    )
    match = remaining_pattern.search(text)
    if not match:
        fail("remainingCash 계산")

    insertion = match.group("block") + """

  const displayedTotalAmount =
    submittedSummary?.totalAmount ??
    totalAmount;
  const displayedRemainingCash =
    submittedSummary?.remainingCash ??
    remainingCash;"""
    text = text[: match.start()] + insertion + text[match.end() :]

# 3. 제출 성공 시 서버가 확정한 투자액과 남은 현금을 저장한다.
if "setSubmittedSummary({" not in text:
    submitted_pattern = re.compile(r"\n(?P<indent>\s*)setIsSubmitted\(")
    match = submitted_pattern.search(text)
    if not match:
        fail("setIsSubmitted 호출")

    indent = match.group("indent")
    block = f"""
{indent}const serverInvestedAmount =
{indent}  Number(data.investedAmount);
{indent}const serverRemainingCash =
{indent}  Number(data.remainingCash);

{indent}const submittedTotalAmount =
{indent}  Number.isSafeInteger(
{indent}    serverInvestedAmount
{indent}  )
{indent}    ? serverInvestedAmount
{indent}    : totalAmount;
{indent}const submittedRemainingCash =
{indent}  Number.isSafeInteger(
{indent}    serverRemainingCash
{indent}  )
{indent}    ? serverRemainingCash
{indent}    : currentCash -
{indent}      submittedTotalAmount;

{indent}setSubmittedSummary({{
{indent}  totalAmount:
{indent}    submittedTotalAmount,
{indent}  remainingCash:
{indent}    submittedRemainingCash,
{indent}}});
"""
    text = text[: match.start()] + block + text[match.start() :]

# 4. 하단 요약 숫자는 제출 결과 상태를 사용한다.
if "{displayedTotalAmount.toLocaleString(" not in text:
    text = replace_last(
        text,
        "{totalAmount.toLocaleString(",
        "{displayedTotalAmount.toLocaleString(",
        "하단 총 투자 금액 표시",
    )

if "{displayedRemainingCash.toLocaleString(" not in text:
    text = replace_last(
        text,
        "{remainingCash.toLocaleString(",
        "{displayedRemainingCash.toLocaleString(",
        "하단 투자 후 현금 표시",
    )

# 5. 제출 완료 후 currentCash가 갱신되어도 빨간 오류 표시가 생기지 않게 한다.
if not re.search(r"!isSubmitted\s*&&\s*\(\s*totalAmount\s*>\s*currentCash\s*\|\|\s*hasInvalidAmount\s*\)", text):
    total_error_pattern = re.compile(
        r"totalAmount\s*>\s*currentCash\s*\|\|\s*hasInvalidAmount"
    )
    matches = list(total_error_pattern.finditer(text))
    if not matches:
        fail("하단 총 투자 금액 오류 표시 조건")
    match = matches[-1]
    replacement = "!isSubmitted &&\n                  (totalAmount >\n                    currentCash ||\n                    hasInvalidAmount)"
    text = text[: match.start()] + replacement + text[match.end() :]

if not re.search(r"!isSubmitted\s*&&\s*remainingCash\s*<\s*0", text):
    remaining_error_pattern = re.compile(r"remainingCash\s*<\s*0")
    matches = list(remaining_error_pattern.finditer(text))
    if not matches:
        fail("하단 투자 후 현금 오류 표시 조건")
    match = matches[-1]
    replacement = "!isSubmitted &&\n                  remainingCash <\n                    0"
    text = text[: match.start()] + replacement + text[match.end() :]

if text == original:
    print("변경 없음: 이미 투자 제출 요약 버그가 수정된 상태입니다.")
else:
    TARGET.write_text(text, encoding="utf-8")
    print("수정 완료: 투자 제출 후 총 투자 금액과 투자 후 현금이 정상적으로 유지됩니다.")
    print(f"백업 파일: {BACKUP}")
    print("이제 npm run build 를 실행해 확인하세요.")