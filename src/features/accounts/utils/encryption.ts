import CryptoJS from "crypto-js";
import { IAccountModel } from "../model/accounts";

const SECRET_KEY = process.env.ENCRYPTION_SECRET!;

export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decryptData = (data: string): string => {
  const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export function getDecryptedAccountCredentials(account: IAccountModel): {
  decriptedApiKey: string;
  decryptedSecretKey: string;
} {
  const { apiKey, secretKey } = account;
  const decriptedApiKey = decryptData(apiKey);
  const decryptedSecretKey = decryptData(secretKey);

  return { decriptedApiKey, decryptedSecretKey };
}
