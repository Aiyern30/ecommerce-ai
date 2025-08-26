export const formatCurrency = (amount: number, shortForm?: boolean) => {
  if (shortForm) {
    if (amount >= 1_000_000) {
      return `RM ${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (amount >= 1_000) {
      return `RM ${(amount / 1_000).toFixed(2)}k`;
    }
    return `RM ${amount.toFixed(2)}`;
  }
  return `RM ${amount.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
