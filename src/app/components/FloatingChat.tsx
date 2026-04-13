import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, ArrowLeft, Headphones, Radio, Sparkles, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { createLiveChat, addLiveChatMessage, subscribeToSingleChat } from '../../utils/ticketStore';
import type { LiveChatSession, TicketMessage } from '../../utils/ticketStore';

import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

type ChatMode = 'initial' | 'conversation' | 'customer-connect' | 'customer-live';

interface LiveChatForm {
  name: string;
  email: string;
}

export const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('initial');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m Recipe Buddy AI. I can help with cooking, nutrition, or app navigation. What do you need?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [connectForm, setConnectForm] = useState<LiveChatForm>({ name: '', email: '' });
  const [activeSession, setActiveSession] = useState<LiveChatSession | null>(null);
  const [liveChatInput, setLiveChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCategorySelect = (category: 'ai' | 'customer-service') => {
    if (category === 'customer-service') {
      setChatMode('customer-connect');
      const userMessage: Message = { id: Date.now().toString(), text: 'Customer Support', sender: 'user', timestamp: new Date() };
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: 'This is customer support. We will now connect you to one of our admins. Please enter your name and email to get started.', sender: 'ai', timestamp: new Date() };
      setMessages((prev) => [...prev, userMessage, aiMessage]);
      setInputValue('');
      return;
    }

    setChatMode('conversation');
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: 'Awesome! Ask me anything about recipes, ingredients, health, or how to use this app.', sender: 'ai', timestamp: new Date() }
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (chatMode === 'initial') {
      setChatMode('conversation');
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('API_KEY_MISSING');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: 'You are Recipe Buddy AI, a friendly, expert culinary and nutrition assistant. You help users with cooking instructions, recipe substitutions, dietary advice, and navigating the Recipe Buddy app. Keep answers highly concise, friendly, and structured. Use short paragraphs. You may use formatting like bolding and bullet points, but avoid complex markdown like tables.'
      });

      // Gemini expects history to strictly alternate between 'user' and 'model', starting with 'user'.
      const formattedHistory: any[] = [];
      const validMessages = messages.filter(m => 
        m.id !== '1' && 
        !m.text.includes('API Key') && 
        !m.text.includes('trouble connecting right now')
      );

      for (const m of validMessages) {
        const role = m.sender === 'user' ? 'user' : 'model';
        if (formattedHistory.length === 0 && role === 'model') continue;
        
        if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === role) {
          formattedHistory[formattedHistory.length - 1].parts[0].text += `\n\n${m.text}`;
        } else {
          formattedHistory.push({ role, parts: [{ text: m.text }] });
        }
      }

      const chat = model.startChat({ history: formattedHistory });
      const result = await chat.sendMessage(userMessage.text);
      const response = await result.response;

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: response.text(),
        sender: 'ai',
        timestamp: new Date(),
      }]);
    } catch (error: any) {
      console.error(error);
      const errorText = error.message === 'API_KEY_MISSING'
        ? '⚠️ To use the AI Assistant, please add your free Gemini API Key to your `.env.local` file as `VITE_GEMINI_API_KEY`. You can get one at https://aistudio.google.com/app/apikey'
        : `API Error: ${error.message}`;
      
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'ai',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setChatMode('initial');
    setActiveSession(null);
    setConnectForm({ name: '', email: '' });
    setLiveChatInput('');
    setMessages([{ id: '1', text: 'Hi! I\'m Recipe Buddy AI. I can help with cooking, nutrition, or app navigation. What do you need?', sender: 'ai', timestamp: new Date() }]);
    setInputValue('');
  };

  const handleReset = resetChat;
  const handleGoBack = resetChat;

  const handleStartCustomerLive = async () => {
    if (!connectForm.name.trim() || !connectForm.email.trim()) {
      toast.error('Please enter your name and email');
      return;
    }
    const session = await createLiveChat(connectForm.name, connectForm.email, '(Customer connected via chat)');
    setActiveSession(session);
    setChatMode('customer-live');
    toast.success('Connected! An admin will respond shortly.');
  };

  const handleSendCustomerMessage = async () => {
    if (!liveChatInput.trim() || !activeSession) return;
    await addLiveChatMessage(activeSession.id, { text: liveChatInput, sender: 'user' }, true);
    setLiveChatInput('');
  };

  const handleCustomerKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendCustomerMessage(); }
  };

  // Listen to Firestore real-time updates for active session (and auto-resume on reload)
  useEffect(() => {
    const savedSessionId = localStorage.getItem('recipebuddy_livechat_id');
    const sessionIdToWatch = activeSession?.id || savedSessionId;

    if (sessionIdToWatch) {
      const unsubscribe = subscribeToSingleChat(sessionIdToWatch, (updatedSession) => {
        if (updatedSession) {
          if (updatedSession.status === 'closed') {
            localStorage.removeItem('recipebuddy_livechat_id');
            setActiveSession(null);
            setChatMode('initial');
            setMessages(prev => [...prev, { id: Date.now().toString(), text: 'Your support session has been closed by the administrator.', sender: 'ai', timestamp: new Date() }]);
            toast.info('Chat session closed');
          } else {
            setActiveSession(updatedSession);
            setChatMode('customer-live');
            if (savedSessionId !== updatedSession.id) {
              localStorage.setItem('recipebuddy_livechat_id', updatedSession.id);
            }
          }
        } else {
           localStorage.removeItem('recipebuddy_livechat_id');
        }
      });
      return () => unsubscribe();
    }
  }, [activeSession?.id]);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[110px] sm:bottom-28 right-4 sm:right-6 z-40 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-full w-14 h-14 shrink-0 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center safe-area-bottom"
          >
            <Bot className="w-7 h-7" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-[110px] sm:bottom-28 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[75vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 safe-area-bottom"
          >
            <div className="bg-gradient-to-r from-primary to-orange-400 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {(chatMode !== 'initial') && (
                  <button
                    onClick={handleGoBack}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    title="Go back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="w-10 h-10 bg-white shadow-md rounded-full flex shrink-0 items-center justify-center border-2 border-orange-200">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                {!isMinimized && (
                  <div>
                    <h3 className="font-semibold">
                      {chatMode === 'customer-connect' || chatMode === 'customer-live' ? 'Customer Support' : 'Recipe Buddy AI'}
                    </h3>
                    <p className="text-sm text-white/80">
                      {chatMode === 'customer-live'
                        ? <span className="flex items-center gap-1"><Radio className="w-3 h-3 animate-pulse" /> Live with Admin</span>
                        : 'Powered by Gemini'}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex-1 min-h-[300px] max-h-[50vh] sm:max-h-96 overflow-y-auto bg-gradient-to-b from-white to-gray-50 p-4 space-y-3">
                {messages.map((message) => {
                  // Format text for bold strings and clean bullet bullet points
                  const formatText = (rawText: string, sender: 'user' | 'ai' | 'admin') => {
                    if (!rawText) return null;
                    const textWithBullets = rawText.replace(/^(\s*)[*-](\s+)/gm, '$1•$2');
                    const parts = textWithBullets.split(/(\*\*.*?\*\*)/g);
                    const isWhiteText = sender === 'user';
                    
                    return parts.map((part, index) => {
                      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                        return <strong key={index} className={`font-bold ${isWhiteText ? 'text-white' : 'text-gray-900'}`}>{part.slice(2, -2)}</strong>;
                      }
                      return <span key={index}>{part}</span>;
                    });
                  };

                  return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-gray-200 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{formatText(message.text, message.sender)}</div>
                      <span
                        className={`text-xs mt-1 block ${
                          message.sender === 'user'
                            ? 'text-white/70'
                            : 'text-gray-600'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </motion.div>
                ); 
              })}

                {chatMode === 'initial' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 mt-4"
                  >
                    <button
                      onClick={() => handleCategorySelect('ai')}
                      className="w-full p-3 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-800 font-semibold rounded-lg transition-all duration-300 border border-blue-200 hover:border-blue-300"
                    >
                      <Sparkles className="w-4 h-4 inline mr-2 text-indigo-600" />
                      Chat with AI Assistant
                    </button>
                    <button
                      onClick={() => handleCategorySelect('customer-service')}
                      className="w-full p-3 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-800 font-semibold rounded-lg transition-all duration-300 border border-purple-200 hover:border-purple-300"
                    >
                      <Headphones className="w-4 h-4 inline mr-2" />
                      Human Customer Support
                    </button>
                  </motion.div>
                )}

                {chatMode === 'customer-connect' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <p className="text-xs font-semibold text-purple-900">Your name:</p>
                    <Input
                      value={connectForm.name}
                      onChange={(e) => setConnectForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Jane Doe"
                      className="text-sm border-purple-200 focus:border-purple-400"
                    />
                    <p className="text-xs font-semibold text-purple-900">Email:</p>
                    <Input
                      type="email"
                      value={connectForm.email}
                      onChange={(e) => setConnectForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="text-sm border-purple-200 focus:border-purple-400"
                    />
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleStartCustomerLive}
                      className="w-full p-2 mt-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Radio className="w-4 h-4" />
                      Connect to Admin
                    </motion.button>
                  </motion.div>
                )}

                {chatMode === 'customer-live' && activeSession && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 mt-2"
                  >
                    {activeSession.messages
                      .filter((msg: TicketMessage) => msg.sender !== 'user' || msg.text !== '(Customer connected via chat)')
                      .map((msg: TicketMessage) => {
                        // Format text for bold strings and clean bullet bullet points
                        const formatText = (rawText: string, sender: 'user' | 'ai' | 'admin') => {
                          if (!rawText) return null;
                          const textWithBullets = rawText.replace(/^(\s*)[*-](\s+)/gm, '$1•$2');
                          const parts = textWithBullets.split(/(\*\*.*?\*\*)/g);
                          const isWhiteText = sender === 'user';
                          
                          return parts.map((part, index) => {
                            if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                              return <strong key={index} className={`font-bold ${isWhiteText ? 'text-white' : 'text-gray-900'}`}>{part.slice(2, -2)}</strong>;
                            }
                            return <span key={index}>{part}</span>;
                          });
                        };

                        return (
                          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              msg.sender === 'user'
                                ? 'bg-purple-600 text-white rounded-br-none'
                                : 'bg-gray-200 text-gray-900 rounded-bl-none'
                            }`}>
                              {msg.sender === 'admin' && <p className="text-[10px] font-bold text-gray-500 mb-0.5">Admin</p>}
                              <p className="leading-relaxed whitespace-pre-wrap">{formatText(msg.text, msg.sender as 'user'|'ai'|'admin')}</p>
                              <span className={`text-xs mt-1 block ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                      );
                    })}
                    <p className="text-center text-xs text-gray-400 pt-1">🟢 Waiting for admin response...</p>
                  </motion.div>
                )}

                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-gray-200 text-gray-900 rounded-lg px-4 py-3 rounded-bl-none">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {!isMinimized && (
              <div className="border-t border-gray-200 p-3 bg-white shrink-0">
                {chatMode === 'customer-live' && activeSession ? (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={liveChatInput}
                      onChange={(e) => setLiveChatInput(e.target.value)}
                      onKeyPress={handleCustomerKeyPress}
                      className="flex-1 border-gray-200 focus:border-purple-400"
                    />
                    <Button
                      onClick={handleSendCustomerMessage}
                      disabled={!liveChatInput.trim()}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder={chatMode === 'initial' ? "Select an option..." : "Ask me anything..."}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading || chatMode === 'customer-connect'}
                      className="flex-1 border-gray-200 focus:border-primary"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading || chatMode === 'customer-connect'}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
