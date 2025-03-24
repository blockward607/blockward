
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, MessageSquare, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Message {
  type: 'user' | 'bot';
  text: string;
}

export const AssistantBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: 'bot', text: 'Hello! I\'m your BlockWard assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: input }]);
    
    // Process and respond
    setTimeout(() => {
      let response = 'I don\'t have an answer for that yet.';
      
      // Simple response logic
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        response = 'Hello there! How can I help you with BlockWard today?';
      } else if (lowerInput.includes('what is blockward')) {
        response = 'BlockWard is an educational platform that uses blockchain technology to track student achievements, attendance, and rewards.';
      } else if (lowerInput.includes('how') && lowerInput.includes('join')) {
        response = 'To join a class, you\'ll need an invitation code from your teacher. You can enter it on the sign-in page or use the Join Class button once you\'re logged in.';
      } else if (lowerInput.includes('nft') || lowerInput.includes('reward')) {
        response = 'BlockWard uses special digital tokens (NFTs) to recognize student achievements. These are stored securely on the blockchain and belong to you forever!';
      } else if (lowerInput.includes('teacher') || lowerInput.includes('create class')) {
        response = 'Teachers can create classes, track attendance, issue achievements, and manage students all in one place. Sign up as a teacher to get started!';
      } else if (lowerInput.includes('thank')) {
        response = 'You\'re welcome! Is there anything else I can help with?';
      }
      
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
    }, 600);
    
    setInput('');
  };
  
  return (
    <>
      {/* Bot toggle button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className={`h-14 w-14 rounded-full bg-gradient-to-r ${isOpen ? 'from-red-500 to-red-700' : 'from-purple-600 to-purple-800'} hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300`}
        >
          {isOpen ? <X size={24} /> : <Bot size={24} className="animate-pulse" />}
        </Button>
      </motion.div>
      
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-96 z-40 glass-card overflow-hidden flex flex-col"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="p-3 bg-purple-900/80 flex items-center">
              <Bot className="text-purple-300 mr-2" size={20} />
              <h3 className="font-medium text-white">BlockWard Assistant</h3>
              <Zap className="ml-2 text-yellow-300" size={14} />
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto bg-black/50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`mb-3 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3/4 p-2 rounded ${
                      msg.type === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-3 border-t border-purple-900/30 bg-black/70">
              <div className="flex">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-gray-900 border border-purple-900/30 rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 text-white"
                  placeholder="Ask something..."
                />
                <Button 
                  onClick={handleSendMessage}
                  className="rounded-l-none bg-purple-700 hover:bg-purple-600"
                >
                  <MessageSquare size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
