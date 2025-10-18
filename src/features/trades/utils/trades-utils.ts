import type { UserFillOrdersResponse } from "@/features/bingx/bingx-interfaces";

export function getSyncTimeRange(startTime?: number): {
  startTs: number;
  endTs: number;
} {
  let startTs = 0;
  if (startTime) {
    startTs = startTime;
  } else {
    const actualDate = new Date();
    const dateLess30Days = new Date(actualDate);
    dateLess30Days.setDate(dateLess30Days.getDate() - 30);
    startTs = dateLess30Days.getTime();
  }
  const endTs = new Date().getTime();

  return { startTs, endTs };
}

export function processFilledOrders(
  filledOrdersResult: UserFillOrdersResponse,
): string[] {
  if (
    !filledOrdersResult?.data?.fill_orders ||
    filledOrdersResult.data.fill_orders.length === 0
  ) {
    console.log("No filled orders found");
    return [];
  }

  const uniqueSymbols = [
    ...new Set(
      filledOrdersResult.data.fill_orders.map((order) => order.symbol),
    ),
  ];

  return uniqueSymbols;
}
