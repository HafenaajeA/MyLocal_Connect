import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  MapPin, 
  Calendar, 
  User, 
  ArrowLeft,
  Tag,
  Share2,
  MoreVertical,
  Edit3,
  Trash2
} from 'lucide-react';
import { formatRelativeDate, capitalizeFirst } from '../utils/helpers';
import toast from 'react-hot-toast';

const PostDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await postService.getPostById(id);
      if (response.success) {
        setPost(response.post);
        setLikesCount(response.post.likes?.length || 0);
        setIsLiked(response.post.likes?.includes(user?._id) || false);
      } else {
        setError('Post not found');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await postService.likePost(id);
      if (response.success) {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        toast.success(isLiked ? 'Post unliked' : 'Post liked');
      }
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.slice(0, 100) + '...',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Post Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The post you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Post Content */}
        <article className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Post Header */}
          <div className="p-8 border-b border-gray-200/50">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                  {post.author?.firstName?.charAt(0) || 'U'}{post.author?.lastName?.charAt(0) || ''}
                </div>
                <div>
                  <Link 
                    to={`/profile/${post.author?._id}`}
                    className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    {post.author?.firstName} {post.author?.lastName}
                  </Link>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatRelativeDate(post.createdAt)}</span>
                    </div>
                    {post.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{post.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
                  {capitalizeFirst(post.category)}
                </span>
                {user && user._id === post.author?._id && (
                  <div className="relative">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Post Body */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
          </div>

          {/* Post Footer */}
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isLiked 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
                </button>
                
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comments?.length || 0} {post.comments?.length === 1 ? 'comment' : 'comments'}</span>
                </div>
                
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                  <Eye className="w-5 h-5" />
                  <span>{post.views || 0} {post.views === 1 ? 'view' : 'views'}</span>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-all duration-200"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </article>

        {/* Comments Section Placeholder */}
        <div className="mt-8 bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <MessageCircle className="w-6 h-6" />
            <span>Comments</span>
          </h3>
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Comments feature coming soon!</p>
            <p className="text-sm">Join the conversation when this feature is available.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
