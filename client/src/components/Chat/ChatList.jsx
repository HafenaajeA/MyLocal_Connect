import React from 'react';
import './Chat.css';

const ChatList = ({ chats, activeChat, onChatSelect }) => {
  if (!chats || chats.length === 0) {
    return (
      <div className="chat-list">
        <div className="chat-list-empty">
          No chats yet. Start a conversation!
        </div>
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
    <div className="chat-list">
      {chats.map(chat => {
        const otherParticipant = chat.participants?.find(p => p.user?._id !== chat.currentUserId) || {};
        const user = otherParticipant.user || {};
        const business = chat.business || {};
        const lastMessage = chat.lastMessage;
        const unreadCount = chat.unreadCount || 0;

        return (
          <div
            key={chat._id}
            className={`chat-item ${activeChat?._id === chat._id ? 'active' : ''}`}
            onClick={() => onChatSelect(chat)}
          >
            <div className="chat-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.firstName} />
              ) : (
                <div className="avatar-placeholder">
                  {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || ''}
                </div>
              )}
              <div className={`user-status ${chat.onlineUsers?.includes(user._id) ? 'online' : 'offline'}`}></div>
            </div>
            
            <div className="chat-info">
              <div className="chat-header">
                <h4 className="chat-name">
                  {business.name || `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`}
                </h4>
                {lastMessage && (
                  <span className="chat-time">{formatTime(lastMessage.createdAt)}</span>
                )}
              </div>
              
              <div className="chat-preview">
                {lastMessage ? (
                  <div className="last-message">
                    {lastMessage.sender === chat.currentUserId && (
                      <span className="message-sender">You: </span>
                    )}
                    <span className="message-content">
                      {lastMessage.messageType === 'text' 
                        ? lastMessage.content 
                        : `📎 ${lastMessage.messageType}`
                      }
                    </span>
                  </div>
                ) : (
                  <span className="no-messages">No messages yet</span>
                )}
                
                {unreadCount > 0 && (
                  <div className="unread-badge">{unreadCount}</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
