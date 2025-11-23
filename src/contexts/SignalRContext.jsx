import React, { createContext, useContext } from 'react';

const SignalRContext = createContext(null);

export const SignalRProvider = ({ connection, children }) => {
    return (
        <SignalRContext.Provider value={connection}>
            {children}
        </SignalRContext.Provider>
    );
};

export const useSignalRConnection = () => useContext(SignalRContext);

export default SignalRContext;
