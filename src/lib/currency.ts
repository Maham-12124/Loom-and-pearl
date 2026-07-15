/** Formats an amount as Pakistani Rupees, e.g. formatPKR(2500) -> "Rs. 2,500". */
export function formatPKR(amount: number): string {
  const rounded = Math.round(amount);
  return `Rs. ${rounded.toLocaleString("en-PK")}`;
}
