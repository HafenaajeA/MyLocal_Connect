import api from './api';

export const postService = {
  // Get all posts with pagination and filters
  getPosts: async (params = {}) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  // Get single post by ID
  getPost: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // Get single post by ID (alias for compatibility)
  getPostById: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // Create new post
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  // Update post
  updatePost: async (id, postData) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },

  // Delete post
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  // Like/Unlike post
  toggleLike: async (id) => {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  },

  // Like post (alias for compatibility)
  likePost: async (id) => {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  },

  // Add comment to post
  addComment: async (id, text) => {
    const response = await api.post(`/posts/${id}/comment`, { text });
    return response.data;
  },

  // Delete comment from post
  deleteComment: async (postId, commentId) => {
    const response = await api.delete(`/posts/${postId}/comment/${commentId}`);
    return response.data;
  }
};
