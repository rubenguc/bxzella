import type { Types } from "mongoose";

export interface PlaybookTradeProgress {
  tradeId: Types.ObjectId | string;
  playbookId: Types.ObjectId | string;
  rulesProgress: {
    groupName: string;
    rules: {
      name: string;
      isCompleted: boolean;
    }[];
  }[];
}

export type PlaybookTradeProgressDocument = PlaybookTradeProgress & {
  _id: string;
};

export interface UpdatePlaybookTradeProgressProps {
  tradeId: string;
  playbookId: string | null;
  rulesProgress: {
    groupName: string;
    rules: {
      name: string;
      isCompleted: boolean;
    }[];
  }[];
}
