export function formatZAR(amount: number): string {
  return `R ${Math.round(amount).toLocaleString("en-US").replace(/,/g, " ")}`;
}
