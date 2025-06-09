import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.ENCRYPTION_SECRET!;

export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decryptData = (data: string): string => {
  const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
