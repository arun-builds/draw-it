import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

const SOCKET_URL = "ws://localhost:8080";

// Types matching server message types
interface ServerMessage {
    type: string;
    userId?: string;
    roomId?: string;
    message?: string;
    users?: string[];
    payload?: DrawPayload;
}

export interface DrawPayload {
    from: { x: number; y: number };
    to: { x: number; y: number };
    color: string;
    size: number;
}

interface SocketContextType {
    isConnected: boolean;
    userId: string | null;
    roomId: string | null;
    players: string[];
    error: string | null;
    createRoom: () => void;
    joinRoom: (roomId: string) => void;
    leaveRoom: () => void;
    sendDraw: (payload: DrawPayload) => void;
    onDraw: (callback: (data: DrawPayload, userId: string) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [players, setPlayers] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    // Use ref for socket to avoid stale closures in callbacks
    const socketRef = useRef<WebSocket | null>(null);
    // Use ref for draw callbacks to avoid re-renders
    const drawCallbacksRef = useRef<Set<(data: DrawPayload, userId: string) => void>>(new Set());

    useEffect(() => {
        // Track if this effect instance is still active (handles StrictMode double-mount)
        let isActive = true;
        
        const ws = new WebSocket(SOCKET_URL);
        socketRef.current = ws;

        ws.onopen = () => {
            if (!isActive) return;
            console.log("Connected to server");
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            if (!isActive) return;
            const data: ServerMessage = JSON.parse(event.data);
            console.log("Message from server:", data);

            switch (data.type) {
                case "connected":
                    setUserId(data.userId || null);
                    setError(null);
                    break;

                case "room_created":
                    setRoomId(data.roomId || null);
                    setPlayers(data.userId ? [data.userId] : []);
                    setError(null);
                    break;

                case "room_joined":
                    setRoomId(data.roomId || null);
                    setError(null);
                    // Request room users after joining
                    ws.send(JSON.stringify({ type: "get_room_users", roomId: data.roomId }));
                    break;

                case "room_left":
                    setRoomId(null);
                    setPlayers([]);
                    setError(null);
                    break;

                case "user_joined":
                    if (data.userId) {
                        setPlayers(prev => [...prev, data.userId!]);
                    }
                    break;

                case "user_left":
                    if (data.userId) {
                        setPlayers(prev => prev.filter(id => id !== data.userId));
                    }
                    break;

                case "room_users":
                    setPlayers(data.users || []);
                    break;

                case "draw":
                    if (data.payload && data.userId) {
                        drawCallbacksRef.current.forEach(cb => cb(data.payload!, data.userId!));
                    }
                    break;

                case "error":
                    setError(data.message || "Unknown error");
                    break;

                default:
                    console.log("Unknown message type:", data.type);
            }
        };

        ws.onclose = () => {
            // Only update state if this is still the active socket
            if (!isActive) return;
            console.log("Disconnected from server");
            setIsConnected(false);
            socketRef.current = null;
            setUserId(null);
            setRoomId(null);
            setPlayers([]);
        };

        ws.onerror = (event) => {
            if (!isActive) return;
            console.log("WebSocket error:", event);
            setError("Connection error");
        };

        return () => {
            isActive = false;
            ws.close();
        };
    }, []);

    const createRoom = useCallback(() => {
        const ws = socketRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            console.log("Sending create_room message");
            ws.send(JSON.stringify({ type: "create_room" }));
        } else {
            console.log("Socket not ready, state:", ws?.readyState);
        }
    }, []);

    const joinRoom = useCallback((targetRoomId: string) => {
        const ws = socketRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "join_room", roomId: targetRoomId }));
        }
    }, []);

    const leaveRoom = useCallback(() => {
        const ws = socketRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "leave_room" }));
        }
    }, []);

    const sendDraw = useCallback((payload: DrawPayload) => {
        const ws = socketRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "draw", payload }));
        }
    }, []);

    const onDraw = useCallback((callback: (data: DrawPayload, userId: string) => void) => {
        drawCallbacksRef.current.add(callback);
        return () => {
            drawCallbacksRef.current.delete(callback);
        };
    }, []);

    const value: SocketContextType = {
        isConnected,
        userId,
        roomId,
        players,
        error,
        createRoom,
        joinRoom,
        leaveRoom,
        sendDraw,
        onDraw,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocketContext must be used within a SocketProvider");
    }
    return context;
};
