import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import StartChatModal from './StartChatModal';
import './Chat.css';

const Chat = () => {
  const {
    chats,
    activeChat,
    isConnected,
    loading,
    error,
    fetchChats,
    setActiveChat,
    clearError
  } = useChat();

  const [showStartChatModal, setShowStartChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const filteredChats = chats.filter(chat => {
    if (!searchQuery.trim()) return true;
    
    const participants = chat.participants || [];
    return participants.some(p => {
      const user = p.user || p;
      const businessName = user.businessName || '';
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      
      return (
        businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lastName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  });

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
  };

  const handleStartNewChat = () => {
    setShowStartChatModal(true);
  };

  const handleCloseModal = () => {
    setShowStartChatModal(false);
  };

  const handleChatStarted = (newChat) => {
    setActiveChat(newChat);
    setShowStartChatModal(false);
  };

  if (loading && chats.length === 0) {
    return (
      <div className="chat-container">
        <div className="chat-loading">
          <div className="loading-spinner"></div>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {error && (
        <div className="chat-error">
          <div className="error-message">
            <span>{error}</span>
            <button onClick={clearError} className="error-close">×</button>
          </div>
        </div>
      )}

      <div className="chat-layout">
        {/* Chat Sidebar */}
        <div className="chat-sidebar">
          <div className="chat-header">
            <h2>Messages</h2>
            <div className="connection-status">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '🟢' : '🔴'}
              </span>
              <span className="status-text">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="chat-search">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="chat-actions">
              <button 
                onClick={handleStartNewChat}
                className="start-chat-btn"
              >
                Start New Chat
              </button>
            </div>
          </div>

          <ChatList 
            chats={filteredChats}
            activeChat={activeChat}
            onChatSelect={handleChatSelect}
          />
        </div>

        {/* Chat Main Area */}
        <div className="chat-main">
          {activeChat ? (
            <ChatWindow chat={activeChat} />
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-content">
                <div className="no-chat-icon">💬</div>
                <h3>Select a chat to start messaging</h3>
                <p>Choose a conversation from the list or start a new one</p>
                <button 
                  onClick={handleStartNewChat}
                  className="start-chat-btn primary"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Start Chat Modal */}
      {showStartChatModal && (
        <StartChatModal 
          onClose={handleCloseModal}
          onChatStarted={handleChatStarted}
        />
      )}
    </div>
  );
};

export default Chat;
