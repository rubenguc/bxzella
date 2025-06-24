export function checkWin(amount: string) {
  return !amount.includes("-");
}

export function checkLongPosition(positionSide: string) {
  return positionSide === "LONG";
}

export function transformSymbol(symbol: string) {
  return symbol.split("-")?.[0] || "";
}

export function getResultClass(amount: string | number) {
  const _amount = String(amount);

  if (_amount == "0") return "";

  return checkWin(_amount) ? "text-green-500" : "text-red-500";
}

export function formatSymbolAmount(positionAmt: string) {
  const decimals = positionAmt.split(".")[1]?.length || 0;
  const amt = positionAmt.split(".")[0];

  return Number(amt) / Math.pow(10, decimals);
}

export function getRealPositionAmount({
  positionAmt = "",
  avgPrice = "",
}: {
  positionAmt: string;
  avgPrice: string;
}) {
  const symbolAmount = formatSymbolAmount(positionAmt);
  return symbolAmount * Number(avgPrice);
}
