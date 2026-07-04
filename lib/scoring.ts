export function calculateReturnRate(startPrice: number, endPrice: number) {
  if (startPrice <= 0) return 0;
  return (endPrice - startPrice) / startPrice;
}

export function calculateResultAmount(
  amount: number,
  startPrice: number,
  endPrice: number
) {
  const returnRate = calculateReturnRate(startPrice, endPrice);
  return Math.round(amount * (1 + returnRate));
}

export function formatWon(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}