import { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { getToken } from "../lib/utils";

const useSignalR = (hubUrl) => {
    const [connection, setConnection] = useState(null);
    const connectionRef = useRef(null);
    const authToken = getToken();

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => authToken,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();
        
        connectionRef.current = newConnection;
        setConnection(newConnection);

        const startConnection = async () => {
            try {
                await newConnection.start();
                console.log("SignalR Connected.");  
            } catch (error) {
                console.error("SignalR Connection Error: ", error);
            }
        }

        startConnection();

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop().then(() => console.log("SignalR Disconnected."));
            }
        }
    }, [hubUrl, authToken]);

    return connection;
}

export default useSignalR;