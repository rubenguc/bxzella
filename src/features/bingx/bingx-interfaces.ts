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
