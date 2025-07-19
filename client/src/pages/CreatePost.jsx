import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { postService } from '../services/postService';
import toast from 'react-hot-toast';

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
    <div className="container py-4">
      <div className="create-post-container">
        <div className="create-post-header">
          <h1>Create New Post</h1>
          <p>Share something with your community</p>
        </div>

        <div className="create-post-form card card-padding">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="Enter a descriptive title"
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
                <div className="form-error">{errors.title.message}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className={`form-input form-select ${errors.category ? 'error' : ''}`}
                {...register('category', {
                  required: 'Category is required'
                })}
              >
                <option value="">Select a category</option>
                <option value="general">General</option>
                <option value="events">Events</option>
                <option value="business">Business</option>
                <option value="services">Services</option>
                <option value="community">Community</option>
                <option value="news">News</option>
              </select>
              {errors.category && (
                <div className="form-error">{errors.category.message}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea
                className={`form-input form-textarea ${errors.content ? 'error' : ''}`}
                placeholder="What would you like to share?"
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
                <div className="form-error">{errors.content.message}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="Where is this happening? (optional)"
                {...register('location', {
                  maxLength: {
                    value: 100,
                    message: 'Location cannot exceed 100 characters'
                  }
                })}
              />
              {errors.location && (
                <div className="form-error">{errors.location.message}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter tags separated by commas (e.g., event, community, food)"
                {...register('tags')}
              />
              <small className="form-help">
                Add relevant tags to help others find your post
              </small>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    Creating...
                  </>
                ) : (
                  'Create Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .create-post-container {
          max-width: 700px;
          margin: 0 auto;
        }

        .create-post-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .create-post-header h1 {
          font-size: 32px;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .create-post-header p {
          color: #64748b;
          font-size: 16px;
        }

        .form-textarea {
          resize: vertical;
          min-height: 150px;
        }

        .form-help {
          color: #64748b;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        .form-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .form-input.error {
          border-color: #ef4444;
        }

        @media (max-width: 640px) {
          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CreatePost;
