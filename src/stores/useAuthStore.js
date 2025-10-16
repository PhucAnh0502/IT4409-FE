import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { API } from "../lib/api.js";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    token: sessionStorage.getItem("token") || null,
    setToken: (token) => {
        sessionStorage.setItem("token", token);
    },
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post(API.AUTH.LOGIN, data);
            set({ authUser: res });
            toast.success("Logged in successfully");
        } catch (error) {
            toast.error(error?.message || "Error in login");
        } finally {
            set({ isLoggingIn: false });
        }
    },
}))
