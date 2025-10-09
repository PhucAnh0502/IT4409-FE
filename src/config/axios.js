import axios from "axios";
import {toast} from "react-hot-toast";

// ===== Instance cho Backend API =====
const beInstance = axios.create({
  baseURL: "BE_API_URL", 
});

beInstance.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer token`;
    return config;
  },
  (error) => Promise.reject(error)
);

beInstance.interceptors.response.use(
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