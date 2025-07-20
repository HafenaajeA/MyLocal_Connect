import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserManagement from '../components/Admin/UserManagement';
import BusinessManagement from '../components/Admin/BusinessManagement';
import ReviewManagement from '../components/Admin/ReviewManagement';
import AdminStats from '../components/Admin/AdminStats';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      navigate('/');
      return;
    }

    setUser(parsedUser);
  }, [navigate]);

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'businesses', label: 'Businesses', icon: '🏢' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' }
  ];

  if (!user) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-user-info">
          <span>Welcome, {user.firstName} {user.lastName}</span>
          <span className="admin-badge">Admin</span>
        </div>
      </div>

      <div className="admin-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'businesses' && <BusinessManagement />}
        {activeTab === 'reviews' && <ReviewManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;
