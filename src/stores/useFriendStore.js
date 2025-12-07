import { create } from "zustand";
import { authAxiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { API } from "../lib/api.js";

export const useFriendStore = create((set) => ({
    friends: [],
    isLoadingFriends: false,
    receivedRequests: [],
    sentRequests: [],
    isLoadingRequests: false,

    // Get all friends
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
    },

    // Send friend request
    sendFriendRequest: async (userId, message = "Hi, let's be friends!") => {
        try {
            const res = await authAxiosInstance.post(API.FRIEND.SEND_REQUEST, {
                receiverId: userId,
                message: message
            });
            toast.success(res?.message || "Friend request sent successfully");
            return res;
        } catch (error) {
            toast.error(error?.message || "Error sending friend request");
            throw error;
        }
    },

    // Get specific friend request
    getFriendRequest: async (requestId) => {
        try {
            const res = await authAxiosInstance.get(API.FRIEND.GET_REQUEST(requestId));
            return res;
        } catch (error) {
            toast.error(error?.message || "Error fetching friend request");
            throw error;
        }
    },

    // Delete/Cancel friend request
    deleteFriendRequest: async (requestId) => {
        try {
            const res = await authAxiosInstance.delete(API.FRIEND.DELETE_REQUEST(requestId));
            toast.success(res?.message || "Friend request cancelled");
            return res;
        } catch (error) {
            toast.error(error?.message || "Error deleting friend request");
            throw error;
        }
    },

    // Accept friend request
    acceptFriendRequest: async (requestId) => {
        try {
            const res = await authAxiosInstance.post(API.FRIEND.ACCEPT_REQUEST(requestId));
            toast.success("Friend request accepted");
            return res;
        } catch (error) {
            toast.error(error?.message || "Error accepting friend request");
            throw error;
        }
    },

    // Get received friend requests
    getReceivedRequests: async () => {
        set({ isLoadingRequests: true });
        try {
            const res = await authAxiosInstance.get(API.FRIEND.GET_RECEIVED_REQUESTS);
            set({ receivedRequests: res });
            return res;
        } catch (error) {
            toast.error(error?.message || "Error fetching received requests");
            throw error;
        } finally {
            set({ isLoadingRequests: false });
        }
    },

    // Get sent friend requests
    getSentRequests: async () => {
        set({ isLoadingRequests: true });
        try {
            const res = await authAxiosInstance.get(API.FRIEND.GET_SENT_REQUESTS);
            set({ sentRequests: res });
            return res;
        } catch (error) {
            toast.error(error?.message || "Error fetching sent requests");
            throw error;
        } finally {
            set({ isLoadingRequests: false });
        }
    }
}));
