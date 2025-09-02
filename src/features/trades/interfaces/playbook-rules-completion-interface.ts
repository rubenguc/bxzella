export interface PlaybookRuleCompletion {
  name: string;
  completionPercentage: number;
}

export interface PlaybookRulesGroupCompletion {
  name: string;
  rules: PlaybookRuleCompletion[];
}

export interface PlaybookRulesCompletionResponse {
  rulesGroupCompletion: PlaybookRulesGroupCompletion[];
}