export function checkWin(amount: string) {
  return !amount.includes("-");
}

export function checkLongPosition(positionSide: string) {
  return positionSide === "LONG";
}

export function transformSymbol(symbol: string) {
  return symbol.split("-")?.[0] || "";
}
