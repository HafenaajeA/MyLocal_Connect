import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';


const StartChatModal = ({ onClose, onChatStarted }) => {
  const { startChat } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      const response = await fetch(`${serverUrl}/api/users/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to search users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!selectedUser) return;

    try {
      const chat = await startChat(selectedUser._id, selectedUser.businessId);
      if (chat) {
        onChatStarted(chat);
        handleClose();
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const handleClose = () => {
    onClose();
    setSearchTerm('');
    setSelectedUser(null);
    setUsers([]);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Start New Chat</h2>
          <button className="modal-close" onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search for users by name or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>

          <div className="users-list">
            {loading ? (
              <div className="loading-message">Searching users...</div>
            ) : users.length === 0 && searchTerm.trim() ? (
              <div className="no-results">
                No users found matching "{searchTerm}"
              </div>
            ) : searchTerm.trim() === '' ? (
              <div className="search-prompt">
                Start typing to search for users
              </div>
            ) : (
              users.map(user => (
                <div
                  key={user._id}
                  className={`user-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.firstName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="user-info">
                    <div className="user-name">
                      {user.businessName || `${user.firstName} ${user.lastName}`}
                    </div>
                    <div className="user-details">
                      {user.role === 'vendor' ? (
                        <>
                          <span className="user-role">Vendor</span>
                          {user.businessName && (
                            <span className="user-secondary">
                              {user.firstName} {user.lastName}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="user-role">Customer</span>
                          {user.location && (
                            <span className="user-secondary">{user.location}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {selectedUser?._id === user._id && (
                    <div className="selection-indicator">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleStartChat}
            disabled={!selectedUser}
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartChatModal;
