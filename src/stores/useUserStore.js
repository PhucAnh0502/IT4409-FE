import { create } from "zustand";
import { authAxiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { API } from "../lib/api.js";

export const useUserStore = create((set) => ({
    user: null,
    friends: [],
    isLoadingUser: false,
    isLoadingFriends: false,
    isUpdatingUser: false,

    // Get user by ID
    getUserById: async (userId) => {
        set({ isLoadingUser: true });
        try {
            const res = await authAxiosInstance.get(API.USER.GET_USER(userId));
            set({ user: res });
            return res;
        } catch (error) {
            toast.error(error?.message || "Error fetching user data");
            throw error;
        } finally {
            set({ isLoadingUser: false });
        }
    },

    // Update user
    updateUser: async (userId, data) => {
        set({ isUpdatingUser: true });
        try {
            const res = await authAxiosInstance.put(API.USER.UPDATE_USER(userId), data);
            // Update the user state with the response from API
            set({ user: res });
            toast.success("Profile updated successfully");
            return res;
        } catch (error) {
            toast.error(error?.message || "Error updating profile");
            throw error;
        } finally {
            set({ isUpdatingUser: false });
        }
    },

    // Clear user data
    clearUser: () => set({ user: null, friends: [] }),
}));
