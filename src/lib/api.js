export const API = {
    AUTH: {
        LOGIN: '/Auth/login',
        REGISTER: '/Auth/register',
    },
    USER: {
        ALL_USER: '/User',
        CREATE_USER: '/User',
        GET_USER: (userId) => `/User/${userId}`,
        UPDATE_USER: (userId) => `/User/${userId}`,
        DELETE_USER: (userId) => `/User/${userId}`,
    }
}