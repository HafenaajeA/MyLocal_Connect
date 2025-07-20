import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { businessService } from '../services/businessService';
import chatService from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import toast from 'react-hot-toast';


const ServicesExample = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Using auth context
  const { user, login, logout } = useAuth();
  
  // Using chat context (which now uses chatService internally)
  const { chats, startChat, fetchChats } = useChat();

  // Example: Load businesses on component mount
  useEffect(() => {
    loadBusinesses();
  }, []);

  // Example: Load user's chats if authenticated
  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchChats]);

  // Example: Using businessService
  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const response = await businessService.getAllBusinesses({
        page: 1,
        limit: 10,
        category: 'restaurant'
      });
      setBusinesses(response.businesses);
    } catch (error) {
      // Error is already handled by the service (toast shown)
      console.error('Failed to load businesses:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Example: Using authService for login
  const handleLogin = async (credentials) => {
    try {
      await login(credentials); // This uses authService internally
      toast.success('Login successful!');
    } catch (error) {
      // Error is already handled by authService
    }
  };

  // Example: Create a new business
  const handleCreateBusiness = async (businessData) => {
    try {
      const newBusiness = await businessService.createBusiness(businessData);
      setBusinesses(prev => [...prev, newBusiness]);
      toast.success('Business created successfully!');
    } catch (error) {
      // Error is already handled by the service
    }
  };

  // Example: Start a chat with a business owner
  const handleStartChat = async (business) => {
    if (!user) {
      toast.error('Please login to start a chat');
      return;
    }

    try {
      const chat = await startChat(business.owner, business._id);
      toast.success(`Started chat with ${business.name}`);
      return chat;
    } catch (error) {
      // Error is already handled by chatService
    }
  };

  // Example: Add a review to a business
  const handleAddReview = async (businessId, reviewData) => {
    try {
      const review = await businessService.addReview(businessId, reviewData);
      toast.success('Review added successfully!');
      
      // Refresh the business details to show new review
      const updatedBusiness = await businessService.getBusinessById(businessId);
      setSelectedBusiness(updatedBusiness);
    } catch (error) {
      // Error is already handled by the service
    }
  };

  // Example: Direct chatService usage (not through context)
  const handleSendDirectMessage = async (chatId, message) => {
    try {
      const sentMessage = await chatService.sendMessage(chatId, message);
      console.log('Message sent via direct service call:', sentMessage);
    } catch (error) {
      // Error is already handled by chatService
    }
  };

  // Example: Mark chat as read
  const handleMarkChatAsRead = async (chatId) => {
    try {
      await chatService.markAsRead(chatId);
      // This will also update the chat context automatically
    } catch (error) {
      console.error('Failed to mark chat as read:', error.message);
    }
  };

  return (
    <div className="services-example">
      <h1>Services Integration Example</h1>
      
      {/* Authentication Section */}
      <section>
        <h2>Authentication</h2>
        {user ? (
          <div>
            <p>Welcome, {user.firstName}!</p>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <button 
            onClick={() => handleLogin({ 
              email: 'test@example.com', 
              password: 'password123' 
            })}
          >
            Login
          </button>
        )}
      </section>

      {/* Business Section */}
      <section>
        <h2>Businesses</h2>
        <button onClick={loadBusinesses} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Businesses'}
        </button>
        
        <div className="businesses-grid">
          {businesses.map(business => (
            <div key={business._id} className="business-card">
              <div className="business-image">
                {business.images && business.images.length > 0 ? (
                  <img 
                    src={business.images[0].url || business.images[0]} 
                    alt={business.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-business.svg';
                    }}
                  />
                ) : business.imageUrl ? (
                  <img 
                    src={business.imageUrl} 
                    alt={business.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-business.svg';
                    }}
                  />
                ) : (
                  <div className="placeholder-image">
                    <span>{business.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              
              <div className="business-info">
                <h3>{business.name}</h3>
                <p className="category">{business.category}</p>
                <p className="description">{business.description}</p>
                <p className="rating">Rating: {business.rating?.average || business.averageRating || 'No ratings'}</p>
                
                <div className="business-actions">
                  <button 
                    onClick={() => setSelectedBusiness(business)}
                    className="btn-primary"
                  >
                    View Details
                  </button>
                  
                  {user && (
                    <button 
                      onClick={() => handleStartChat(business)}
                      className="btn-secondary"
                    >
                      Start Chat
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleAddReview(business._id, {
                      rating: 5,
                      title: 'Great business!',
                      comment: 'Excellent service and quality.'
                    })}
                    className="btn-outline"
                  >
                    Add Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Chat Section */}
      <section>
        <h2>Chats</h2>
        {user && (
          <div>
            <p>You have {chats.length} active chats</p>
            <div className="chats-list">
              {chats.map(chat => (
                <div key={chat._id} className="chat-item">
                  <h4>Chat with {chat.participants.find(p => p._id !== user._id)?.firstName}</h4>
                  <p>Last message: {chat.lastMessage?.content}</p>
                  <p>Unread: {chat.unreadCount || 0}</p>
                  
                  <div className="chat-actions">
                    <button 
                      onClick={() => handleMarkChatAsRead(chat._id)}
                    >
                      Mark as Read
                    </button>
                    
                    <button 
                      onClick={() => handleSendDirectMessage(chat._id, 'Hello from service!')}
                    >
                      Send Test Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Selected Business Details */}
      {selectedBusiness && (
        <section>
          <h2>Business Details</h2>
          <div className="business-details">
            <h3>{selectedBusiness.name}</h3>
            <p>{selectedBusiness.description}</p>
            <p>Address: {selectedBusiness.address?.street}, {selectedBusiness.address?.city}</p>
            <p>Phone: {selectedBusiness.contact?.phone}</p>
            <p>Website: {selectedBusiness.contact?.website}</p>
            
            {(selectedBusiness.images || selectedBusiness.imageUrl) && (
              <div className="business-images">
                {selectedBusiness.images && selectedBusiness.images.length > 0 ? (
                  selectedBusiness.images.map((image, index) => (
                    <img 
                      key={index} 
                      src={image.url || image} 
                      alt={`${selectedBusiness.name} ${index + 1}`}
                      style={{ width: '200px', height: '150px', objectFit: 'cover', margin: '5px', borderRadius: '8px' }}
                      onError={(e) => {
                        e.target.src = '/placeholder-business.svg';
                      }}
                    />
                  ))
                ) : selectedBusiness.imageUrl ? (
                  <img 
                    src={selectedBusiness.imageUrl} 
                    alt={selectedBusiness.name}
                    style={{ width: '200px', height: '150px', objectFit: 'cover', margin: '5px', borderRadius: '8px' }}
                    onError={(e) => {
                      e.target.src = '/placeholder-business.svg';
                    }}
                  />
                ) : null}
              </div>
            )}
            
            <button onClick={() => setSelectedBusiness(null)}>
              Close Details
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default ServicesExample;
