import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Log API configuration in development
if (import.meta.env.DEV) {
  console.log('🚀 API Configuration:');
  console.log('📡 Base URL:', API_BASE_URL);
  console.log('🌐 Frontend URL:', window.location.origin);
  console.log('⚙️ Environment:', import.meta.env.MODE);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export interface NewsFilters {
  page?: number;
  limit?: number;
  category?: string;
  state?: string;
  trending?: boolean;
  featured?: boolean;
  search?: string;
}

export const fetchNews = async (filters: NewsFilters = {}) => {
  const response = await api.get('/news', { params: filters });
  return response.data;
};

export const fetchNewsById = async (slug: string) => {
  const response = await api.get(`/news/${slug}`);
  return response.data;
};

export const fetchTrendingNews = async () => {
  const response = await api.get('/news/trending/latest');
  return response.data;
};

export const fetchFeaturedNews = async () => {
  const response = await api.get('/news/featured/latest');
  return response.data;
};

export const fetchNewsByCategory = async (category: string, filters: NewsFilters = {}) => {
  const response = await api.get(`/news/category/${category}`, { params: filters });
  return response.data;
};

export const fetchCategories = async () => {
  const response = await api.get('/news/meta/categories');
  return response.data;
};

export const updateEngagement = async (newsId: string, action: 'like' | 'share') => {
  const response = await api.patch(`/news/${newsId}/engagement`, { action });
  return response.data;
};

export const searchNews = async (query: string, filters: NewsFilters = {}) => {
  const response = await api.get('/news', { 
    params: { ...filters, search: query } 
  });
  return response.data;
};