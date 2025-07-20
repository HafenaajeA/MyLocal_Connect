import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye, MapPin, Calendar, User, ArrowRight } from 'lucide-react';
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

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      events: 'bg-blue-100 text-blue-800',
      business: 'bg-green-100 text-green-800',
      services: 'bg-purple-100 text-purple-800',
      community: 'bg-yellow-100 text-yellow-800',
      news: 'bg-red-100 text-red-800'
    };
    return colors[category] || colors.general;
  };

  return (
    <article className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl border border-white/20 transition-all duration-300 hover:bg-white/80 group">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
            {author?.firstName?.charAt(0) || 'U'}{author?.lastName?.charAt(0) || ''}
          </div>
          <div>
            <Link 
              to={`/profile/${author?._id}`} 
              className="font-semibold text-gray-800 hover:text-blue-600 transition-colors"
            >
              {author?.firstName} {author?.lastName}
            </Link>
            <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatRelativeDate(createdAt)}</span>
              </div>
              {location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
          {capitalizeFirst(category)}
        </span>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <Link to={`/post/${_id}`} className="group">
          <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-gray-600 leading-relaxed">
          {content.length > 200 ? `${content.slice(0, 200)}...` : content}
        </p>
      </div>

      {/* Post Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <Heart className="w-4 h-4" />
            <span>{likes.length}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <MessageCircle className="w-4 h-4" />
            <span>{comments.length}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <Eye className="w-4 h-4" />
            <span>{views}</span>
          </div>
        </div>
        <Link 
          to={`/post/${_id}`} 
          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors group"
        >
          <span>Read More</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
};

export default PostCard;
