import { useSocketContext } from "@/contexts/SocketContext";

const AVATAR_COLORS = [
    'bg-emerald-500',
    'bg-sky-500', 
    'bg-amber-500',
    'bg-rose-500',
    'bg-violet-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-teal-500',
];

const Players = () => {
    const { players, userId } = useSocketContext();

    return (
<div className="h-full ">
<div className="w-56 mt-20 bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-700 bg-zinc-800/80">
                <h2 className="text-sm font-semibold text-zinc-200">
                    Players ({players.length})
                </h2>
            </div>

            {/* Players list */}
            <div className="max-h-[480px] overflow-y-auto">
                {players.length === 0 ? (
                    <p className="text-zinc-500 text-sm px-4 py-8 text-center">
                        Waiting for players...
                    </p>
                ) : (
                    players.map((playerId, index) => {
                        const isCurrentUser = playerId === userId;
                        return (
                            <div
                                key={playerId}
                                className={`flex items-center gap-3 px-4 py-3 border-b border-zinc-700/50 transition-colors ${
                                    isCurrentUser ? 'bg-emerald-500/10' : 'hover:bg-zinc-700/30'
                                }`}
                            >
                                {/* Rank */}
                                <span className="text-zinc-500 text-xs font-bold w-4">
                                    #{index + 1}
                                </span>
                                
                                {/* Avatar */}
                                <div className={`w-9 h-9 rounded-lg ${AVATAR_COLORS[index % AVATAR_COLORS.length]} flex items-center justify-center shrink-0`}>
                                    <span className="text-white text-xs font-bold">
                                        {playerId.slice(0, 2).toUpperCase()}
                                    </span>
                                </div>

                                {/* Name and points */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-emerald-400' : 'text-zinc-200'}`}>
                                        {isCurrentUser ? 'You' : `Player ${index + 1}`}
                                    </p>
                                    <p className="text-xs text-zinc-500">0 pts</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
        </div>
    );
};

export default Players