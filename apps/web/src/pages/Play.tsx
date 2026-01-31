import Chat from "@/components/Chat"
import Players from "@/components/Players"
import Whiteboard from "@/components/Whiteboard"
import { SocketProvider, useSocketContext } from "@/contexts/SocketContext"
import { useState } from "react"

const Lobby = () => {
    const { isConnected, userId, createRoom, joinRoom, error } = useSocketContext();
    const [joinRoomId, setJoinRoomId] = useState("");

    if (!isConnected) {
        return (
            <div className="h-screen w-full flex justify-center items-center bg-zinc-900">
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8">
                    <h2 className="text-xl font-semibold text-center mb-4 text-white">Connecting...</h2>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-600 border-t-emerald-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex justify-center items-center bg-zinc-900">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 w-[400px]">
                <h1 className="text-3xl font-bold text-center mb-1 text-white">Draw It!</h1>
                <p className="text-zinc-400 text-center text-sm mb-8">Draw and guess with friends</p>

                <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
                    <span className="text-zinc-500 text-sm">Your ID</span>
                    <span className="font-mono text-sm text-zinc-300">{userId?.slice(0, 12)}...</span>
                </div>
                
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={createRoom}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        Create New Room
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-zinc-700"></div>
                        <span className="text-zinc-500 text-sm">or join</span>
                        <div className="flex-1 h-px bg-zinc-700"></div>
                    </div>

                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Enter Room ID"
                            value={joinRoomId}
                            onChange={(e) => setJoinRoomId(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono text-sm"
                        />
                        <button
                            onClick={() => joinRoom(joinRoomId)}
                            disabled={!joinRoomId.trim()}
                            className="w-full bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                        >
                            Join Room
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GameRoom = () => {
    const { roomId, leaveRoom } = useSocketContext();

    return (
        <div className="h-screen w-full flex flex-col bg-zinc-900">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-3 bg-zinc-800 border-b border-zinc-700">
                <div className="flex items-center gap-3">
                    <span className="text-zinc-400 text-sm">Room</span>
                    <code className="bg-zinc-900 border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded text-sm font-mono">
                        {roomId}
                    </code>
                    <button
                        onClick={() => navigator.clipboard.writeText(roomId || '')}
                        className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
                    >
                        Copy
                    </button>
                </div>
                <button
                    onClick={leaveRoom}
                    className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                >
                    Leave Room
                </button>
            </div>

            {/* Game area */}
            <div className="flex-1 flex items-center justify-center gap-3 p-6 overflow-auto">
                <Players />
                <Whiteboard />
                <Chat />
            </div>
        </div>
    );
};

const PlayContent = () => {
    const { roomId } = useSocketContext();

    if (!roomId) {
        return <Lobby />;
    }

    return <GameRoom />;
};

export const Play = () => {
    return (
        <SocketProvider>
            <PlayContent />
        </SocketProvider>
    );
}