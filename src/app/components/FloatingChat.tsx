import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, ArrowLeft, Headphones, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { createLiveChat, addLiveChatMessage, getLiveChats } from '../../utils/ticketStore';
import type { LiveChatSession, TicketMessage } from '../../utils/ticketStore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

type ChatMode = 'initial' | 'navigation' | 'nutrition' | 'customer-connect' | 'customer-live' | 'conversation';

interface LiveChatForm {
  name: string;
  email: string;
}

const NUTRITION_QUESTIONS = [
  'What is the target calorie intake for weight gain?',
  'What is the daily calorie intake for weight loss?',
  'How much protein should I consume daily?',
  'What are macronutrients and why do they matter?',
  'What is a calorie deficit and how does it work?',
  'How many calories are in 1g of fat, protein, and carbs?',
  'What foods are high in protein but low in calories?',
  'What is the difference between simple and complex carbs?',
];

const NAVIGATION_QUESTIONS = [
  'How do I save favorite recipes?',
  'How do I search for recipes?',
  'How do I add my own recipe?',
  'Where is my profile?',
  'How do I leave comments?',
  'How do I browse recipe categories?',
  'Where can I find the Store Locator?',
];



const NUTRITION_ANSWERS: Record<string, string> = {
  'What is the target calorie intake for weight gain?':
    'To gain weight, you need a calorie surplus — typically 250–500 calories above your Total Daily Energy Expenditure (TDEE). A moderate surplus of ~300 cal/day targets roughly 0.25–0.5 lb of weight gain per week, minimising excess fat. For example, if your TDEE is 2,200 cal, aim for 2,450–2,700 cal/day.',
  'What is the daily calorie intake for weight loss?':
    'For weight loss, aim for a calorie deficit of 500 cal/day below your TDEE, which targets approximately 1 lb (0.45 kg) of fat loss per week. Most adults fall between 1,200–1,800 cal/day depending on size and activity level. Never go below 1,200 cal/day (women) or 1,500 cal/day (men) without medical supervision.',
  'How much protein should I consume daily?':
    'The general recommendation is 0.8g of protein per kg of body weight for sedentary adults. For muscle building or active individuals, aim for 1.6–2.2g per kg. For a 70 kg person that is 112–154g of protein per day. Good sources include chicken, fish, eggs, legumes, and Greek yogurt.',
  'What are macronutrients and why do they matter?':
    'Macronutrients — carbohydrates, proteins, and fats — are the three main energy-providing nutrients. Carbs fuel your brain and muscles, protein builds and repairs tissue, and fats support hormones and vitamin absorption. Balancing all three is key to sustained energy and overall health.',
  'What is a calorie deficit and how does it work?':
    'A calorie deficit occurs when you consume fewer calories than your body burns. Your body then draws on stored fat for energy, causing weight loss. A deficit of 500 cal/day leads to roughly 0.5 kg (1 lb) of fat loss per week. Combining a moderate deficit with exercise preserves muscle mass.',
  'How many calories are in 1g of fat, protein, and carbs?':
    'Each macronutrient provides a different amount of energy: 1g of carbohydrates = 4 calories, 1g of protein = 4 calories, 1g of fat = 9 calories. Fat is more than twice as calorie-dense as carbs or protein, which is why portion size of high-fat foods matters.',
  'What foods are high in protein but low in calories?':
    'Great high-protein, low-calorie foods include: chicken breast (~165 cal, 31g protein per 100g), canned tuna (~116 cal, 26g protein), egg whites (~52 cal, 11g protein), non-fat Greek yogurt (~59 cal, 10g protein), cottage cheese (~98 cal, 11g protein), shrimp (~99 cal, 24g protein), and tofu (~76 cal, 8g protein).',
  'What is the difference between simple and complex carbs?':
    'Simple carbs (sugar, white bread, fruit juice) are digested quickly and cause rapid blood sugar spikes and crashes, leaving you hungry sooner. Complex carbs (oats, brown rice, legumes, vegetables) digest slowly, providing sustained energy and keeping you fuller for longer. Choose complex carbs for better blood sugar control and lasting satiety.',
};

const getNutritionResponse = (question: string): string => {
  return NUTRITION_ANSWERS[question] ?? 'Great question! Select one of the topics above to learn more about nutrition and calories.';
};

const NAVIGATION_ANSWERS: Record<string, string> = {
  'How do I save favorite recipes?':
    'Open any recipe and tap the heart icon ❤️. The recipe is instantly saved to your Bookmarks. Access all saved recipes anytime from the Bookmarks tab in the bottom navigation bar.',
  'How do I search for recipes?':
    'Use the search bar at the top of the Home or Explore screen. Type a recipe name or ingredient and results update in real-time as you type. You can combine search with category filters for more targeted results.',
  'How do I add my own recipe?':
    'Tap the + button in the top-right corner of the home screen (or the "Create Your Recipe" button). Fill in the recipe name, ingredients, and instructions. Nutritional info is calculated automatically from the ingredients you enter!',
  'Where is my profile?':
    'Your profile is accessible via the person icon in the bottom navigation bar. From there you can update your name, dietary preferences, health goals, and allergen settings.',
  'How do I leave comments?':
    'Open any recipe detail page and scroll to the Comments section at the bottom. Type your comment, leave a star rating, and tap Submit. You can also reply to other users\' comments!',
  'How do I browse recipe categories?':
    'On the Home or Explore screen, tap any category chip (Breakfast, Lunch, Dinner, Dessert, Snacks, etc.) to filter recipes by that category. Tap "All" to clear the filter and see every recipe.',
  'Where can I find the Store Locator?':
    'Open any recipe detail page and scroll down to find the Store Locator button. It shows nearby stores where you can purchase the ingredients needed for that recipe.',
};

const getNavigationResponse = (question: string): string => {
  return NAVIGATION_ANSWERS[question] ?? 'Select a question above to learn how to navigate Recipe Buddy!';
};





export const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('initial');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m here to help with nutrition info, app navigation, and customer support. What do you need?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'nutrition' | 'navigation' | 'customer-service' | null>(null);
  const [connectForm, setConnectForm] = useState<LiveChatForm>({ name: '', email: '' });
  const [activeSession, setActiveSession] = useState<LiveChatSession | null>(null);
  const [liveChatInput, setLiveChatInput] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCategorySelect = (category: 'navigation' | 'nutrition' | 'customer-service') => {
    setSelectedCategory(category);

    if (category === 'customer-service') {
      setChatMode('customer-connect');
      const userMessage: Message = { id: Date.now().toString(), text: 'Customer Support', sender: 'user', timestamp: new Date() };
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: 'This is customer support. We will now connect you to one of our admins. Please enter your name and email to get started.', sender: 'ai', timestamp: new Date() };
      setMessages((prev) => [...prev, userMessage, aiMessage]);
      setInputValue('');
      return;
    }

    setChatMode(category as ChatMode);
    const categoryMessage: Message = {
      id: Date.now().toString(),
      text: category === 'nutrition' ? 'Nutrition & Calories' : 'App Navigation',
      sender: 'user',
      timestamp: new Date(),
    };
    const responseText = category === 'nutrition'
      ? 'Great! I can help you with nutrition and calorie questions. Here are some popular topics:'
      : 'Perfect! I can help you navigate Recipe Buddy. Here are some common questions:';
    const aiMessage: Message = { id: (Date.now() + 1).toString(), text: responseText, sender: 'ai', timestamp: new Date() };
    setMessages((prev) => [...prev, categoryMessage, aiMessage]);
    setInputValue('');
  };

  const handleQuestionSelect = (question: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response delay
    setTimeout(() => {
      let aiResponse = '';

      if (selectedCategory === 'nutrition') {
        aiResponse = getNutritionResponse(question);
      } else if (selectedCategory === 'navigation') {
        aiResponse = getNavigationResponse(question);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setChatMode('conversation');
      setShowQuestions(false);
    }, 500);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response delay
    setTimeout(() => {
      let aiResponse = '';
      const query = inputValue.toLowerCase();

      if (!selectedCategory || selectedCategory === 'customer-service') return;
      if (selectedCategory === 'nutrition') {
        aiResponse = getNutritionResponse(query);
      } else if (selectedCategory === 'navigation') {
        aiResponse = getNavigationResponse(query);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setChatMode('initial');
    setSelectedCategory(null);
    setActiveSession(null);
    setConnectForm({ name: '', email: '' });
    setLiveChatInput('');
    setShowQuestions(false);
    setMessages([{ id: '1', text: 'Hi! I\'m here to help with nutrition info, app navigation, and customer support. What do you need?', sender: 'ai', timestamp: new Date() }]);
    setInputValue('');
  };

  const handleReset = resetChat;
  const handleGoBack = resetChat;

  const handleStartCustomerLive = () => {
    if (!connectForm.name.trim() || !connectForm.email.trim()) {
      toast.error('Please enter your name and email');
      return;
    }
    const session = createLiveChat(connectForm.name, connectForm.email, '(Customer connected via chat)');
    setActiveSession(session);
    setChatMode('customer-live');
    toast.success('Connected! An admin will respond shortly.');
  };

  const handleSendCustomerMessage = () => {
    if (!liveChatInput.trim() || !activeSession) return;
    addLiveChatMessage(activeSession.id, { text: liveChatInput, sender: 'user' }, true);
    const chats = getLiveChats();
    const updated = chats.find((c: LiveChatSession) => c.id === activeSession.id) ?? activeSession;
    setActiveSession({ ...updated });
    setLiveChatInput('');
  };

  const handleCustomerKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendCustomerMessage(); }
  };

  // ── question lists ────────────────────────────────────────────────────────

  const currentQuestions =
    selectedCategory === 'nutrition' ? NUTRITION_QUESTIONS :
    selectedCategory === 'navigation' ? NAVIGATION_QUESTIONS :
    [];

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 z-40 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-orange-400 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(selectedCategory || chatMode === 'customer-connect' || chatMode === 'customer-live') && (
                  <button
                    onClick={handleGoBack}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    title="Go back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                {!isMinimized && (
                                  <div>
                    <h3 className="font-semibold">
                      {chatMode === 'customer-connect' || chatMode === 'customer-live' ? 'Customer Support' : 'Recipe Buddy Assistant'}
                    </h3>
                    <p className="text-sm text-white/80">
                      {chatMode === 'customer-live'
                        ? <span className="flex items-center gap-1"><Radio className="w-3 h-3 animate-pulse" /> Live with Admin</span>
                        : 'Help & Support'}
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

            {/* Messages Area */}
            {!isMinimized && (
              <div className="h-96 overflow-y-auto bg-gradient-to-b from-white to-gray-50 p-4 space-y-3">
                {messages.map((message) => (
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
                      <p className="text-sm leading-relaxed">{message.text}</p>
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
                ))}

                {/* Category Selection */}
                {chatMode === 'initial' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 mt-4"
                  >
                    <button
                      onClick={() => handleCategorySelect('nutrition')}
                      className="w-full p-3 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-800 font-semibold rounded-lg transition-all duration-300 border border-green-200 hover:border-green-300"
                    >
                      Nutrition & Calories
                    </button>
                    <button
                      onClick={() => handleCategorySelect('navigation')}
                      className="w-full p-3 bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 text-blue-800 font-semibold rounded-lg transition-all duration-300 border border-blue-200 hover:border-blue-300"
                    >
                      App Navigation
                    </button>
                    <button
                      onClick={() => handleCategorySelect('customer-service')}
                      className="w-full p-3 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-800 font-semibold rounded-lg transition-all duration-300 border border-purple-200 hover:border-purple-300"
                    >
                      <Headphones className="w-4 h-4 inline mr-2" />
                      Customer Support
                    </button>
                  </motion.div>
                )}

                {/* Question Selection — shown when category first picked (not yet answered) */}
                {selectedCategory && selectedCategory !== 'customer-service' && (chatMode === 'nutrition' || chatMode === 'navigation') && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 mt-4"
                  >
                    <p className="text-xs text-gray-500 font-semibold px-1">
                      {selectedCategory === 'nutrition' ? 'Nutrition & Calorie Facts:' : 'App Navigation Help:'}
                    </p>
                    {currentQuestions.map((question, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleQuestionSelect(question)}
                        className={`w-full p-2 text-left text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 ${
                          selectedCategory === 'nutrition'
                            ? 'bg-green-50 hover:bg-green-100 text-green-800 border border-green-200'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {question}
                      </motion.button>
                    ))}
                    <button
                      onClick={handleGoBack}
                      className="w-full p-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ↩ Back to main menu
                    </button>
                  </motion.div>
                )}

                {/* More Questions accordion — shown in conversation mode */}
                {chatMode === 'conversation' && selectedCategory && selectedCategory !== 'customer-service' && (
                  <div className="mt-3">
                    <button
                      onClick={() => setShowQuestions((prev) => !prev)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        selectedCategory === 'nutrition'
                          ? 'bg-green-50 hover:bg-green-100 text-green-800 border border-green-200'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      <span>More questions</span>
                      <motion.span
                        animate={{ rotate: showQuestions ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-block"
                      >
                        ▾
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {showQuestions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1 pt-2">
                            {currentQuestions.map((question, index) => (
                              <motion.button
                                key={index}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.04 }}
                                onClick={() => { handleQuestionSelect(question); setShowQuestions(false); }}
                                className={`w-full p-2 text-left text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                                  selectedCategory === 'nutrition'
                                    ? 'bg-green-50 hover:bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {question}
                              </motion.button>
                            ))}
                            <button
                              onClick={handleGoBack}
                              className="w-full p-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              ↩ Back to main menu
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Customer Connect Form */}
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

                {/* Customer Live Chat */}
                {chatMode === 'customer-live' && activeSession && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 mt-2"
                  >
                    {activeSession.messages
                      .filter((msg: TicketMessage) => msg.sender !== 'user' || msg.text !== '(Customer connected via chat)')
                      .map((msg: TicketMessage) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          msg.sender === 'user'
                            ? 'bg-purple-600 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-900 rounded-bl-none'
                        }`}>
                          {msg.sender === 'admin' && <p className="text-[10px] font-bold text-gray-500 mb-0.5">Admin</p>}
                          <p className="leading-relaxed">{msg.text}</p>
                          <span className={`text-xs mt-1 block ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                    <p className="text-center text-xs text-gray-400 pt-1">🟢 Waiting for admin response...</p>
                  </motion.div>
                )}



                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input Area */}
            {!isMinimized && (
              <div className="border-t border-gray-200 p-3 bg-white">
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
                      placeholder="Select a question above..."
                      value={inputValue}
                      disabled
                      className="flex-1 border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 cursor-not-allowed"
                    />
                    <Button
                      disabled
                      size="sm"
                      className="bg-primary/40 cursor-not-allowed"
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


