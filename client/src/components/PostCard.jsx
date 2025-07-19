import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye, MapPin, Calendar, User } from 'lucide-react';
import { formatRelativeDate, capitalizeFirst } from '../utils/helpers';

const PostCard = ({ post }) => {
  const {
    _id,
    title,
    content,
    author,
    category,
    location,
    likes = [],
    comments = [],
    views = 0,
    createdAt
  } = post;

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="author-info">
          <div className="author-avatar">
            {author?.avatar ? (
              <img src={author.avatar} alt={author.username} />
            ) : (
              <div className="avatar-placeholder">
                <User size={20} />
              </div>
            )}
          </div>
          <div className="author-details">
            <Link to={`/profile/${author?._id}`} className="author-name">
              {author?.firstName} {author?.lastName}
            </Link>
            <div className="post-meta">
              <span className="post-time">
                <Calendar size={14} />
                {formatRelativeDate(createdAt)}
              </span>
              {location && (
                <span className="post-location">
                  <MapPin size={14} />
                  {location}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="post-category">
          <span className={`category-badge category-${category}`}>
            {capitalizeFirst(category)}
          </span>
        </div>
      </div>

      <div className="post-content">
        <Link to={`/post/${_id}`} className="post-title-link">
          <h3 className="post-title">{title}</h3>
        </Link>
        <p className="post-excerpt">
          {content.length > 200 ? `${content.slice(0, 200)}...` : content}
        </p>
      </div>

      <div className="post-footer">
        <div className="post-stats">
          <span className="stat-item">
            <Heart size={16} />
            {likes.length} {likes.length === 1 ? 'like' : 'likes'}
          </span>
          <span className="stat-item">
            <MessageCircle size={16} />
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
          <span className="stat-item">
            <Eye size={16} />
            {views} {views === 1 ? 'view' : 'views'}
          </span>
        </div>
        <Link to={`/post/${_id}`} className="read-more">
          Read More
        </Link>
      </div>

      <style jsx>{`
        .post-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          padding: 24px;
          margin-bottom: 24px;
          transition: box-shadow 0.2s ease;
        }

        .post-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .author-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
        }

        .author-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .author-name {
          font-weight: 600;
          color: #1e293b;
          text-decoration: none;
          font-size: 14px;
        }

        .author-name:hover {
          color: #3b82f6;
        }

        .post-meta {
          display: flex;
          gap: 16px;
          margin-top: 4px;
        }

        .post-time,
        .post-location {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #64748b;
          font-size: 12px;
        }

        .category-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-general {
          background: #f1f5f9;
          color: #475569;
        }

        .category-events {
          background: #fef3c7;
          color: #92400e;
        }

        .category-business {
          background: #d1fae5;
          color: #065f46;
        }

        .category-services {
          background: #dbeafe;
          color: #1e40af;
        }

        .category-community {
          background: #fce7f3;
          color: #be185d;
        }

        .category-news {
          background: #fee2e2;
          color: #991b1b;
        }

        .post-content {
          margin-bottom: 16px;
        }

        .post-title-link {
          text-decoration: none;
          color: inherit;
        }

        .post-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .post-title-link:hover .post-title {
          color: #3b82f6;
        }

        .post-excerpt {
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .post-stats {
          display: flex;
          gap: 20px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          font-size: 14px;
        }

        .read-more {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
        }

        .read-more:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .post-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .post-stats {
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default PostCard;
