import crypto from "node:crypto";
import axios from "axios";

const BITUNIX_HOST = process.env.BITUNIX_HOST;

function getNonce() {
  return crypto.randomBytes(16).toString("hex");
}

function getTimestamp() {
  return Date.now().toString();
}

function sortParams(params: Record<string, string | number>) {
  if (!params || Object.keys(params).length === 0) {
    return "";
  }

  return Object.keys(params)
    .sort()
    .map((key) => key + params[key])
    .join("");
}

function generateSignature(
  apiKey = "",
  secretKey = "",
  nonce = "",
  timestamp = "",
  queryParams = {},
  body = "",
) {
  const digestInput = nonce + timestamp + apiKey + queryParams + body;
  const digest = crypto.createHash("sha256").update(digestInput).digest("hex");
  const signInput = digest + secretKey;
  return crypto.createHash("sha256").update(signInput).digest("hex");
}

function getAuthHeaders(
  apiKey = "",
  secretKey = "",
  queryParams = {},
  body = "",
) {
  const nonce = getNonce();
  const timestamp = getTimestamp();
  const queryParamsStr = sortParams(queryParams);

  const sign = generateSignature(
    apiKey,
    secretKey,
    nonce,
    timestamp,
    queryParamsStr,
    body,
  );

  return {
    "api-key": apiKey,
    sign: sign,
    nonce: nonce,
    timestamp: timestamp,
  };
}

export async function makeRequest({
  apiKey,
  path,
  secretKey,
  params = {},
}: {
  path: string;
  apiKey: string;
  secretKey: string;
  params?: Record<string, string | number>;
}): Promise<any> {
  const headers = getAuthHeaders(apiKey, secretKey, params);

  const url = `${BITUNIX_HOST}${path}`;

  const config = {
    method: "GET",
    url,
    params: Object.keys(params).length === 0 ? undefined : params,
    headers: {
      language: "en-US",
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers,
    },
  };

  const response = await axios(config);

  return response.data;
}
