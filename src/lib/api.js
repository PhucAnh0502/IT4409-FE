export const API = {
    AUTH: {
        LOGIN: '/Auth/login',
        REGISTER: '/Auth/register',
        FORGOT_PASSWORD: '/User/forgot-password',
        RESET_PASSWORD: '/User/reset-password',
        CHANGE_PASSWORD: '/Auth/change-password',
    },
    USER: {
        ALL_USER: '/User',
        CREATE_USER: '/User',
        GET_USER: (userId) => `/User/${userId}`,
        UPDATE_USER: (userId) => `/User/${userId}`,
        DELETE_USER: (userId) => `/User/${userId}`,
        GET_FRIENDS: (userId) => `/User/${userId}/friends`, // Add friends endpoint
    }
}