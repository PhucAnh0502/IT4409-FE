import { create } from "zustand";
import { publicAxiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { API } from "../lib/api.js";
import { setToken } from "../lib/utils.js";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await publicAxiosInstance.post(API.AUTH.LOGIN, data);
            setToken(res.token);
            //set({ authUser: res });
            toast.success("Logged in successfully");
        } catch (error) {
            toast.error(error?.message || "Error in login");
        } finally {
            set({ isLoggingIn: false });
        }
    },
    signUp: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await publicAxiosInstance.post(API.AUTH.REGISTER, data);
            console.log(res);
            toast.success("Signed up successfully");
        } catch (error) {
            toast.error(error?.message || "Error in sign up");
        } finally {
            set({ isSigningUp: false });
        }
    }
}))