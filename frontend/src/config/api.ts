// API 配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_URL = `${API_BASE_URL}/api/v1`;

export const endpoints = {
  // Auth
  login: `${API_URL}/auth/login`,
  me: `${API_URL}/auth/me`,

  // Posts
  posts: `${API_URL}/posts`,
  post: (id: string) => `${API_URL}/posts/${id}`,

  // Categories
  categories: `${API_URL}/categories`,

  // Tags
  tags: `${API_URL}/tags`,
};
