import { create } from "zustand";
import { publicAxiosInstance, authAxiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { API } from "../lib/api.js";
import { setToken, removeToken } from "../lib/utils.js";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isGettingResetEmail: false,
    isResettingPassword: false,
    isCheckingAuth: true,
    onlineUsers: [],
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await publicAxiosInstance.post(API.AUTH.LOGIN, data);
            setToken(res.token);
            set({ authUser: res });
            toast.success("Logged in successfully");
            return res;
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
    },
    logout: () => {
        try {
            removeToken();
            set({ authUser: null });
            toast.success('Logged out successfully');
            window.location.href = '/login';
        } catch (e) {
            toast.error('Logout failed', e);
        }
    },
    forgotPassword: async (data) => {
        set({ isGettingResetEmail: true });
        try {
            const res = await publicAxiosInstance.post(API.AUTH.FORGOT_PASSWORD, data);
            toast.success(res.message || "Reset email sent successfully");
        } catch (error) {
            toast.error(error?.message || "Error in getting reset email");
        } finally {
            set({ isGettingResetEmail: false });
        }
    },
    resetPassword: async (data) => {
        set({ isResettingPassword: true });
        try {
            const res = await publicAxiosInstance.post(API.AUTH.RESET_PASSWORD, data);
            toast.success(res.message || "Change password successfully");
        } catch (error) {
            toast.error(error?.message || "Error in resetting password");
        } finally {
            set({ isResettingPassword: false });
        }
    },
    changePassword: async (data) => {
        try {
            const payload = {
                id: data.userId,
                oldPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmNewPassword: data.confirmPassword
            };
            const res = await authAxiosInstance.post(API.AUTH.CHANGE_PASSWORD, payload);
            toast.success("Password changed successfully!");
            return res;
        } catch (error) {
            throw error;
        }
    }
}))