
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, MessageSquare, Sparkles, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { searchKnowledge } from "@/data/blockward-knowledge";
import { useToast } from "@/hooks/use-toast";
import OpenAI from 'openai';

interface Message {
  type: 'user' | 'bot';
  text: string;
}

// Use a demo API key for development purposes
// In production, this should be stored securely in environment variables
const DEMO_MODE = true;

export const AssistantBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: 'bot', text: 'Hello! I\'m your BlockWard assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processWithOpenAI = async (userInput: string) => {
    try {
      if (DEMO_MODE) {
        // First try to match with our knowledge base
        const matchingItems = searchKnowledge(userInput);
        
        if (matchingItems.length > 0) {
          return matchingItems[0].answer;
        }
        
        // For demo mode, provide a simulated response based on common questions
        if (userInput.toLowerCase().includes('join') && userInput.toLowerCase().includes('class')) {
          return "To join a class, go to the Classes page and use the 'Join Class' section. You'll need an invitation code from your teacher, or you can scan a QR code if available.";
        } else if (userInput.toLowerCase().includes('nft') || userInput.toLowerCase().includes('award')) {
          return "BlockWard NFTs are digital certificates of achievement that teachers can award to students. They're stored securely on the blockchain and stay with the student forever.";
        } else if (userInput.toLowerCase().includes('invite') && userInput.toLowerCase().includes('student')) {
          return "To invite students to your class, go to your class details page, select the 'Students' tab, and use either the invitation code or QR code to share with your students.";
        } else {
          return "I'm here to help with questions about BlockWard. You can ask about joining classes, creating NFT awards, inviting students, and more. What would you like to know?";
        }
      } else {
        // Use the OpenAI API directly
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY || '',
          dangerouslyAllowBrowser: true // Not recommended for production
        });

        const knowledgeContext = "BlockWard is an educational platform that allows teachers to create virtual classrooms, invite students, track attendance, and award NFT certificates. Users can join classes with invitation codes, scan QR codes, or import from Google Classroom.";
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: `You are a helpful assistant for BlockWard, an educational platform. Keep responses concise but informative. ${knowledgeContext}` },
            { role: "user", content: userInput }
          ],
          max_tokens: 200,
        });

        return completion.choices[0].message.content;
      }
    } catch (error) {
      console.error("Error processing with AI:", error);
      return "I'm having trouble processing your request at the moment. Please try again later.";
    }
  };
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: input.trim() }]);
    setIsProcessing(true);
    
    try {
      // Process and respond
      const userInput = input.trim();
      const response = await processWithOpenAI(userInput);
      
      setMessages(prev => [...prev, { type: 'bot', text: response || "I'm not sure how to respond to that." }]);
    } catch (error) {
      console.error("Error in chat processing:", error);
      toast({
        title: "Error",
        description: "Failed to process your message",
        variant: "destructive"
      });
      
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: "I'm having trouble understanding right now. Please try again later." 
      }]);
    } finally {
      setIsProcessing(false);
      setInput('');
    }
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
              <Sparkles className="ml-2 text-yellow-300" size={14} />
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
                    {msg.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
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
                  placeholder="Ask about BlockWard..."
                  disabled={isProcessing}
                />
                <Button 
                  onClick={handleSendMessage}
                  className="rounded-l-none bg-purple-700 hover:bg-purple-600"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MessageSquare size={18} />
                  )}
                </Button>
              </div>
              
              <div className="mt-2 text-xs text-gray-400 flex items-center">
                <Search className="h-3 w-3 mr-1 text-purple-400" />
                Try asking: "What are BlockWard NFTs?" or "How do I join a class?"
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
