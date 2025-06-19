import CryptoJS from "crypto-js";
import axios from "axios";

const VST_HOST = process.env.VST_HOST;
const USDT_HOST = process.env.USDT_HOST;

type Coin = "VST" | "USDT";

function getParameters(
  payload: Record<string, string | number>,
  timestamp: number,
  urlEncode?: boolean,
) {
  let parameters = "";
  for (const key in payload) {
    if (urlEncode) {
      parameters += key + "=" + encodeURIComponent(payload[key]) + "&";
    } else {
      parameters += key + "=" + payload[key] + "&";
    }
  }
  if (parameters) {
    parameters = parameters.substring(0, parameters.length - 1);
    parameters = parameters + "&timestamp=" + timestamp;
  } else {
    parameters = "timestamp=" + timestamp;
  }
  return parameters;
}

export async function makeRequest({
  coin,
  apiKey,
  path,
  secretKey,
  payload = {},
}: {
  coin: Coin;
  path: string;
  apiKey: string;
  secretKey: string;
  payload?: Record<string, string | number>;
}): Promise<unknown> {
  const timestamp = new Date().getTime();
  const sign = CryptoJS.enc.Hex.stringify(
    CryptoJS.HmacSHA256(getParameters(payload, timestamp), secretKey),
  );

  const host = coin === "VST" ? VST_HOST : USDT_HOST;

  const url = `https://${host}${path}?${getParameters(payload, timestamp, true)}&signature=${sign}`;

  const config = {
    method: "GET",
    url: url,
    headers: {
      "X-BX-APIKEY": apiKey,
    },
  };

  const response = await axios(config);

  const isIncorrectApiKeyError = response.data?.code === 100413;

  if (isIncorrectApiKeyError) throw new Error("incorrect_api_key_error");

  return response.data;
}
