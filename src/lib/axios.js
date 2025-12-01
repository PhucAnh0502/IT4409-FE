import axios from "axios";
import { toast } from "react-hot-toast";
import { getToken, removeToken } from "./utils";

const baseURL = import.meta.env.VITE_BASE_API_URL;

// ===== 1. Instance CÔNG KHAI (Public) =====
const publicAxiosInstance = axios.create({
  baseURL: baseURL,
});

publicAxiosInstance.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data;
    return response;
  },
  (error) => {
    return Promise.reject(error?.response?.data || error);
  }
);

// ===== 2. Instance CẦN XÁC THỰC (Authenticated) =====
const authAxiosInstance = axios.create({
  baseURL: baseURL,
});

authAxiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if(token){
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);

// Interceptor RESPONSE
authAxiosInstance.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data;
    return response;
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 ||
        error.response.data?.message?.toLowerCase().includes("jwt expired") ||
        error.response.data?.message?.toLowerCase().includes("unauthorized"))
    ) {
      toast.error("Your session has expired. Please log in again.");
      removeToken();
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
    return Promise.reject(error?.response?.data || error);
  }
);

export { publicAxiosInstance, authAxiosInstance };