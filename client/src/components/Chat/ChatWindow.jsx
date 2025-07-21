import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Building2, Paperclip, Check, CheckCheck } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import LoadingSpinner from '../LoadingSpinner';


const ChatWindow = ({ chat }) => {
  const { 
    messages, 
    sendMessage, 
    fetchMessages, 
    markMessagesAsRead,
    typingUsers,
    startTyping,
    stopTyping,
    joinChat,
    leaveChat,
    loading 
  } = useChat();
  
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (chat?._id) {
      joinChat(chat._id);
      fetchMessages(chat._id);
      markMessagesAsRead(chat._id);
      
      return () => {
        leaveChat(chat._id);
      };
    }
  }, [chat?._id, joinChat, fetchMessages, markMessagesAsRead, leaveChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (!isTyping && e.target.value.trim() && chat?._id) {
      setIsTyping(true);
      startTyping(chat._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && chat?._id) {
        setIsTyping(false);
        stopTyping(chat._id);
      }
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !chat?._id) return;

    try {
      sendMessage(chat._id, messageInput.trim());
      setMessageInput('');
      
      if (isTyping) {
        setIsTyping(false);
        stopTyping(chat._id);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessageDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    if (!messages) return [];
    
    const groups = [];
    let currentGroup = null;

    messages.forEach(message => {
      const messageDate = new Date(message.createdAt).toDateString();
      
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = {
          date: messageDate,
          dateLabel: formatMessageDate(message.createdAt),
          messages: []
        };
        groups.push(currentGroup);
      }
      
      currentGroup.messages.push(message);
    });

    return groups;
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="text-gray-400" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Select a chat to start messaging
          </h3>
          <p className="text-gray-600">
            Choose a conversation from the list or start a new one
          </p>
        </div>
      </div>
    );
  }

  const otherParticipant = chat.participants?.find(p => p.user?._id !== chat.currentUserId) || {};
  const user = otherParticipant.user || {};
  const business = chat.business || {};
  const chatMessages = messages[chat._id] || [];
  const messageGroups = groupMessagesByDate(chatMessages);
  const currentTypingUsers = typingUsers[chat._id] || [];
  const isOnline = chat.onlineUsers?.includes(user._id);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center gap-4 p-6 border-b border-gray-200 bg-white/70 backdrop-blur-sm">
        <div className="relative">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.firstName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {business.name ? (
                <Building2 size={20} />
              ) : (
                <span className="text-sm">
                  {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || ''}
                </span>
              )}
            </div>
          )}
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-500' : 'bg-gray-300'
          }`}></div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">
            {business.name || `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`}
          </h3>
          <p className={`text-sm ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <LoadingSpinner />
              <p className="text-gray-600 mt-4">Loading messages...</p>
            </div>
          </div>
        ) : (
          <>
            {messageGroups.map(group => (
              <div key={group.date} className="space-y-4">
                {/* Date Separator */}
                <div className="flex items-center justify-center my-6">
                  <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                    <span className="text-sm text-gray-600 font-medium">{group.dateLabel}</span>
                  </div>
                </div>
                
                {/* Messages */}
                {group.messages.map(message => {
                  const isSent = message.sender === chat.currentUserId;
                  const isRead = message.readBy?.length > 1;
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isSent ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-2xl px-4 py-3 ${
                          isSent 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}>
                          {message.messageType === 'text' ? (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          ) : (
                            <div className="flex items-center gap-2 text-sm">
                              <Paperclip size={16} />
                              <span>{message.messageType}: {message.content}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Message Meta */}
                        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                          isSent ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>{formatMessageTime(message.createdAt)}</span>
                          {isSent && (
                            <div className="flex items-center">
                              {isRead ? (
                                <CheckCheck size={14} className="text-blue-500" />
                              ) : (
                                <Check size={14} className="text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {currentTypingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 max-w-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {currentTypingUsers.length === 1 
                        ? `${currentTypingUsers[0].firstName} is typing...`
                        : `${currentTypingUsers.length} people are typing...`
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form 
        className="p-4 border-t border-gray-200 bg-white" 
        onSubmit={handleSendMessage}
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            placeholder="Type a message..."
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || loading}
            className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
