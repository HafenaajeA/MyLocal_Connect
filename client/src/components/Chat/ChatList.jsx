import React from 'react';
import { MessageCircle, User, Building2, Paperclip } from 'lucide-react';

const ChatList = ({ chats, activeChat, onChatSelect }) => {
  if (!chats || chats.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="text-gray-400" size={24} />
        </div>
        <p className="text-gray-500 font-medium">No chats yet</p>
        <p className="text-gray-400 text-sm mt-1">Start a conversation!</p>
      </div>
    );
  }

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="divide-y divide-gray-100">
      {chats.map(chat => {
        const otherParticipant = chat.participants?.find(p => p.user?._id !== chat.currentUserId) || {};
        const user = otherParticipant.user || {};
        const business = chat.business || {};
        const lastMessage = chat.lastMessage;
        const unreadCount = chat.unreadCount || 0;
        const isActive = activeChat?._id === chat._id;
        const isOnline = chat.onlineUsers?.includes(user._id);

        return (
          <div
            key={chat._id}
            className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
              isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
            onClick={() => onChatSelect(chat)}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
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
                
                {/* Online Status */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  isOnline ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>
              
              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-semibold truncate ${
                    isActive ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {business.name || `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`}
                  </h4>
                  {lastMessage && (
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTime(lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  {lastMessage ? (
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      {lastMessage.sender === chat.currentUserId && (
                        <span className="text-xs text-gray-500 flex-shrink-0">You:</span>
                      )}
                      {lastMessage.messageType === 'text' ? (
                        <span className={`text-sm truncate ${
                          unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                        }`}>
                          {lastMessage.content}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Paperclip size={12} />
                          <span className="text-sm truncate">
                            {lastMessage.messageType}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No messages yet</span>
                  )}
                  
                  {unreadCount > 0 && (
                    <div className="bg-blue-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 ml-2 flex-shrink-0">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
