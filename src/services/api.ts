import { useUserConfigStore } from "@/store/user-config-store";
import axios from "axios";

export const baseConfig = axios.create({
  baseURL: "/api",
  headers: {
    TIMEZONE: new Date().getTimezoneOffset() / -60,
  },
});

baseConfig.interceptors.response.use(
  (response) => response,
  async (error) => {
    const errorCode = error.response?.data || "";

    if (errorCode === "incorrect_api_key_error") {
      useUserConfigStore.getState().setSelectedAccountId("");
    }

    return Promise.reject(error);
  },
);
