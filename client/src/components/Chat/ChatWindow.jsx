import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';


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
      <div className="chat-window-empty">
        <div className="empty-state">
          <h3>Select a chat to start messaging</h3>
          <p>Choose a conversation from the list or start a new one</p>
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

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-participant-info">
          <div className="participant-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.firstName} />
            ) : (
              <div className="avatar-placeholder">
                {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || ''}
              </div>
            )}
            <div className={`user-status ${chat.onlineUsers?.includes(user._id) ? 'online' : 'offline'}`}></div>
          </div>
          <div className="participant-details">
            <h3>
              {business.name || `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`}
            </h3>
            <p className="participant-status">
              {chat.onlineUsers?.includes(user._id) ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {loading ? (
          <div className="messages-loading">Loading messages...</div>
        ) : (
          <>
            {messageGroups.map(group => (
              <div key={group.date} className="message-group">
                <div className="date-separator">
                  <span>{group.dateLabel}</span>
                </div>
                
                {group.messages.map(message => (
                  <div
                    key={message._id}
                    className={`message ${message.sender === chat.currentUserId ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      {message.messageType === 'text' ? (
                        <p>{message.content}</p>
                      ) : (
                        <div className="message-attachment">
                          📎 {message.messageType}: {message.content}
                        </div>
                      )}
                    </div>
                    <div className="message-meta">
                      <span className="message-time">
                        {formatMessageTime(message.createdAt)}
                      </span>
                      {message.sender === chat.currentUserId && (
                        <span className={`message-status ${message.readBy?.length > 1 ? 'read' : 'sent'}`}>
                          {message.readBy?.length > 1 ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {currentTypingUsers.length > 0 && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">
                  {currentTypingUsers.length === 1 
                    ? `${currentTypingUsers[0].firstName} is typing...`
                    : `${currentTypingUsers.length} people are typing...`
                  }
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form className="message-input-form" onSubmit={handleSendMessage}>
        <div className="message-input-container">
          <input
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="message-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!messageInput.trim() || loading}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
