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

    // Get all friends with full user details
    getFriendsList: async () => {
        set({ isLoadingFriends: true });
        try {
            // Step 1: Get friendships from /Friend API
            const friendships = await authAxiosInstance.get(API.FRIEND.GET_ALL_FRIENDS);
            
            if (!Array.isArray(friendships) || friendships.length === 0) {
                set({ friends: [] });
                return [];
            }

            // Step 2: Fetch full user details for each friend
            const friendsWithDetails = await Promise.all(
                friendships.map(async (friendship) => {
                    try {
                        // Get full user data from /User/{id} API
                        const userData = await authAxiosInstance.get(
                            API.USER.GET_USER(friendship.friendUserId)
                        );
                        
                        // Combine friendship data with user data
                        return {
                            // Friend identification
                            friendshipId: friendship.friendshipId,
                            friendUserId: friendship.friendUserId,
                            
                            // Full user details from /User API
                            friendUserName: userData.userName || friendship.friendUserName,
                            friendFullName: userData.fullName || userData.userName,
                            friendAvatarUrl: userData.avatarUrl || friendship.friendAvatarUrl,
                            friendEmail: userData.email,
                            friendBio: userData.bio,
                            friendPhone: userData.phone,
                            
                            // Friendship metadata
                            friendedBy: friendship.friendedBy || 0,
                            createdAt: friendship.createdAt,
                        };
                    } catch (error) {
                        console.warn(`Failed to fetch details for friend ${friendship.friendUserId}:`, error);
                        // Fallback to basic data if user API fails
                        return {
                            friendshipId: friendship.friendshipId,
                            friendUserId: friendship.friendUserId,
                            friendUserName: friendship.friendUserName,
                            friendFullName: friendship.friendUserName,
                            friendAvatarUrl: friendship.friendAvatarUrl,
                            friendEmail: null,
                            friendBio: null,
                            friendPhone: null,
                            friendedBy: friendship.friendedBy || 0,
                            createdAt: friendship.createdAt,
                        };
                    }
                })
            );

            set({ friends: friendsWithDetails });
            return friendsWithDetails;
        } catch (error) {
            console.error("Error fetching friends list:", error);
            toast.error(error?.error || "Error fetching friends list");
            set({ friends: [] });
            return [];
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
            toast.error(error?.error || "Error sending friend request");
            throw error;
        }
    },

    // Get specific friend request
    getFriendRequest: async (requestId) => {
        try {
            const res = await authAxiosInstance.get(API.FRIEND.GET_REQUEST(requestId));
            return res;
        } catch (error) {
            toast.error(error?.error || "Error fetching friend request");
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
            toast.error(error?.error || "Error deleting friend request");
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
            toast.error(error?.error || "Error accepting friend request");
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
            toast.error(error?.error || "Error fetching received requests");
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
            toast.error(error?.error || "Error fetching sent requests");
            throw error;
        } finally {
            set({ isLoadingRequests: false });
        }
    }
}));
