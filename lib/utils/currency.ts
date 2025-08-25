export const formatCurrency = (amount: number) => {
  if (amount >= 1_000_000) {
    return `RM ${(amount / 1_000_000).toFixed(2)}m`;
  }
  if (amount >= 1_000) {
    return `RM ${(amount / 1_000).toFixed(2)}k`;
  }
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
