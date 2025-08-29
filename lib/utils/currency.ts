export const formatCurrency = (
  amount: number | null | undefined,
  shortForm?: boolean
) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "RM 0.00";
  }

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
