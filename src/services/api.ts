import axios from 'axios';
import { devApi } from './devApi';

// Use Railway backend URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ulgur-backend-production-53b2.up.railway.app/webapp';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Increased timeout for production
});

// Request interceptor to add authentication headers
api.interceptors.request.use(
  (config) => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Also include Telegram init data if available
    const initData = localStorage.getItem('telegramInitData');
    if (initData) {
      config.headers['X-Telegram-Init-Data'] = initData;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token, refresh_token: newRefreshToken } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);
          
          // Retry the original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login or clear tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userRole');
        window.location.reload();
      }
    }
    
    return Promise.reject(error);
  }
);

// Cache interceptor
const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Response interceptor for caching
api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get') {
      const cacheKey = `${response.config.method}:${response.config.url}`;
      setCachedData(cacheKey, response.data);
    }
    return response;
  },
  (error) => {
    if (error.config?.method === 'get') {
      const cacheKey = `${error.config.method}:${error.config.url}`;
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return Promise.resolve({ data: cachedData });
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authApi = {
  login: async (data: any) => {
    const cacheKey = `post:${api.defaults.baseURL}/auth/login`;
    cache.delete(cacheKey); // Invalidate cache on login
    try {
      const response = await api.post('/auth/login', data);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  register: async (data: any) => {
    const cacheKey = `post:${api.defaults.baseURL}/auth/register`;
    cache.delete(cacheKey); // Invalidate cache on register
    return api.post('/auth/register', data);
  },
  logout: async () => {
    return api.post('/auth/logout');
  },
  getProfile: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/auth/profile`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/auth/profile');
      return response;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  },
  // New endpoint for Telegram WebApp authentication
  authenticate: async (initData: string) => {
    try {
      const response = await api.post('/auth/telegram', { initData });
      return response;
    } catch (error) {
      console.error('Telegram authentication failed:', error);
      throw error;
    }
  }
};

export const usersApi = {
  getUsers: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/users`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/users');
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: [] });
    }
  },
  getUserById: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/users/${id}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/users/${id}`);
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: null });
    }
  },
  createUser: async (data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/users`;
    cache.delete(cacheKey); // Invalidate cache
    return api.post('/users', data);
  },
  updateUser: async (id: string, data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/users`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put(`/users/${id}`, data);
  },
  deleteUser: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/users`;
    cache.delete(cacheKey); // Invalidate cache
    return api.delete(`/users/${id}`);
  }
};

export const sellersApi = {
  getSellers: async () => {
    // Use development API in development mode
    if (process.env.NODE_ENV === 'development') {
      return devApi.sellers.getSellers();
    }
    
    const cacheKey = `get:${api.defaults.baseURL}/sellers`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/sellers');
      return response;
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
      throw error;
    }
  },
  getSellerById: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/sellers/${id}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/sellers/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch seller:', error);
      throw error;
    }
  },
  getSellerProfile: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/sellers/profile`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/sellers/profile');
      return response;
    } catch (error) {
      console.error('Failed to get seller profile:', error);
      throw error;
    }
  },
  createSeller: async (data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/sellers`;
    cache.delete(cacheKey); // Invalidate cache
    return api.post('/sellers', data);
  },
  updateSeller: async (id: string, data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/sellers`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put(`/sellers/${id}`, data);
  },
  updateSellerProfile: async (data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/sellers/profile`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put('/sellers/profile', data);
  },
  deleteSeller: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/sellers`;
    cache.delete(cacheKey); // Invalidate cache
    return api.delete(`/sellers/${id}`);
  }
};

export const productsApi = {
  getProducts: async (params?: any) => {
    // Use development API in development mode
    if (process.env.NODE_ENV === 'development') {
      return devApi.products.getProducts(params);
    }
    
    // Check if user is authenticated in production
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    const cacheKey = `get:${api.defaults.baseURL}/discovery/products${params ? `?${new URLSearchParams(params).toString()}` : ''}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/discovery/products', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },
  getProductById: async (id: string) => {
    // Use development API in development mode
    if (process.env.NODE_ENV === 'development') {
      return devApi.products.getProductById(id);
    }
    
    const cacheKey = `get:${api.defaults.baseURL}/discovery/products/${id}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/discovery/products/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  },
  getSellerProducts: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/products/seller`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/products/seller');
      return response;
    } catch (error) {
      console.error('Failed to get seller products:', error);
      throw error;
    }
  },
  searchProducts: async (query: string, category?: string) => {
    // Use development API in development mode
    if (process.env.NODE_ENV === 'development') {
      return devApi.products.searchProducts(query, category);
    }
    
    const cacheKey = `get:${api.defaults.baseURL}/discovery/products?q=${query}&category=${category || ''}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/discovery/products', { 
        params: { q: query, category } 
      });
      return response;
    } catch (error) {
      console.error('Failed to search products:', error);
      throw error;
    }
  },
  createProduct: async (data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/products`;
    cache.delete(cacheKey); // Invalidate cache
    return api.post('/products', data);
  },
  updateProduct: async (id: string, data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/products`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put(`/products/${id}`, data);
  },
  deleteProduct: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/products`;
    cache.delete(cacheKey); // Invalidate cache
    return api.delete(`/products/${id}`);
  }
};

export const ordersApi = {
  getOrders: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/orders`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/orders');
      return response;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  },
  getOrderById: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/orders/${id}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/orders/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch order:', error);
      throw error;
    }
  },
  getUserOrders: async (userId: string) => {
    // Use development API in development mode
    if (process.env.NODE_ENV === 'development') {
      return devApi.orders.getUserOrders(userId);
    }
    
    const cacheKey = `get:${api.defaults.baseURL}/orders/user/${userId}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/orders/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
      throw error;
    }
  },
  createOrder: async (data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/orders`;
    cache.delete(cacheKey); // Invalidate cache
    return api.post('/orders', data);
  },
  updateOrder: async (id: string, data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/orders`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put(`/orders/${id}`, data);
  },
  updateOrderStatus: async (orderId: string, status: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/orders`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put(`/orders/${orderId}/status`, { status });
  },
  deleteOrder: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/orders`;
    cache.delete(cacheKey); // Invalidate cache
    return api.delete(`/orders/${id}`);
  }
};

export const ratingsApi = {
  getRatings: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/ratings`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/ratings');
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: [] });
    }
  },
  createRating: async (data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/ratings`;
    cache.delete(cacheKey); // Invalidate cache
    return api.post('/ratings', data);
  },
  updateRating: async (id: string, data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/ratings`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put(`/ratings/${id}`, data);
  },
  deleteRating: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/ratings`;
    cache.delete(cacheKey); // Invalidate cache
    return api.delete(`/ratings/${id}`);
  }
};

export const adminApi = {
  getDashboard: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/admin/dashboard`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/admin/dashboard');
      return response;
    } catch (error) {
      console.error('Failed to fetch admin dashboard:', error);
      throw error;
    }
  },
  getUsers: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/admin/users`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/admin/users');
      return response;
    } catch (error) {
      console.error('Failed to fetch admin users:', error);
      throw error;
    }
  },
  getSellers: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/admin/sellers`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/admin/sellers');
      return response;
    } catch (error) {
      console.error('Failed to fetch admin sellers:', error);
      throw error;
    }
  },
  getOrders: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/admin/orders`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/admin/orders');
      return response;
    } catch (error) {
      console.error('Failed to fetch admin orders:', error);
      throw error;
    }
  },
  updateSellerStatus: async (sellerId: string, status: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/admin/sellers`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put(`/admin/sellers/${sellerId}/status`, { status });
  },
  deleteUser: async (userId: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/admin/users`;
    cache.delete(cacheKey); // Invalidate cache
    return api.delete(`/admin/users/${userId}`);
  },
  deleteSeller: async (sellerId: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/admin/sellers`;
    cache.delete(cacheKey); // Invalidate cache
    return api.delete(`/admin/sellers/${sellerId}`);
  }
};

export const dashboardApi = {
  getSellerOrders: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/dashboard/orders`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/dashboard/orders');
      return response;
    } catch (error) {
      console.error('Failed to fetch seller orders:', error);
      throw error;
    }
  },
  getSellerStats: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/dashboard/stats`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/dashboard/stats');
      return response;
    } catch (error) {
      console.error('Failed to fetch seller stats:', error);
      throw error;
    }
  }
};

export const miniAppApi = {
  getHomeData: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/mini-app/entry`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/mini-app/entry');
      return response;
    } catch (error) {
      console.error('Failed to fetch home data:', error);
      throw error;
    }
  },
  searchProducts: async (query: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/discovery/products?q=${query}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/discovery/products', { params: { q: query } });
      return response;
    } catch (error) {
      console.error('Failed to search products:', error);
      throw error;
    }
  }
};



