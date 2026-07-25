export const MAX_ASSET_INVESTMENT_RATIO = 0.5;

export function getMaxInvestmentPerAsset(
  availableCash: number
) {
  if (
    !Number.isSafeInteger(availableCash) ||
    availableCash < 0
  ) {
    return 0;
  }

  return Math.floor(
    availableCash *
      MAX_ASSET_INVESTMENT_RATIO
  );
}
