import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { postService } from '../services/postService';
import toast from 'react-hot-toast';
import { 
  PenTool, 
  Send, 
  X, 
  MapPin, 
  Tag, 
  FileText, 
  Calendar,
  Users,
  Briefcase,
  Settings,
  Megaphone,
  Globe,
  Loader2
} from 'lucide-react';

const CreatePost = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const createPostMutation = useMutation(postService.createPost, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Post created successfully!');
        reset();
        navigate('/');
      } else {
        toast.error(data.message || 'Failed to create post');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create post');
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const getCategoryIcon = (category) => {
    const icons = {
      general: Globe,
      events: Calendar,
      business: Briefcase,
      services: Settings,
      community: Users,
      news: Megaphone
    };
    return icons[category] || Globe;
  };

  const categories = [
    { value: '', label: 'Select a category', icon: null },
    { value: 'general', label: 'General', icon: Globe },
    { value: 'events', label: 'Events', icon: Calendar },
    { value: 'business', label: 'Business', icon: Briefcase },
    { value: 'services', label: 'Services', icon: Settings },
    { value: 'community', label: 'Community', icon: Users },
    { value: 'news', label: 'News', icon: Megaphone }
  ];

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    // Convert tags string to array
    const tags = data.tags 
      ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];

    const postData = {
      ...data,
      tags
    };

    createPostMutation.mutate(postData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
              <PenTool className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Create New Post
          </h1>
          <p className="text-xl text-gray-600 max-w-md mx-auto">
            Share something meaningful with your community
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4" />
                <span>Title *</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 bg-white/50 backdrop-blur-sm border rounded-xl 
                         text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.title ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Enter a descriptive title..."
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 5,
                    message: 'Title must be at least 5 characters'
                  },
                  maxLength: {
                    value: 200,
                    message: 'Title cannot exceed 200 characters'
                  }
                })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm flex items-center space-x-1">
                  <X className="w-4 h-4" />
                  <span>{errors.title.message}</span>
                </p>
              )}
            </div>

            {/* Category Field */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <Tag className="w-4 h-4" />
                <span>Category *</span>
              </label>
              <select
                className={`w-full px-4 py-3 bg-white/50 backdrop-blur-sm border rounded-xl 
                         text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent transition-all duration-200 ${
                  errors.category ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
                {...register('category', {
                  required: 'Category is required'
                })}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} disabled={!cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm flex items-center space-x-1">
                  <X className="w-4 h-4" />
                  <span>{errors.category.message}</span>
                </p>
              )}
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4" />
                <span>Content *</span>
              </label>
              <textarea
                className={`w-full px-4 py-3 bg-white/50 backdrop-blur-sm border rounded-xl 
                         text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition-all duration-200 
                         resize-none ${
                  errors.content ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="What would you like to share with your community?"
                rows="8"
                {...register('content', {
                  required: 'Content is required',
                  minLength: {
                    value: 10,
                    message: 'Content must be at least 10 characters'
                  },
                  maxLength: {
                    value: 2000,
                    message: 'Content cannot exceed 2000 characters'
                  }
                })}
              />
              {errors.content && (
                <p className="text-red-500 text-sm flex items-center space-x-1">
                  <X className="w-4 h-4" />
                  <span>{errors.content.message}</span>
                </p>
              )}
            </div>

            {/* Location Field */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 bg-white/50 backdrop-blur-sm border rounded-xl 
                         text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.location ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Where is this happening?"
                {...register('location', {
                  maxLength: {
                    value: 100,
                    message: 'Location cannot exceed 100 characters'
                  }
                })}
              />
              {errors.location && (
                <p className="text-red-500 text-sm flex items-center space-x-1">
                  <X className="w-4 h-4" />
                  <span>{errors.location.message}</span>
                </p>
              )}
            </div>

            {/* Tags Field */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <Tag className="w-4 h-4" />
                <span>Tags</span>
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 
                         rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         hover:border-gray-300 transition-all duration-200"
                placeholder="Enter tags separated by commas (e.g., event, community, food)"
                {...register('tags')}
              />
              <p className="text-gray-500 text-sm flex items-center space-x-1">
                <Tag className="w-3 h-3" />
                <span>Add relevant tags to help others find your post</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-200 
                         hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed 
                         text-gray-700 rounded-xl font-medium transition-all duration-200 
                         transform hover:scale-105 disabled:transform-none"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center space-x-2 px-6 py-3 
                         bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 
                         hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 
                         disabled:cursor-not-allowed text-white rounded-xl font-medium 
                         transition-all duration-200 transform hover:scale-105 
                         disabled:transform-none shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Create Post</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Card */}
        <div className="mt-8 bg-blue-50/70 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Tips for a Great Post</span>
          </h3>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Use a clear, descriptive title that captures the main idea</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Choose the most relevant category to help others find your post</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Add location if your post is about a specific place or event</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Use tags to make your post more discoverable</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
