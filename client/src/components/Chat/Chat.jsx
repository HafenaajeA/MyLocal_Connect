import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Plus, Wifi, WifiOff, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import StartChatModal from './StartChatModal';
import LoadingSpinner from '../LoadingSpinner';


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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4 font-medium">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">
                <X size={20} />
              </div>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
            <button 
              onClick={clearError} 
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        {/* Chat Sidebar */}
        <div className="w-80 bg-white/70 backdrop-blur-sm border-r border-gray-200/50 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="text-blue-600" size={24} />
                Messages
              </h2>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="text-green-500" size={16} />
                ) : (
                  <WifiOff className="text-red-500" size={16} />
                )}
                <span className={`text-sm font-medium ${
                  isConnected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            {/* New Chat Button */}
            <button 
              onClick={handleStartNewChat}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Start New Chat
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            <ChatList 
              chats={filteredChats}
              activeChat={activeChat}
              onChatSelect={handleChatSelect}
            />
          </div>
        </div>

        {/* Chat Main Area */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <ChatWindow chat={activeChat} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="text-blue-600" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Select a chat to start messaging
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Choose a conversation from the list or start a new one to begin chatting with other users.
                </p>
                <button 
                  onClick={handleStartNewChat}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus size={20} />
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
