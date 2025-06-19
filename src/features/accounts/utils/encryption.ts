import CryptoJS from "crypto-js";
import { Account } from "@/features/accounts/interfaces/accounts-interfaces";

const SECRET_KEY = process.env.ENCRYPTION_SECRET!;

export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decryptData = (data: string): string => {
  const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export function getDecryptedAccountCredentials(account: Account): {
  decriptedApiKey: string;
  decryptedSecretKey: string;
} {
  const { apiKey, secretKey } = account;
  const decriptedApiKey = decryptData(apiKey);
  const decryptedSecretKey = decryptData(secretKey);

  return { decriptedApiKey, decryptedSecretKey };
}
