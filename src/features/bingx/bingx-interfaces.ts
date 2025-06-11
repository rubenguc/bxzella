export interface GenericResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export type UserBalanceResponse = GenericResponse<
  {
    userId: string;
    asset: string;
    balance: string;
    equity: string;
    unrealizedProfit: string;
    realisedProfit: string;
    availableMargin: string;
    usedMargin: string;
    freezedMargin: string;
    shortUid: string;
  }[]
>;

export type UserPositionResponse = GenericResponse<
  {
    symbol: string;
    positionId: string;
    positionSide: string;
    isolated: boolean;
    positionAmt: string;
    availableAmt: string;
    unrealizedProfit: string;
    realisedProfit: string;
    initialMargin: string;
    margin: string;
    avgPrice: string;
    liquidationPrice: number;
    leverage: number;
    positionValue: string;
    markPrice: string;
    riskRate: string;
    maxMarginReduction: string;
    pnlRatio: string;
    updateTime: number;
  }[]
>;

export type UserFillOrdersResponse = GenericResponse<{
  fill_orders: {
    filledTm: string;
    volume: string;
    price: string;
    amount: string;
    commission: string;
    currency: string;
    orderId: string;
    liquidatedPrice: string;
    liquidatedMarginRatio: string;
    filledTime: string;
    clientOrderId: string;
    symbol: string;
  }[];
}>;

export type UserPositionHistoryResponse = GenericResponse<{
  positionHistory: {
    positionId: string;
    symbol: string;
    isolated: boolean;
    positionSide: string;
    openTime: number;
    updateTime: number;
    avgPrice: string;
    avgClosePrice: string;
    realisedProfit: string;
    netProfit: string;
    positionAmt: string;
    closePositionAmt: string;
    leverage: number;
    closeAllPositions: boolean;
    positionCommission: string;
    totalFunding: string;
  }[];
}>;
