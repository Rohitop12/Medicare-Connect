import React, { useState, useEffect, useRef, useContext } from 'react';
import { Send, Bot, User as UserIcon, Loader2, Sparkles, Clock, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';

const AIAssistant = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${user?.name || ''}! I'm MediCare AI, your personal health assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [history, setHistory] = useState([]);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/ai/history');
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch AI history', error);
    }
  };

  const loadSession = async (id) => {
    try {
      const { data } = await api.get(`/ai/history/${id}`);
      setSessionId(id);
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to load session', error);
    }
  };

  const startNewSession = () => {
    setSessionId(null);
    setMessages([{ role: 'assistant', content: `Hello ${user?.name || ''}! I'm MediCare AI, your personal health assistant. How can I help you today?` }]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: userMessage,
        sessionId: sessionId,
        // Passing context for the system prompt
        context: {
          userName: user?.name,
          // in a real app, we'd fetch active reminders/appointments here
        }
      });

      if (res.data.sessionId && !sessionId) {
        setSessionId(res.data.sessionId);
        fetchHistory(); // Refresh history list
      }
      
      // Simulate streaming effect by typing out the response
      const aiResponse = res.data.message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: '', isTyping: true }]);
      
      let typedContent = '';
      for (let i = 0; i < aiResponse.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 15)); // Typing speed
        typedContent += aiResponse[i];
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'assistant', content: typedContent, isTyping: true };
          return newMessages;
        });
      }
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'assistant', content: aiResponse, isTyping: false };
        return newMessages;
      });

    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPrompts = [
    "What are my reminders today?",
    "Help me understand my prescription",
    "How can I improve my sleep?",
    "What should I eat for high blood pressure?"
  ];

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-3xl border border-gray-100 shadow-sm flex overflow-hidden">
      
      {/* Sidebar - History */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2">
            <Clock size={20} className="text-primary" /> Past Sessions
          </h2>
          <button onClick={startNewSession} className="text-primary hover:bg-primary/10 p-2 rounded-full transition" title="New Chat">
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {history.length === 0 ? (
            <p className="text-sm text-gray-500 text-center mt-4">No past sessions found.</p>
          ) : (
            history.map(session => (
              <button
                key={session._id}
                onClick={() => loadSession(session._id)}
                className={`w-full text-left p-3 rounded-xl transition ${sessionId === session._id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <div className="text-sm truncate mb-1">{session.sessionTitle || 'Health Consultation'}</div>
                <div className="text-xs text-gray-400">{format(new Date(session.createdAt), 'MMM d, yyyy')}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10 bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 font-heading">MediCare AI</h2>
              <p className="text-sm text-gray-500">Always here to help you</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          {messages.length === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8 mt-10">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="p-4 bg-white border border-gray-200 rounded-2xl text-left hover:border-primary hover:shadow-md transition text-sm text-gray-700 font-medium"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gradient-to-br from-teal-500 to-primary text-white shadow-md'}`}>
                {msg.role === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
              </div>
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-3xl max-w-[85%] text-base ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-sm shadow-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  {msg.isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse"></span>}
                </div>
              </div>
            </div>
          ))}
          {isLoading && !messages[messages.length-1]?.isTyping && (
             <div className="flex gap-4 max-w-4xl mx-auto">
               <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-teal-500 to-primary text-white shadow-md">
                 <Bot size={20} />
               </div>
               <div className="p-4 bg-white border border-gray-100 rounded-3xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask MediCare AI anything about your health..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-6 pr-16 text-base outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-primary/20"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-3">
            MediCare AI can make mistakes. Consider verifying important information with your doctor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
