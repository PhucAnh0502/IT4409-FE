import { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { getToken } from "../lib/utils";

const useSignalR = (hubUrl) => {
    const [connection, setConnection] = useState(null);
    const connectionRef = useRef(null);
    const retryCountRef = useRef(0);
    const maxRetries = 3;
    const authToken = getToken();

    useEffect(() => {
        // Không kết nối nếu không có token hoặc URL
        if (!authToken || !hubUrl) {
            
            return;
        }

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => authToken, // Sử dụng token từ storage
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    // Exponential backoff: 2s, 4s, 8s, 16s, max 30s
                    return Math.min(2000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                }
            })
            .configureLogging(signalR.LogLevel.Warning) // Giảm log xuống Warning
            .build();
        
        // Handle reconnection events
        newConnection.onreconnecting((error) => {
            console.warn("SignalR reconnecting:", error?.message);
        });

        newConnection.onreconnected(() => {
            
            retryCountRef.current = 0;
        });

        newConnection.onclose((error) => {
            console.warn("SignalR closed:", error?.message);
        });
        
        connectionRef.current = newConnection;
        setConnection(newConnection);

        const startConnection = async () => {
            if (retryCountRef.current >= maxRetries) {
                
                return;
            }

            try {
                await newConnection.start();
                
                retryCountRef.current = 0;
            } catch (error) {
                console.warn("SignalR Connection failed:", error?.message);
                retryCountRef.current++;
                
                // Retry after delay if not at max retries
                if (retryCountRef.current < maxRetries) {
                    const delay = 2000 * Math.pow(2, retryCountRef.current);
                    
                    setTimeout(startConnection, delay);
                }
            }
        }

        startConnection();

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop()
                    .then(() => {})
                    .catch((err) => console.warn("SignalR disconnect error:", err?.message));
            }
        }
    }, [hubUrl, authToken]); // Re-run khi token thay đổi

    return connection;
}

export default useSignalR;