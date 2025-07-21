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
  Trash2,
  Send
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
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [commentLikingId, setCommentLikingId] = useState(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostData, setEditPostData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    location: ''
  });
  const [isDeletingPost, setIsDeletingPost] = useState(false);

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
        // Fix: Check both user._id and user.id, and handle both string and object comparison
        const userId = user?._id || user?.id;
        setIsLiked(response.post.likes?.some(like => {
          const likeUserId = like.user?._id || like.user?.id || like.user;
          return likeUserId === userId;
        }) || false);
        setComments(response.post.comments || []);
        
        // Debug logging
        console.log('User:', user);
        console.log('Post likes:', response.post.likes);
        console.log('Post comments:', response.post.comments);
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
        setIsLiked(response.liked);
        setLikesCount(response.likeCount);
        toast.success(response.liked ? 'Post liked!' : 'Post unliked');
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Failed to like post');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setIsSubmittingComment(true);
      const response = await postService.addComment(id, newComment.trim());
      
      if (response.success) {
        setComments(response.comments);
        setNewComment('');
        toast.success('Comment added successfully!');
      }
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) {
      toast.error('Please login to delete comments');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      setDeletingCommentId(commentId);
      const response = await postService.deleteComment(id, commentId);
      
      if (response.success) {
        setComments(response.comments);
        toast.success('Comment deleted successfully!');
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      toast.error('Failed to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
  };

  const handleSaveEditComment = async (commentId) => {
    if (!user) {
      toast.error('Please login to edit comments');
      return;
    }

    if (!editingCommentText.trim()) {
      toast.error('Please enter comment text');
      return;
    }

    try {
      const response = await postService.editComment(id, commentId, editingCommentText.trim());
      
      if (response.success) {
        setComments(response.comments);
        setEditingCommentId(null);
        setEditingCommentText('');
        toast.success('Comment updated successfully!');
      }
    } catch (error) {
      console.error('Edit comment error:', error);
      toast.error('Failed to edit comment');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleCommentLike = async (commentId) => {
    if (!user) {
      toast.error('Please login to like comments');
      return;
    }

    try {
      setCommentLikingId(commentId);
      const response = await postService.toggleCommentLike(id, commentId);
      
      if (response.success) {
        // Update the comment in the local state
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment._id === commentId) {
              const userId = user._id || user.id;
              const isCurrentlyLiked = comment.likes?.some(like => {
                const likeUserId = like.user?._id || like.user?.id || like.user;
                return likeUserId === userId;
              });
              
              return {
                ...comment,
                likes: response.liked 
                  ? [...(comment.likes || []), { user: userId, createdAt: new Date() }]
                  : (comment.likes || []).filter(like => {
                      const likeUserId = like.user?._id || like.user?.id || like.user;
                      return likeUserId !== userId;
                    })
              };
            }
            return comment;
          })
        );
        
        toast.success(response.liked ? 'Comment liked!' : 'Comment unliked');
      }
    } catch (error) {
      console.error('Comment like error:', error);
      toast.error('Failed to like comment');
    } finally {
      setCommentLikingId(null);
    }
  };

  const handleEditPost = () => {
    setEditPostData({
      title: post.title,
      content: post.content,
      category: post.category,
      tags: post.tags || [],
      location: post.location || ''
    });
    setIsEditingPost(true);
  };

  const handleSavePost = async () => {
    if (!editPostData.title.trim() || !editPostData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const response = await postService.updatePost(id, editPostData);
      
      if (response.success) {
        setPost(response.post);
        setIsEditingPost(false);
        toast.success('Post updated successfully!');
      }
    } catch (error) {
      console.error('Update post error:', error);
      toast.error('Failed to update post');
    }
  };

  const handleCancelEditPost = () => {
    setIsEditingPost(false);
    setEditPostData({
      title: '',
      content: '',
      category: '',
      tags: [],
      location: ''
    });
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeletingPost(true);
      const response = await postService.deletePost(id);
      
      if (response.success) {
        toast.success('Post deleted successfully!');
        navigate('/');
      }
    } catch (error) {
      console.error('Delete post error:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeletingPost(false);
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
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleEditPost}
                      disabled={isEditingPost}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50"
                      title="Edit post"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleDeletePost}
                      disabled={isDeletingPost}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                      title="Delete post"
                    >
                      {isDeletingPost ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isEditingPost ? (
              <div className="space-y-4">
                {/* Edit Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editPostData.title}
                    onChange={(e) => setEditPostData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Post title"
                    maxLength="200"
                  />
                </div>

                {/* Edit Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={editPostData.category}
                    onChange={(e) => setEditPostData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="events">Events</option>
                    <option value="business">Business</option>
                    <option value="services">Services</option>
                    <option value="community">Community</option>
                    <option value="news">News</option>
                  </select>
                </div>

                {/* Edit Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location (optional)</label>
                  <input
                    type="text"
                    value={editPostData.location}
                    onChange={(e) => setEditPostData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Location"
                    maxLength="100"
                  />
                </div>

                {/* Edit Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editPostData.tags.join(', ')}
                    onChange={(e) => setEditPostData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={handleCancelEditPost}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePost}
                    disabled={!editPostData.title.trim() || !editPostData.content.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Post Body */}
          <div className="p-8">
            {isEditingPost ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <div className="relative">
                  <textarea
                    value={editPostData.content}
                    onChange={(e) => setEditPostData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="10"
                    placeholder="What's on your mind?"
                    maxLength="2000"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {editPostData.content.length}/2000
                  </div>
                </div>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            )}
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
                  <span>{comments?.length || 0} {comments?.length === 1 ? 'comment' : 'comments'}</span>
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

        {/* Comments Section */}
        <div className="mt-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8 border-b border-gray-200/50">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <MessageCircle className="w-6 h-6" />
              <span>Comments ({comments?.length || 0})</span>
              {/* Debug info - remove after testing */}
              <div className="ml-4 text-sm text-gray-500">
                {user ? `Logged in as: ${user.firstName || user.username}` : 'Not logged in'}
              </div>
            </h3>

            {/* Add Comment Form */}
            {user ? (
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                        rows="3"
                        maxLength="500"
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                        {newComment.length}/500
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-sm text-gray-500">
                        Posting as {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                      </div>
                      <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="inline-flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
                      >
                        {isSubmittingComment ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Posting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Post Comment</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-800 text-center">
                  <Link to="/login" className="font-medium hover:underline">
                    Sign in
                  </Link> to join the conversation
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {comment.user?.firstName?.charAt(0) || comment.user?.username?.charAt(0) || 'U'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {comment.user?.firstName ? 
                              `${comment.user.firstName} ${comment.user.lastName}` : 
                              comment.user?.username || 'Anonymous'
                            }
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatRelativeDate(comment.createdAt)}
                          </span>
                        </div>
                      </div>
                      {editingCommentId === comment._id ? (
                        <div className="mt-2">
                          <div className="relative">
                            <textarea
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                              rows="3"
                              maxLength="500"
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                              {editingCommentText.length}/500
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEditComment(comment._id)}
                              disabled={!editingCommentText.trim()}
                              className="px-4 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {comment.text}
                          </p>
                          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              (edited)
                            </p>
                          )}
                          
                          {/* Comment Actions */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                              {/* Like Button */}
                              <button
                                onClick={() => handleCommentLike(comment._id)}
                                disabled={commentLikingId === comment._id}
                                className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm transition-all duration-200 ${
                                  (() => {
                                    if (!user) return 'text-gray-500 hover:text-gray-600';
                                    
                                    const userId = user._id || user.id;
                                    const isLiked = comment.likes?.some(like => {
                                      const likeUserId = like.user?._id || like.user?.id || like.user;
                                      return likeUserId === userId;
                                    });
                                    
                                    return isLiked 
                                      ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                                      : 'text-gray-500 hover:text-red-600 hover:bg-red-50';
                                  })()
                                }`}
                              >
                                {commentLikingId === comment._id ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Heart className={`w-4 h-4 ${
                                    (() => {
                                      if (!user) return '';
                                      
                                      const userId = user._id || user.id;
                                      const isLiked = comment.likes?.some(like => {
                                        const likeUserId = like.user?._id || like.user?.id || like.user;
                                        return likeUserId === userId;
                                      });
                                      
                                      return isLiked ? 'fill-current' : '';
                                    })()
                                  }`} />
                                )}
                                <span>{comment.likes?.length || 0}</span>
                              </button>

                              {/* Edit and Delete Buttons (only for comment owner) */}
                              {(() => {
                                if (!user) return null;
                                
                                const userId = user._id || user.id;
                                const commentUserId = comment.user?._id || comment.user?.id;
                                const canModify = userId === commentUserId;
                                
                                return canModify ? (
                                  <>
                                    <button
                                      onClick={() => handleEditComment(comment._id, comment.text)}
                                      disabled={editingCommentId === comment._id}
                                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50"
                                      title="Edit comment"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment._id)}
                                      disabled={deletingCommentId === comment._id}
                                      className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                      title="Delete comment"
                                    >
                                      {deletingCommentId === comment._id ? (
                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </button>
                                  </>
                                ) : null;
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">No comments yet</p>
                  <p className="text-sm">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
