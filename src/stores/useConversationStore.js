import { create } from "zustand";
import { authAxiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { API } from "../lib/api.js";

export const useConversationStore = create((set, get) => ({
    conversations: [],
    messages: [],
    selectedConversation: null,
    isGettingConversations: false,
    isCreatingConversation: false,
    isCreatingGroup: false,
    isUploading: false,
    isUpdatingGroupAvatar: false,
    
    page: 1,
    hasMore: true, 
    isMessagesLoading: false, 
    isLoadingMore: false,
    
    // Upload file API
    uploadFile: async (file) => {
        set({ isUploading: true });
        try {
            const formData = new FormData();
            formData.append("File", file);

            const response = await authAxiosInstance.post(API.MEDIA.UPLOAD_MEDIA, formData,{
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.url;
        } catch (error) {
            toast.error(error?.message || "File upload failed");
            throw error;
        } finally {
            set({ isUploading: false });
        }
    },

    // Conversation APIs
    getConversations: async () => {
        set({ isGettingConversations: true });
        try {
            const response = await authAxiosInstance.get(API.CONVERSATION.ALL_CONVERSATIONS);
            set({ conversations: response });
        } catch (error) {
            toast.error(error?.message);
        } finally {
            set({ isGettingConversations: false });
        }
    },

    createConversation: async (data) => {
        set({ isCreatingConversation: true });
        try {
            const response = await authAxiosInstance.post(API.CONVERSATION.CREATE_CONVERSATION, data);
            set((state) => ({
                conversations: [...state.conversations, response]
            }));
            return response;
        } catch (error) {
            toast.error(error?.message || "Error creating conversation");
            throw error;
        } finally {
            set({ isCreatingConversation: false });
        }
    },

    // Message APIs
    getMessages: async (conversationId) => {
        if (!conversationId) {
            set({ messages: [], isMessagesLoading: false });
            return;
        }
        
        set({ isMessagesLoading: true, messages: [], page: 1, hasMore: true });
        try {
            const response = await authAxiosInstance.get(`${API.MESSAGE.ALL_MESSAGES(conversationId)}?pageNumber=1&pageSize=20`);

            const newMessages = Array.isArray(response) ? response : []; 

            set({ 
                messages: newMessages,
                hasMore: newMessages.length >= 20 
            });
        } catch (error) {
            toast.error(error?.message || "Error in getting messages");
            set({ messages: [] });
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    loadMoreMessages: async (conversationId) => {
        const { page, hasMore, messages } = get();
        if (!hasMore) return;

        set({ isLoadingMore: true });
        try {
            const nextPage = page + 1;
            const response = await authAxiosInstance.get(`${API.MESSAGE.ALL_MESSAGES(conversationId)}?pageNumber=${nextPage}&pageSize=20`);
            const oldMessages = response;

            if (oldMessages.length === 0) {
                set({ hasMore: false });
            } else {
                set({ 
                    messages: [...oldMessages, ...messages], 
                    page: nextPage,
                    hasMore: oldMessages.length >= 20
                });
            }
        } catch (error) {
            toast.error(error?.message || "Failed to load older messages");
        } finally {
            set({ isLoadingMore: false });
        }
    }
,

    appendMessage: (conversationId, message) => {
        if (!message) return;
        
        set((state) => {
            const currentMessages = state.messages || [];
            const messages = state.selectedConversation === conversationId 
                ? [...currentMessages, message] 
                : currentMessages;

            let conversations = state.conversations || [];
            if (!conversationId) return { messages, conversations };
            
            const idx = conversations.findIndex((c) => c?.id === conversationId);
            if (idx !== -1) {
                const conv = { ...conversations[idx] };
                conv.lastMessageContent = message.content;
                conv.lastMessageTime = message.createdAt;
                conv.lastMessageSenderAvatarUrl = message.senderAvatarUrl;
                conv.isRead = false;
                conversations = [conv, ...conversations.slice(0, idx), ...conversations.slice(idx + 1)];
            }

            return { messages, conversations };
        });
    }
,

    sendMessage: async (data) => {
        try {
            const response = await authAxiosInstance.post(API.MESSAGE.SEND_MESSAGE, data);
            console.log(response.message);
        } catch (error) {
            toast.error(error?.message || "Failed to send message");
        }
    }
,

    setSelectedConversation: (conversationId) => {
        set({ selectedConversation: conversationId });
        if (conversationId) {
            const fn = get().getMessages;
            if (typeof fn === 'function') fn(conversationId).catch(() => {});
        }
    },

    // Group management APIs
    createGroup: async (data) => {
        set({ isCreatingGroup: true });
        try {
            const response = await authAxiosInstance.post(API.CONVERSATION.CREATE_GROUP, data);
            
            if (response) {
                set((state) => ({
                    conversations: [response, ...state.conversations]
                }));
                toast.success("Group created successfully");
            }
            return response;
        } catch (error) {
            console.error("Error creating group:", error);
            toast.error(error?.message || "Error creating group");
            throw error;
        } finally {
            set({ isCreatingGroup: false });
        }
    },

    addMemberToGroup: async (data) => {
        try {
            const conversationId = get().selectedConversation;
            const response = await authAxiosInstance.post(API.CONVERSATION.ADD_MEMBER_TO_GROUP(conversationId), data);
            
            set((state) => ({
                conversations: state.conversations.map((conv) => 
                    conv.id === conversationId
                        ? {
                            ...conv,
                            participants: response.participants || conv.participants,
                        }
                        : conv
                ),
            }));
            
            toast.success(response.message || "Member added to group successfully");
        } catch (error) {
            toast.error(error?.message || "Error adding member to group");
        }
    },

    kickMember: async (data) => {
        try {
            const conversationId = get().selectedConversation;
            const response = await authAxiosInstance.post(API.CONVERSATION.KICK_MEMBER(conversationId), data);
            
            set((state) => ({
                conversations: state.conversations.map((conv) => 
                    conv.id === conversationId
                        ? {
                            ...conv,
                            participants: response.participants || conv.participants,
                        }
                        : conv
                ),
            }));
            
            toast.success(response.message || "Member removed from group successfully");
        } catch (error) {
            toast.error(error?.message || "Error removing member from group");
        }
    },

    leaveGroup: async () => {
        try {
            const conversationId = get().selectedConversation;
            const response = await authAxiosInstance.delete(API.CONVERSATION.LEAVE_GROUP(conversationId));
            
            toast.success(response.message || "Left group successfully");
        } catch (error) {
            toast.error(error?.message || "Error leaving group");
        }
    },

    updateGroupInfo: async (data) => {
        try {
            const conversationId = get().selectedConversation;
            const response = await authAxiosInstance.put(API.CONVERSATION.UPDATE_GROUP_INFO(conversationId), data);
            
            set((state) => ({
                conversations: state.conversations.map((conv) => 
                    conv.id === conversationId || conv._id === conversationId
                        ? {
                            ...conv,
                            name: data.newGroupName || conv.name,
                            avatarUrl: response.avatarUrl || conv.avatarUrl,
                        }
                        : conv
                ),
            }));
            
            toast.success(response.message || "Group info updated successfully");
        } catch (error) {
            toast.error(error?.message || "Error updating group info");
        }
    },

    updateGroupAvatar: async (fileOrUrl) => {
        const conversationId = get().selectedConversation;
        if (!conversationId) {
            toast.error("No conversation selected");
            return;
        }

        set({ isUpdatingGroupAvatar: true });
        try {
            let avatar = fileOrUrl;

            if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
                const uploadFile = get().uploadFile;
                if (uploadFile) {
                    avatar = await uploadFile(fileOrUrl);
                }
            }

            const response = await authAxiosInstance.put(
                API.CONVERSATION.UPDATE_GROUP_AVATAR(conversationId),
                { avatar }
            );

            set((state) => ({
                conversations: state.conversations.map((conv) =>
                    conv.id === conversationId || conv._id === conversationId
                        ? { ...conv, avatarUrl: response?.avatarUrl || avatar }
                        : conv
                ),
            }));

            toast.success(response?.message || "Group avatar updated successfully");
        } catch (error) {
            toast.error(error?.message || "Error updating group avatar");
            throw error;
        } finally {
            set({ isUpdatingGroupAvatar: false });
        }
    },

    updateConversationName: (conversationId, newName) => {
        set((state) => ({
            conversations: state.conversations.map((c) => (
                (c?.id === conversationId || c?._id === conversationId)
                    ? { ...c, name: newName }
                    : c
            ))
        }))
    },

    markConversationAsRead: async (conversationId) => {
        if (!conversationId) return;
        try {
            await authAxiosInstance.post(API.CONVERSATION.MARK_AS_READ(conversationId));
            
            set((state) => ({
                conversations: state.conversations.map((c) =>
                    (c.id === conversationId || c._id === conversationId)
                        ? { ...c, isRead: true }
                        : c
                ),
            }));
        } catch (error) {
            console.error("Error marking conversation as read:", error);
        }
    },

    addMembersSocket: (conversationId, newMembers) => { 
        set((state) => {
            const updatedConversations = state.conversations.map((c) => {
                if (c.id === conversationId) {
                    const existingIds = new Set(c.participants.map(p => p.id));
                    const uniqueNewMembers = newMembers.filter(m => !existingIds.has(m.id));

                    return {
                        ...c,
                        participants: [...c.participants, ...uniqueNewMembers]
                    };
                }
                return c;
            });

            return { conversations: updatedConversations };
        });
    },

    removeMemberSocket: (conversationId, kickedMemberId) => {
        set((state) => {
            const updatedConversations = state.conversations.map((c) => {
                if (c.id === conversationId) {
                    return {
                        ...c,
                        participants: c.participants.filter(p => p.id !== kickedMemberId)
                    };
                }
                return c;
            });

            return { conversations: updatedConversations };
        });
    },

    leaveGroupSocket:(conversationId, leftMemberId, newAdminId) => {
        set((state) => {
            const updatedConversations = state.conversations.map((c) => {
                if (c.id === conversationId) {
                    return {
                        ...c,
                        participants: c.participants.filter(p => p.id !== leftMemberId),
                        createdBy: newAdminId,
                    };
                }
                return c;
            });

            return { conversations: updatedConversations };
        });
    } 
}));