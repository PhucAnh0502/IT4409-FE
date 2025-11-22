import { create } from "zustand";
import { authAxiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { API } from "../lib/api.js";

export const useFriendStore = create((set) => ({
    friends: [],
    isLoadingFriends: false,
    isAddingFriend: false,
    isRemovingFriend: false,    

    // Get user friends
    getUserFriends: async (userId) => {
        set({ isLoadingFriends: true });
        try {
            const res = await authAxiosInstance.get(API.FRIEND.GET_ALL_FRIENDS);
            
            // Get full user details for each friend to get real avatarUrl from database
            const friendsWithDetails = await Promise.all(
                (Array.isArray(res) ? res : []).map(async (friend) => {
                    try {
                        // Fetch full user data for this friend
                        const friendUserId = friend.friendUserId;
                        const friendUserData = await authAxiosInstance.get(API.USER.GET_USER(friendUserId));
                        
                        
                        return {
                            id: friendUserId,
                            userName: friendUserData.userName || friend.friendUserName,
                            fullName: friendUserData.fullName || friend.friendUserName,
                            avatarUrl: friendUserData.avatarUrl, // Real avatarUrl from database
                            friendshipId: friend.friendshipId,
                            friendedBy: friendUserData.friendedBy || 0 // Mutual friends count
                        };
                    } catch (error) {
                        console.error("Failed to fetch friend details:", error);
                        // Fallback to basic info if user fetch fails
                        return {
                            id: friend.friendUserId,
                            userName: friend.friendUserName,
                            fullName: friend.friendUserName,
                            avatarUrl: null,
                            friendshipId: friend.friendshipId,
                            friendedBy: 0
                        };
                    }
                })
            );
            
            set({ friends: friendsWithDetails });
            return friendsWithDetails;
        } catch (error) {
            toast.error(error?.message || "Error fetching friends list");
            set({ friends: [] });
            throw error;
        } finally {
            set({ isLoadingFriends: false });
        }
    }
}));
