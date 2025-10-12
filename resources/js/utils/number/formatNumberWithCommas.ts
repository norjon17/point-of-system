export function formatNumberWithCommas(num: number | undefined): string {
  if (!num) return "0"

  return num.toLocaleString("en-US")
}
