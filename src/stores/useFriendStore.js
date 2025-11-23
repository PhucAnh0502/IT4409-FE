import { create } from "zustand";
import { authAxiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { API } from "../lib/api.js";

export const useFriendStore = create((set) => ({
    friends: [],
    isLoadingFriends: false,

    getFriendsList: async () => {
        set({ isLoadingFriends: true });
        try {
            const res = await authAxiosInstance.get(API.FRIEND.GET_ALL_FRIENDS);
            set({ friends: res });
            return res;
        } catch (error) {
            toast.error(error?.message || "Error fetching friends list");
            throw error;
        } finally {
            set({ isLoadingFriends: false });
        }
    }
}));
