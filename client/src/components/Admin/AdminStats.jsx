import React, { useState, useEffect } from 'react';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalBusinesses: 0,
    totalReviews: 0,
    newUsersThisMonth: 0,
    newBusinessesThisMonth: 0,
    flaggedReviews: 0,
    activeChats: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await fetch(`${serverUrl}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        console.error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: `+${stats.newUsersThisMonth} this month`,
      icon: '👥'
    },
    {
      title: 'Total Vendors',
      value: stats.totalVendors,
      change: 'Active vendors',
      icon: '🏪'
    },
    {
      title: 'Total Businesses',
      value: stats.totalBusinesses,
      change: `+${stats.newBusinessesThisMonth} this month`,
      icon: '🏢'
    },
    {
      title: 'Total Reviews',
      value: stats.totalReviews,
      change: `${stats.flaggedReviews} flagged`,
      icon: '⭐'
    },
    {
      title: 'Active Chats',
      value: stats.activeChats,
      change: 'Real-time conversations',
      icon: '💬'
    }
  ];

  return (
    <div className="admin-stats">
      <h2>Platform Overview</h2>
      <div className="admin-stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">{card.icon}</span>
              <h3>{card.title}</h3>
            </div>
            <p className="stat-value">{card.value.toLocaleString()}</p>
            <p className="stat-change">{card.change}</p>
          </div>
        ))}
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">👤</span>
            <div className="activity-content">
              <p><strong>New user registration</strong></p>
              <small>5 minutes ago</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🏢</span>
            <div className="activity-content">
              <p><strong>New business added</strong></p>
              <small>2 hours ago</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">⚠️</span>
            <div className="activity-content">
              <p><strong>Review flagged for moderation</strong></p>
              <small>4 hours ago</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
