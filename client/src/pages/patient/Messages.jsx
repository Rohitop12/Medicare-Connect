import React, { useState, useEffect, useContext, useRef } from 'react';
import axiosInstance from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { Send, Search, Image as ImageIcon, Paperclip, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
    }
  }, [activeChat]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message) => {
        if (activeChat && (message.senderId === activeChat._id || message.receiverId === activeChat._id)) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
        // Update conversation list latest message logic could go here
      });
    }
    return () => {
      if (socket) socket.off('receive_message');
    };
  }, [socket, activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      let fetchedConversations = [];
      if (user.role === 'patient') {
        const { data } = await axiosInstance.get('/users/doctors');
        fetchedConversations = data.filter(u => u._id !== user._id);
      } else {
        const { data } = await axiosInstance.get('/chat/conversations');
        // Map the conversations to just the contact object
        fetchedConversations = data.map(conv => conv.contact).filter(c => c && c._id !== user._id);
      }
      
      setConversations(fetchedConversations);
      if(fetchedConversations.length > 0) setActiveChat(fetchedConversations[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const { data } = await axiosInstance.get(`/chat/messages/${otherUserId}`);
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const msgData = {
        receiverId: activeChat._id,
        message: newMessage
      };
      const { data } = await axiosInstance.post('/chat/messages', msgData);
      
      if (socket) {
        socket.emit('send_message', data);
      }
      
      setMessages([...messages, data]);
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading chat...</div>;

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-3xl border border-gray-100 shadow-sm flex overflow-hidden">
      
      {/* Left Sidebar - Conversations */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold font-heading mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg outline-none text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <div 
              key={conv._id}
              onClick={() => setActiveChat(conv)}
              className={`p-4 border-b border-gray-50 flex items-center gap-3 cursor-pointer transition ${activeChat?._id === conv._id ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
            >
              <div className="relative">
                <img src={conv.profilePic || 'https://via.placeholder.com/40'} alt={conv.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-gray-800 truncate">{conv.name}</h4>
                  <span className="text-xs text-gray-400">12:30 PM</span>
                </div>
                <p className="text-sm text-gray-500 truncate">Tap to view messages...</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content - Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC]">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <img src={activeChat.profilePic || 'https://via.placeholder.com/40'} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-gray-800">{activeChat.name}</h3>
                  <p className="text-xs text-green-500 font-medium">Online</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === user._id || msg.senderId?._id === user._id;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-gray-100 rounded-tl-none text-gray-800'}`}>
                      <p className="text-sm">{msg.message}</p>
                      <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                        {format(new Date(msg.createdAt || new Date()), 'h:mm a')}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <button type="button" className="p-2 text-gray-400 hover:text-primary transition rounded-full hover:bg-gray-50">
                  <Paperclip size={20} />
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-primary transition rounded-full hover:bg-gray-50">
                  <ImageIcon size={20} />
                </button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 bg-gray-50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="bg-primary text-white p-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageSquare size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-medium">Select a conversation to start chatting</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Messages;
