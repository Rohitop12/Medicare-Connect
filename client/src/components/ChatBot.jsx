import React, { useState, useEffect, useRef, useContext } from 'react';
import { MessageSquare, X, Send, User as UserIcon, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am MediCare AI. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // If user is not logged in, just give a generic response
      if (!user) {
        setTimeout(() => {
          setMessages((prev) => [...prev, { 
            role: 'assistant', 
            content: 'Please log in to use the full capabilities of MediCare AI.' 
          }]);
          setIsLoading(false);
        }, 1000);
        return;
      }

      const res = await api.post('/ai/chat', {
        message: userMessage,
        sessionId: sessionId
      });

      if (res.data.sessionId) {
        setSessionId(res.data.sessionId);
      }
      
      setMessages((prev) => [...prev, res.data.message]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I am having trouble connecting right now. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "What are my reminders today?",
    "Book an appointment",
    "Medication info"
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-all z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-100"
          >
            {/* Header */}
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={24} />
                <h3 className="font-heading font-semibold text-lg">MediCare AI</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-background flex flex-col gap-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-primary'}`}>
                    {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 max-w-[85%] self-start">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-primary flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl rounded-tl-none flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length === 1 && (
              <div className="px-4 py-2 flex gap-2 overflow-x-auto hide-scrollbar bg-background">
                {quickPrompts.map((prompt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setInput(prompt)}
                    className="whitespace-nowrap text-xs bg-white border border-primary text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-primary text-white p-2 rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
