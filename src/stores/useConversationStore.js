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
    
    page: 1,
    hasMore: true, 
    isMessagesLoading: false, 
    isLoadingMore: false,    

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

    getMessages: async (conversationId) => {
        set({ isMessagesLoading: true, messages: [], page: 1, hasMore: true });
        try {
            const response = await authAxiosInstance.get(`${API.MESSAGE.ALL_MESSAGES(conversationId)}?pageNumber=1&pageSize=20`);

            const newMessages = response; 

            set({ 
                messages: newMessages,
                hasMore: newMessages.length >= 20 
            });
        } catch (error) {
            toast.error(error?.message || "Failed to load messages");
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
        set((state) => {
            const messages = state.selectedConversation === conversationId ? [...state.messages, message] : state.messages;

            let conversations = state.conversations || [];
            const idx = conversations.findIndex((c) => c.id === conversationId);
            if (idx !== -1) {
                const conv = { ...conversations[idx] };
                conv.lastMessageContent = message.content;
                conv.lastMessageTime = message.createdAt;
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
            // load messages for this conversation
            // call getMessages but do not await
            const fn = get().getMessages;
            if (typeof fn === 'function') fn(conversationId).catch(() => {});
        }
    }
}));