import api from './axios';

export const authApi = {
    getCsrf: () => api.get('/auth/csrf'),
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
};

export const postsApi = {
    getAll: (params) => api.get('/posts', { params }),
    getFeatured: () => api.get('/posts/featured'),
    getBySlug: (slug) => api.get(`/posts/${slug}`),
    getMy: (params) => api.get('/posts/my', { params }),
    create: (data) => api.post('/posts', data),
    update: (id, data) => api.put(`/posts/${id}`, data),
    delete: (id) => api.delete(`/posts/${id}`),
};

export const commentsApi = {
    add: (postId, data) => api.post(`/comments/post/${postId}`, data),
    getForPost: (postId) => api.get(`/posts/${postId}/comments`),
    delete: (id) => api.delete(`/comments/${id}`),
};

export const usersApi = {
    getProfile: (id) => api.get(`/users/${id}`),
    updateProfile: (_id, data) => api.patch('/users/me', data),
};

export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    deletePost: (id) => api.delete(`/admin/posts/${id}`),
    getUsers: (params) => api.get('/admin/users', { params }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
    getPosts: (params) => api.get('/admin/posts', { params }),
};
