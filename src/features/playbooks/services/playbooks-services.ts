import type { PlaybookRulesCompletionResponse } from "@/features/trades/interfaces/playbook-rules-completion-interface";
import type {
  GetPaginatedTradesByPlaybook,
  GetPaginatedTradesByPlaybookReponse,
  GetPlaybookRulesCompletionByPlaybookId,
} from "@/features/trades/interfaces/trades-interfaces";
import { baseConfig } from "@/services/api";
import type {
  GetAllPlaybooksProps,
  GetAllPlaybooksPropsResponse,
  GetTradesStatisticByPlaybookIdProps,
  GetTradesStatisticByPlaybookIdResponse,
  GetTradesStatisticByPlaybookProps,
  GetTradesStatisticByPlaybookResponse,
} from "../interfaces/playbooks-interfaces";

export const getPlaybooks = async (
  params: GetTradesStatisticByPlaybookProps,
): GetTradesStatisticByPlaybookResponse => {
  const response = await baseConfig.get("/playbooks", { params });
  return response.data;
};

export const getAllPlaybooks = async (
  params: Omit<GetAllPlaybooksProps, "userId">,
): GetAllPlaybooksPropsResponse => {
  const response = await baseConfig.get("/playbooks/all", { params });
  return response.data;
};

export const getPlaybook = async (
  params: GetTradesStatisticByPlaybookIdProps,
): GetTradesStatisticByPlaybookIdResponse => {
  const response = await baseConfig.get(`/playbooks/${params.playbookId}`, {
    params,
  });
  return response.data;
};

export const getTradesByPlaybookId = async (
  params: GetPaginatedTradesByPlaybook,
): GetPaginatedTradesByPlaybookReponse => {
  const response = await baseConfig.get(
    `/playbooks/${params.playbookId}/trades`,
    {
      params,
    },
  );
  return response.data;
};

export const getRulesCompletionByPlaybookId = async (
  params: GetPlaybookRulesCompletionByPlaybookId,
): Promise<PlaybookRulesCompletionResponse> => {
  const response = await baseConfig.get(
    `/playbooks/${params.playbookId}/rules-completion`,
    {
      params,
    },
  );
  return response.data;
};
