import { create } from "zustand";
import { publicAxiosInstance, authAxiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { API } from "../lib/api.js";
import { setToken, removeToken, getToken } from "../lib/utils.js";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isGettingResetEmail: false,
    isResettingPassword: false,
    isChangingPassword: false,
    isCheckingAuth: true,
    onlineUsers: [],
    accessToken: getToken(),
    
    // Khôi phục auth state từ token khi reload
    initializeAuth: () => {
        const token = getToken();
        if (token) {
            // Nếu có token, set authUser với token (minimal state)
            set({ 
                authUser: { token }, // Minimal auth state
                accessToken: token 
            });
        }
    },
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await publicAxiosInstance.post(API.AUTH.LOGIN, data);
            const token = res.token;
            if(token){
                setToken(token);
            } else {
                throw new Error("No token received");
            }
            set({ 
                authUser: res,
                accessToken: token || getToken(),
            });
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
            set({ authUser: null, accessToken: null });
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
        set({ isChangingPassword: true });
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
            toast.error(error?.message || "Error in changing password");
        } finally {
            set({ isChangingPassword: false });
        }
    }
}))