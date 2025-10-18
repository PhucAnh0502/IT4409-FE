import axios from "axios";
import {toast} from "react-hot-toast";
import { getToken } from "./utils";

// ===== Instance cho Backend API =====
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL, 
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken()

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data;
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 ||
        error.response.data?.message?.toLowerCase().includes("jwt expired") ||
        error.response.data?.message?.toLowerCase().includes("unauthorized"))
    ) {
      toast.error("Your session has expired. Please log in again.");
      sessionStorage.clear();
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
    return Promise.reject(error?.response?.data || error);
  }
);

export { axiosInstance };