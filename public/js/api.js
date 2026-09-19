/**
 * Fonia Social Platform — API Client Layer
 */

const API_BASE = '/api';

const api = {
  // Users
  async getUsers(currentUserId = null) {
    const url = currentUserId ? `${API_BASE}/users?currentUserId=${currentUserId}` : `${API_BASE}/users`;
    const res = await fetch(url);
    return res.json();
  },

  async getUser(id, currentUserId = null) {
    const url = currentUserId ? `${API_BASE}/users/${id}?currentUserId=${currentUserId}` : `${API_BASE}/users/${id}`;
    const res = await fetch(url);
    return res.json();
  },

  async createUser(userData) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  async updateUser(id, updateData) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    return res.json();
  },

  async getUserPosts(userId, currentUserId = null) {
    const url = currentUserId 
      ? `${API_BASE}/users/${userId}/posts?currentUserId=${currentUserId}` 
      : `${API_BASE}/users/${userId}/posts`;
    const res = await fetch(url);
    return res.json();
  },

  async getUserLikes(userId, currentUserId = null) {
    const url = currentUserId 
      ? `${API_BASE}/users/${userId}/likes?currentUserId=${currentUserId}` 
      : `${API_BASE}/users/${userId}/likes`;
    const res = await fetch(url);
    return res.json();
  },

  async getUserFollowers(userId, currentUserId = null) {
    const url = currentUserId 
      ? `${API_BASE}/users/${userId}/followers?currentUserId=${currentUserId}` 
      : `${API_BASE}/users/${userId}/followers`;
    const res = await fetch(url);
    return res.json();
  },

  async getUserFollowing(userId, currentUserId = null) {
    const url = currentUserId 
      ? `${API_BASE}/users/${userId}/following?currentUserId=${currentUserId}` 
      : `${API_BASE}/users/${userId}/following`;
    const res = await fetch(url);
    return res.json();
  },

  async toggleFollow(targetUserId, followerId) {
    const res = await fetch(`${API_BASE}/users/${targetUserId}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerId })
    });
    return res.json();
  },

  // Posts
  async getPosts({ feed = 'all', tag = '', search = '', currentUserId = null } = {}) {
    const params = new URLSearchParams();
    if (feed) params.append('feed', feed);
    if (tag) params.append('tag', tag);
    if (search) params.append('search', search);
    if (currentUserId) params.append('currentUserId', currentUserId);

    const res = await fetch(`${API_BASE}/posts?${params.toString()}`);
    return res.json();
  },

  async getPost(id, currentUserId = null) {
    const url = currentUserId ? `${API_BASE}/posts/${id}?currentUserId=${currentUserId}` : `${API_BASE}/posts/${id}`;
    const res = await fetch(url);
    return res.json();
  },

  async createPost({ userId, content, imageUrl = '', tag = 'General' }) {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, content, imageUrl, tag })
    });
    return res.json();
  },

  async deletePost(id, userId) {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  async toggleLike(postId, userId) {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  // Comments
  async getComments(postId) {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
    return res.json();
  },

  async createComment({ postId, userId, content }) {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, content })
    });
    return res.json();
  },

  async deleteComment(commentId, userId) {
    const res = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  // File Upload
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  // Ecosystem
  async getEcosystem() {
    const res = await fetch(`${API_BASE}/fonia/ecosystem`);
    return res.json();
  }
};
