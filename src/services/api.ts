import axios from "axios";
import { useUserConfigStore } from "@/store/user-config-store";

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
      useUserConfigStore.getState().setSelectedAccount(null);
    }

    return Promise.reject(error);
  },
);
