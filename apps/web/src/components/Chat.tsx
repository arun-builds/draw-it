import { useState, useRef, useEffect } from "react";
import { useSocketContext } from "@/contexts/SocketContext";

interface ChatMessage {
    id: string;
    userId: string;
    message: string;
    timestamp: Date;
}

const Chat = () => {
    const { userId } = useSocketContext();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;
        
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            userId: userId || "unknown",
            message: inputMessage,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMessage]);
        setInputMessage("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="w-72 h-[540px] bg-zinc-800 border border-zinc-700 rounded-lg flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-700 bg-zinc-800/80">
                <h2 className="text-sm font-semibold text-zinc-200">Chat</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 ? (
                    <p className="text-zinc-500 text-sm text-center py-8">
                        No messages yet
                    </p>
                ) : (
                    messages.map((msg) => {
                        const isOwnMessage = msg.userId === userId;
                        return (
                            <div
                                key={msg.id}
                                className="text-sm py-1.5 px-2 rounded"
                            >
                                <span className={`font-medium ${isOwnMessage ? 'text-emerald-400' : 'text-sky-400'}`}>
                                    {isOwnMessage ? 'You' : 'Guest'}:
                                </span>{' '}
                                <span className="text-zinc-300">{msg.message}</span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-zinc-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your guess here..."
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat