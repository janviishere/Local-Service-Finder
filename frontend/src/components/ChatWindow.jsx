import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Send, User, Loader2 } from 'lucide-react';

export default function ChatWindow({ bookingId, providerId, customerId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // The "other person" in the chat depends on our role
  const receiverId = user?.role === 'customer' ? providerId : customerId;

  useEffect(() => {
    // 1. Fetch chat history via REST
    const fetchHistory = async () => {
      try {
        const data = await api.get(`/chat/${bookingId}`);
        setMessages(data);
      } catch (err) {
        console.error('Failed to load chat history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    // 2. Setup Socket.io connection
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socketRef.current.emit('join_booking', bookingId);

    // 3. Listen for new messages
    socketRef.current.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current.emit('leave_booking', bookingId);
      socketRef.current.disconnect();
    };
  }, [bookingId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Send via socket.io (server will save to DB and broadcast)
    socketRef.current.emit('send_message', {
      bookingId,
      senderId: user.id,
      receiverId: receiverId,
      message: newMessage,
    });

    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl h-64 border border-slate-100 dark:border-slate-800">
        <Loader2 className="animate-spin text-royal-blue" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700 h-[400px] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <h3 className="font-bold text-sm">
          Chat with {user.role === 'customer' ? 'Provider' : 'Customer'}
        </h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Send a message to start the conversation!
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === user.id;
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? 'bg-royal-blue text-white rounded-br-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-royal-blue outline-none text-sm transition-all"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-3 bg-royal-blue text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-royal-blue transition-colors flex items-center justify-center"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
