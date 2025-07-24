/**
 * Currency formatting utilities for consistent display across the application
 */

export const CURRENCY_SYMBOL = "RM";
export const CURRENCY_CODE = "MYR";

/**
 * Format a number as currency with the Malaysian Ringgit symbol
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "RM25.50")
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(decimals)}`;
}

/**
 * Format a number as currency for display in components
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatPrice(amount: number): string {
  return formatCurrency(amount, 2);
}

/**
 * Parse a currency string to get the numeric value
 * @param currencyString - String like "RM25.50"
 * @returns Numeric value
 */
export function parseCurrency(currencyString: string): number {
  return parseFloat(currencyString.replace(CURRENCY_SYMBOL, ""));
}

/**
 * Format currency for Stripe (converts to smallest currency unit)
 * For MYR, this is sen (1 MYR = 100 sen)
 * @param amount - Amount in MYR
 * @returns Amount in sen (cents)
 */
export function formatForStripe(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert from Stripe amount back to display currency
 * @param stripeAmount - Amount in sen (cents)
 * @returns Amount in MYR
 */
export function formatFromStripe(stripeAmount: number): number {
  return stripeAmount / 100;
}
