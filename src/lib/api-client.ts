import axios from 'axios'
import { useUserConfig } from '#/store/user-config'

/** User's timezone offset in hours (e.g. 5 for UTC+5). */
export const Timezone = new Date().getTimezoneOffset() / -60

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    Timezone: String(Timezone),
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const errorCode = error.response?.data?.error ?? error.response?.data ?? ''

    if (errorCode === 'incorrect_api_key_error') {
      useUserConfig.getState().setSelectedAccount(null)
    }

    return Promise.reject(error)
  },
)
