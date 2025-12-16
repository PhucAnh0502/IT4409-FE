export const API = {
    AUTH: {
        LOGIN: '/Auth/login',
        REGISTER: '/Auth/register',
        FORGOT_PASSWORD: '/Auth/reset-password-mail',
        RESET_PASSWORD: '/Auth/reset-password',
        CHANGE_PASSWORD: '/Auth/change-password',
    },
    USER: {
        ALL_USER: '/User',
        CREATE_USER: '/User',
        GET_USER: (userId) => `/User/${userId}`,
        UPDATE_USER: (userId) => `/User/${userId}`,
        DELETE_USER: (userId) => `/User/${userId}`,
    },
    MEDIA: {
        UPLOAD_MEDIA: '/Media/upload',
    },
    CONVERSATION: {
        ALL_CONVERSATIONS: '/Conversation',
        CREATE_CONVERSATION: '/Conversation',
        CREATE_GROUP: '/Conversation/group',
        ADD_MEMBER_TO_GROUP: (conversationId) => `/Conversation/${conversationId}/members`,
        LEAVE_GROUP: (conversationId) => `/Conversation/${conversationId}/leave`,
        KICK_MEMBER: (conversationId) => `/Conversation/${conversationId}/kick`,
        UPDATE_GROUP_INFO: (conversationId) => `/Conversation/${conversationId}/group/name`,
        UPDATE_GROUP_AVATAR: (conversationId) => `/Conversation/${conversationId}/group/avatar`,
        MARK_AS_READ: (conversationId) => `/Conversation/${conversationId}/read`,
    },
    MESSAGE: {
        ALL_MESSAGES: (conversationId) => `/Messages/${conversationId}`,
        SEND_MESSAGE: '/Messages',
    },
    FRIEND: {
        SEND_REQUEST: '/Friend/requests',
        GET_REQUEST: (id) => `/Friend/requests/${id}`,
        DELETE_REQUEST: (id) => `/Friend/requests/${id}`,
        ACCEPT_REQUEST: (id) => `/Friend/requests/${id}/accept`,
        GET_ALL_FRIENDS: '/Friend',
        GET_RECEIVED_REQUESTS: '/Friend/requests/received',
        GET_SENT_REQUESTS: '/Friend/requests/sent',
    }
}