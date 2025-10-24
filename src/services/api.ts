import axios from "axios";
import { useUserConfigStore } from "@/store/user-config-store";
import { Timezone } from "@/utils/date-utils";

export const baseConfig = axios.create({
  baseURL: "/api",
  headers: {
    Timezone,
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
