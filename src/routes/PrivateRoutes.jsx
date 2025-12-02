import React from 'react'
import { useAuthStore } from '../stores/useAuthStore.js'
import { Navigate } from 'react-router';
import { getToken } from '../lib/utils.js';

const PrivateRoutes = ({children}) => {
    const {authUser, accessToken} = useAuthStore();

    // Check token from storage first (survives reload), then check authUser
    const token = accessToken || getToken();
    
    if(!token){
        return <Navigate to="/login" />
    }

    return children;
}

export default PrivateRoutes