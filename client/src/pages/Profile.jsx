import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container py-4">
      <div className="profile-container">
        <div className="profile-header card card-padding">
          <div className="profile-info">
            <div className="profile-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="profile-details">
              <h1 className="profile-name">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="profile-username">@{user?.username}</p>
              <p className="profile-email">{user?.email}</p>
              {user?.bio && (
                <p className="profile-bio">{user.bio}</p>
              )}
              {user?.location && (
                <p className="profile-location">📍 {user.location}</p>
              )}
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn btn-primary">Edit Profile</button>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <h3>Posts</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h3>Followers</h3>
            <p className="stat-number">{user?.followers?.length || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Following</h3>
            <p className="stat-number">{user?.following?.length || 0}</p>
          </div>
        </div>

        <div className="profile-content">
          <div className="content-tabs">
            <button className="tab-button active">Posts</button>
            <button className="tab-button">Liked</button>
          </div>
          
          <div className="tab-content">
            <div className="empty-state">
              <h3>No posts yet</h3>
              <p>Start sharing with your community!</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-header {
          margin-bottom: 24px;
        }

        .profile-info {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
        }

        .profile-name {
          font-size: 28px;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .profile-username {
          color: #64748b;
          font-size: 16px;
          margin-bottom: 8px;
        }

        .profile-email {
          color: #475569;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .profile-bio {
          color: #374151;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .profile-location {
          color: #64748b;
          font-size: 14px;
        }

        .profile-actions {
          margin-top: 16px;
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          border: 1px solid #e2e8f0;
        }

        .stat-card h3 {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #1e293b;
          margin: 0;
        }

        .profile-content {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .content-tabs {
          display: flex;
          border-bottom: 1px solid #e2e8f0;
        }

        .tab-button {
          flex: 1;
          padding: 16px 24px;
          border: none;
          background: none;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-button.active {
          color: #3b82f6;
          border-bottom: 2px solid #3b82f6;
        }

        .tab-button:hover {
          background: #f8fafc;
        }

        .tab-content {
          padding: 32px 24px;
        }

        .empty-state {
          text-align: center;
          color: #64748b;
        }

        .empty-state h3 {
          color: #374151;
          margin-bottom: 8px;
        }

        @media (max-width: 640px) {
          .profile-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .profile-stats {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }

          .stat-card {
            padding: 16px;
          }

          .stat-number {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
