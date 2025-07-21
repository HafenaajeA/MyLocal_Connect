import React, { useState, useEffect } from 'react';
import { Search, X, Check, User, Building2, MapPin } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import LoadingSpinner from '../LoadingSpinner';


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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Start New Chat</h2>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for users by name or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              autoFocus
            />
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <LoadingSpinner />
                  <p className="text-gray-600 mt-2">Searching users...</p>
                </div>
              </div>
            ) : users.length === 0 && searchTerm.trim() ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-600 font-medium">No users found</p>
                <p className="text-gray-500 text-sm mt-1">Try searching with different keywords</p>
              </div>
            ) : searchTerm.trim() === '' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-blue-600" size={24} />
                </div>
                <p className="text-gray-600 font-medium">Start typing to search</p>
                <p className="text-gray-500 text-sm mt-1">Search for users by name or business</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map(user => (
                  <div
                    key={user._id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedUser?._id === user._id 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
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
                          {user.businessName ? (
                            <Building2 size={20} />
                          ) : (
                            <span className="text-sm">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {user.businessName || `${user.firstName} ${user.lastName}`}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {user.role === 'vendor' ? (
                          <>
                            <div className="flex items-center gap-1">
                              <Building2 size={12} />
                              <span>Vendor</span>
                            </div>
                            {user.businessName && (
                              <span className="text-gray-500">
                                • {user.firstName} {user.lastName}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1">
                              <User size={12} />
                              <span>Customer</span>
                            </div>
                            {user.location && (
                              <div className="flex items-center gap-1">
                                <MapPin size={12} />
                                <span className="truncate">{user.location}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Selection Indicator */}
                    {selectedUser?._id === user._id && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button 
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleStartChat}
            disabled={!selectedUser}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartChatModal;
