export interface PendingPosition {
  positionId: string;
  symbol: string;
  marginCoin: string | null;
  qty: string;
  entryValue: string;
  side: "BUY" | "SELL";
  marginMode: "ISOLATION" | "CROSS";
  positionMode: "HEDGE" | "ONEWAY";
  leverage: number;
  fee: string;
  funding: string;
  realizedPNL: string;
  margin: string;
  unrealizedPNL: string;
  liqPrice: string;
  avgOpenPrice: string;
  marginRate: string;
  ctime: string;
  mtime: string;
}

export interface OpenPositionRespone {
  code: number;
  data: PendingPosition[];
}

export interface HistoryPositionResponse {
  data: {
    code: number;
    total: string;
    positionList: HistoryPosition[];
  };
}

export interface HistoryPosition {
  positionId: string;
  symbol: string;
  marginCoin: string | null;
  maxQty: string;
  qty: string;
  entryPrice: string;
  closePrice: string;
  liqQty: string | null;
  side: "BUY" | "SELL";
  marginMode: "ISOLATION" | "CROSS" | "CROSSED";
  positionMode: "HEDGE" | "ONEWAY";
  leverage: string;
  fee: string;
  funding: string;
  realizedPNL: string;
  margin: string | null;
  liqPrice: string;
  ctime: string;
  mtime: string;
}
