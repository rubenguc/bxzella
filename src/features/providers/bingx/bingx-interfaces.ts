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

export type ActivePosition = {
  currency: string;
  positionAmt: string;
  availableAmt: string;
  positionSide: string;
  isolated: boolean;
  avgPrice: string;
  initialMargin: string;
  margin: string;
  leverage: number;
  unrealizedProfit: string;
  realisedProfit: string;
  liquidationPrice: number;
  pnlRatio: string;
  maxMarginReduction: string;
  riskRate: string;
  markPrice: string;
  positionValue: string;
  onlyOnePosition: boolean;
  createTime: number;
  updateTime: number;
  symbol: string;
};

export type UserPositionResponse = GenericResponse<ActivePosition[]>;

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
