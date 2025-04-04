
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, User, Clock, Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define interfaces for better type safety
interface Conversation {
  id: string;
  name: string;
  created_at: string;
  conversation_participants: { user_id: string }[];
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  read: boolean;
  sender_role: string;
  sender_name?: string;
}

const Messages = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "Please log in to access messages"
        });
        navigate('/auth');
        return;
      }
      
      setUserId(session.user.id);
      setIsAuthenticated(true);
      
      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (roleError) {
        console.error('Error fetching user role:', roleError);
      } else {
        setUserRole(roleData?.role || null);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  // Load conversations
  useEffect(() => {
    if (!userId) return;
    
    const loadConversations = async () => {
      try {
        // Using a direct query instead of RPC due to typings issue
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id, 
            name, 
            created_at,
            updated_at,
            conversation_participants(user_id)
          `)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        // Filter conversations where the current user is a participant
        const userConversations = data
          .filter(conv => 
            (conv.conversation_participants as { user_id: string }[])
              .some(p => p.user_id === userId)
          ) as Conversation[];
        
        setConversations(userConversations);
        
        // Set first conversation as selected if none is selected
        if (userConversations.length > 0 && !selectedConversation) {
          setSelectedConversation(userConversations[0].id);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load conversations"
        });
      }
    };
    
    loadConversations();
    
    // Set up real-time subscription for new conversations
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'conversations' },
        async (payload) => {
          const newConversation = payload.new as any;
          
          // Check if the user is a participant before adding to the list
          const { data: participantData } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', newConversation.id)
            .eq('user_id', userId);
            
          if (participantData && participantData.length > 0) {
            setConversations(prev => [
              { 
                ...newConversation, 
                conversation_participants: participantData 
              } as Conversation,
              ...prev
            ]);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [userId, toast, selectedConversation]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;
    
    const loadMessages = async () => {
      try {
        // Using a direct query instead of RPC due to typings issue
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id, 
            content, 
            created_at, 
            sender_id,
            sender_role, 
            read
          `)
          .eq('conversation_id', selectedConversation)
          .order('created_at', { ascending: true });
            
        if (error) throw error;
        
        // Enrich messages with sender information
        const enrichMessagesPromises = data.map(async (msg) => {
          let senderName = "Unknown User";
          
          if (msg.sender_role === 'teacher') {
            const { data: teacherData } = await supabase
              .from('teacher_profiles')
              .select('full_name')
              .eq('user_id', msg.sender_id)
              .single();
              
            senderName = teacherData?.full_name || "Teacher";
          } else {
            const { data: studentData } = await supabase
              .from('students')
              .select('name')
              .eq('user_id', msg.sender_id)
              .single();
              
            senderName = studentData?.name || "Student";
          }
          
          return {
            ...msg,
            sender_name: senderName
          };
        });
        
        const enrichedMessages = await Promise.all(enrichMessagesPromises);
        setMessages(enrichedMessages);
        
        // Mark messages as read
        const unreadMessages = enrichedMessages.filter(
          msg => msg.sender_id !== userId && !msg.read
        );
        
        if (unreadMessages.length > 0) {
          // Update read status in database
          for (const msg of unreadMessages) {
            await supabase
              .from('messages')
              .update({ read: true })
              .eq('id', msg.id);
          }
          
          // Update local state
          setMessages(prev => 
            prev.map(msg => 
              unreadMessages.some(unread => unread.id === msg.id)
                ? { ...msg, read: true }
                : msg
            )
          );
        }
        
        // Scroll to bottom of messages
        scrollToBottom();
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load messages"
        });
      }
    };
    
    loadMessages();
    
    // Set up real-time subscription for new messages
    const messagesChannel = supabase
      .channel(`conversation-${selectedConversation}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`
        },
        async (payload) => {
          const newMessage = payload.new as any;
          let senderName = "Unknown User";
          
          // Get the sender's name
          try {
            if (newMessage.sender_role === 'teacher') {
              const { data: teacherData } = await supabase
                .from('teacher_profiles')
                .select('full_name')
                .eq('user_id', newMessage.sender_id)
                .single();
                
              senderName = teacherData?.full_name || "Teacher";
            } else {
              const { data: studentData } = await supabase
                .from('students')
                .select('name')
                .eq('user_id', newMessage.sender_id)
                .single();
                
              senderName = studentData?.name || "Student";
            }
          } catch (error) {
            console.error('Error fetching sender information:', error);
          }
          
          const messageWithSender = {
            ...newMessage,
            sender_name: senderName
          };
          
          setMessages(prev => [...prev, messageWithSender]);
          
          // Mark as read if not from current user
          if (newMessage.sender_id !== userId) {
            await supabase
              .from('messages')
              .update({ read: true })
              .eq('id', newMessage.id);
          }
          
          // Scroll to bottom
          scrollToBottom();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedConversation, userId, toast]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !userId || !userRole) return;
    
    try {
      // Insert directly into messages table
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          content: newMessage,
          sender_id: userId,
          sender_role: userRole
        })
        .select();
      
      if (error) throw error;
      
      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation);
      
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message"
      });
    }
  };

  const selectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  // Format timestamp to readable time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Find the appropriate name to display for a message sender
  const getSenderName = (message: Message) => {
    if (message.sender_id === userId) return 'You';
    return message.sender_name || 'Unknown User';
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Messages</h1>
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card className="p-4">
          <div className="space-y-4">
            <Input 
              placeholder="Search messages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <Button 
                    key={conversation.id}
                    variant={selectedConversation === conversation.id ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => selectConversation(conversation.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    <div className="flex flex-col items-start text-left">
                      <span>{conversation.name}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(conversation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="text-center text-sm text-gray-400 py-4">
                  {searchQuery ? "No matching conversations found" : "No conversations yet"}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col h-[600px]">
            {selectedConversation ? (
              <>
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => {
                      const isCurrentUser = message.sender_id === userId;
                      return (
                        <div 
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isCurrentUser 
                                ? 'bg-purple-600 text-white rounded-tr-none' 
                                : 'bg-gray-700 rounded-tl-none'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-sm">
                                {getSenderName(message)}
                              </span>
                              <span className="text-xs opacity-70">
                                {formatTime(message.created_at)}
                              </span>
                            </div>
                            <p className="break-words">{message.content}</p>
                            {isCurrentUser && (
                              <div className="flex justify-end mt-1">
                                {message.read ? (
                                  <CheckCheck className="w-3 h-3 text-blue-300" />
                                ) : (
                                  <Check className="w-3 h-3 text-gray-300" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-400 mt-10">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-gray-700">
                  <Textarea 
                    placeholder="Type a message..." 
                    className="min-h-[80px] resize-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center text-gray-400 mt-10 flex-1">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
