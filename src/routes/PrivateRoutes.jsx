import React from 'react'
import { useAuthStore } from '../stores/useAuthStore.js'
import { Navigate } from 'react-router';

const PrivateRoutes = ({children}) => {
    const {authUser} = useAuthStore();

    if(!authUser){
        return <Navigate to="/login" />
    }

    return children;
}

export default PrivateRoutes