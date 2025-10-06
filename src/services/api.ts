import axios from 'axios';
import { devApi } from './devApi';

// Use Railway backend URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ulgur-backend-production-53b2.up.railway.app';
console.log('🔧 API_BASE_URL:', API_BASE_URL);

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
    
    // Add language header
    const language = localStorage.getItem('language') || 'uz';
    config.headers['X-Language'] = language;
    
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
          // Try to refresh the token using the correct endpoint
          const response = await axios.post(`${API_BASE_URL}/webapp/auth/refresh?refresh_token=${refreshToken}`);
          
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
    const cacheKey = `post:${api.defaults.baseURL}/webapp/auth/login`;
    cache.delete(cacheKey); // Invalidate cache on login
    try {
      const response = await api.post('/webapp/auth/login', data);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  register: async (data: any) => {
    const cacheKey = `post:${api.defaults.baseURL}/webapp/auth/register`;
    cache.delete(cacheKey); // Invalidate cache on register
    return api.post('/webapp/auth/register', data);
  },
  logout: async () => {
    return api.post('/webapp/auth/logout');
  },
  getProfile: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/auth/me`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/auth/me');
      return response;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  },
  // New endpoint for Telegram WebApp authentication
  authenticate: async (initData: string) => {
    try {
      const response = await api.post('/webapp/auth/telegram', { initData });
      return response;
    } catch (error) {
      console.error('Telegram authentication failed:', error);
      throw error;
    }
  }
};

export const usersApi = {
  getUsers: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/users`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/users');
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: [] });
    }
  },
  checkUserExistsByTelegramId: async (telegramId: string) => {
    console.log('🔍 Checking if user exists by Telegram ID:', telegramId);
    console.log('🔍 API URL:', `${api.defaults.baseURL}/webapp/users/admin/telegram/${telegramId}`);
    
    try {
      // Use the public endpoint you created
      const endpoint = `/webapp/users/admin/telegram/${telegramId}`;
      console.log('🔧 Full endpoint:', endpoint);
      console.log('🔧 Full URL will be:', `${API_BASE_URL}${endpoint}`);
      const response = await api.get(endpoint);
      console.log('✅ API Response:', response.data);
      
      // The backend returns the user data directly, not wrapped in a "user" field
      if (response.data && response.data.role) {
        console.log('✅ User found in database:', response.data);
        return {
          data: {
            exists: true,
            role: response.data.role,
            user: response.data // The entire response is the user data
          }
        };
      } else {
        console.log('❌ No user data in response');
        return {
          data: {
            exists: false,
            role: null,
            user: null
          }
        };
      }
    } catch (error: any) {
      console.log('❌ API Error:', error.response?.status, error.response?.data);
      console.log('❌ Full error:', error);
      
      // If user not found (404), that's expected for unregistered users
      if (error.response?.status === 404) {
        console.log('✅ User not found (404) - user is not registered');
        return {
          data: {
            exists: false,
            role: null,
            user: null
          }
        };
      }
      
      // For other errors, still return not found
      return {
        data: {
          exists: false,
          role: null,
          user: null
        }
      };
    }
  },
  getUserById: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/users/${id}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/webapp/users/${id}`);
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: null });
    }
  },
  getMyProfile: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/users/me`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/users/me');
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: null });
    }
  },
  createUser: async (data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/users`;
    cache.delete(cacheKey); // Invalidate cache
    return api.post('/webapp/users', data);
  },
  updateUser: async (id: string, data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/users`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put(`/webapp/users/${id}`, data);
  },
  deleteUser: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/users`;
    cache.delete(cacheKey); // Invalidate cache
    return api.delete(`/webapp/users/${id}`);
  }
};

export const sellersApi = {
  getSellers: async () => {
    // Use development API in development mode
    if (process.env.NODE_ENV === 'development') {
      return devApi.sellers.getSellers();
    }
    
    const cacheKey = `get:${api.defaults.baseURL}/webapp/sellers`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/sellers');
      return response;
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
      throw error;
    }
  },
  getSellersNearby: async (lat: number, lng: number) => {
    // Use development API in development mode
    console.log('getSellersNearby: NODE_ENV =', process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'development') {
      console.log('getSellersNearby: Using devApi');
      return devApi.sellers.getSellers();
    }
    
    const cacheKey = `get:${api.defaults.baseURL}/webapp/sellers/nearby?lat=${lat}&lng=${lng}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/sellers/nearby', { params: { lat, lng } });
      return response;
    } catch (error) {
      console.error('Failed to fetch nearby sellers:', error);
      throw error;
    }
  },
  getSellerById: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/sellers/${id}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/webapp/sellers/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch seller:', error);
      throw error;
    }
  },
  getSellerProfile: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/sellers/profile`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/sellers/profile');
      return response;
    } catch (error) {
      console.error('Failed to get seller profile:', error);
      throw error;
    }
  },
  createSeller: async (data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/sellers`;
    cache.delete(cacheKey); // Invalidate cache
    return api.post('/webapp/sellers', data);
  },
  updateSeller: async (id: string, data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/sellers`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put(`/webapp/sellers/${id}`, data);
  },
  updateSellerProfile: async (data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/sellers/profile`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put('/webapp/sellers/profile', data);
  },
  deleteSeller: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/sellers`;
    cache.delete(cacheKey); // Invalidate cache
    return api.delete(`/webapp/sellers/${id}`);
  }
};

export const productsApi = {
  getProducts: async (params?: any) => {
    // Use development API in development mode
    if (process.env.NODE_ENV === 'development') {
      return devApi.products.getProducts(params);
    }
    
    const cacheKey = `get:${api.defaults.baseURL}/webapp/products${params ? `?${new URLSearchParams(params).toString()}` : ''}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/products', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },
  getProductsNearby: async (lat: number, lng: number) => {
    // Use development API in development mode
    console.log('getProductsNearby: NODE_ENV =', process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'development') {
      console.log('getProductsNearby: Using devApi');
      return devApi.products.getProducts({ lat, lng });
    }
    
    const cacheKey = `get:${api.defaults.baseURL}/webapp/products/nearby?lat=${lat}&lng=${lng}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/products/nearby', { params: { lat, lng } });
      return response;
    } catch (error) {
      console.error('Failed to fetch nearby products:', error);
      throw error;
    }
  },
  getProductsBySeller: async (sellerId: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/products/seller/${sellerId}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/webapp/products/seller/${sellerId}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch seller products:', error);
      throw error;
    }
  },
  getProductById: async (id: string) => {
    // Use development API in development mode
    if (process.env.NODE_ENV === 'development') {
      return devApi.products.getProductById(id);
    }
    
    const cacheKey = `get:${api.defaults.baseURL}/webapp/products/${id}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/webapp/products/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  },
  getSellerProducts: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/products/seller`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/products/seller');
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
    
    const cacheKey = `get:${api.defaults.baseURL}/webapp/products?q=${query}&category=${category || ''}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/products', { 
        params: { q: query, category } 
      });
      return response;
    } catch (error) {
      console.error('Failed to search products:', error);
      throw error;
    }
  },
  createProduct: async (data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/products`;
    cache.delete(cacheKey); // Invalidate cache
    return api.post('/webapp/products', data);
  },
  updateProduct: async (id: string, data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/products`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put(`/webapp/products/${id}`, data);
  },
  deleteProduct: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/products`;
    cache.delete(cacheKey); // Invalidate cache
    return api.delete(`/webapp/products/${id}`);
  }
};

export const ordersApi = {
  getOrders: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/orders`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/orders');
      return response;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  },
  getOrderById: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/orders/${id}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/webapp/orders/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch order:', error);
      throw error;
    }
  },
  getOrderByCode: async (code: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/orders/code/${code}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/webapp/orders/code/${code}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch order by code:', error);
      throw error;
    }
  },
  getMyOrders: async () => {
    // Use development API in development mode
    console.log('getMyOrders: NODE_ENV =', process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'development') {
      console.log('getMyOrders: Using devApi');
      return devApi.orders.getMyOrders();
    }
    
    const cacheKey = `get:${api.defaults.baseURL}/webapp/orders/my`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/orders/my');
      return response;
    } catch (error) {
      console.error('Failed to fetch my orders:', error);
      throw error;
    }
  },
  getUserOrders: async (userId: string) => {
    // Use development API in development mode
    if (process.env.NODE_ENV === 'development') {
      return devApi.orders.getUserOrders(userId);
    }
    
    const cacheKey = `get:${api.defaults.baseURL}/webapp/orders/user/${userId}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/webapp/orders/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
      throw error;
    }
  },
  getSellerOrders: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/orders/seller/my`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/orders/seller/my');
      return response;
    } catch (error) {
      console.error('Failed to fetch seller orders:', error);
      throw error;
    }
  },
  createOrder: async (data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/orders`;
    cache.delete(cacheKey); // Invalidate cache
    return api.post('/webapp/orders', data);
  },
  updateOrder: async (id: string, data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/orders`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put(`/webapp/orders/${id}`, data);
  },
  updateOrderStatus: async (orderId: string, status: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/orders`;
    cache.delete(cacheKey); // Invalidate cache
    return api.patch(`/webapp/orders/${orderId}/status`, { status });
  },
  deleteOrder: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/orders`;
    cache.delete(cacheKey); // Invalidate cache
    return api.delete(`/webapp/orders/${id}`);
  }
};

export const ratingsApi = {
  getRatings: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/ratings`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/ratings');
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: [] });
    }
  },
  getMyRatings: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/ratings/my`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/ratings/my');
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: [] });
    }
  },
  getRatingsByProduct: async (productId: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/ratings/product/${productId}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/webapp/ratings/product/${productId}`);
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: [] });
    }
  },
  getRatingsBySeller: async (sellerId: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/ratings/seller/${sellerId}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/webapp/ratings/seller/${sellerId}`);
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: [] });
    }
  },
  getAverageRatingByProduct: async (productId: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/ratings/product/${productId}/average`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/webapp/ratings/product/${productId}/average`);
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: { average: 0, count: 0 } });
    }
  },
  getAverageRatingBySeller: async (sellerId: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/ratings/seller/${sellerId}/average`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/webapp/ratings/seller/${sellerId}/average`);
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: { average: 0, count: 0 } });
    }
  },
  createRating: async (data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/ratings`;
    cache.delete(cacheKey); // Invalidate cache
    return api.post('/webapp/ratings', data);
  },
  updateRating: async (id: string, data: any) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/ratings`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put(`/webapp/ratings/${id}`, data);
  },
  deleteRating: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/ratings`;
    cache.delete(cacheKey); // Invalidate cache
    return api.delete(`/webapp/ratings/${id}`);
  }
};

export const adminApi = {
  getDashboard: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/admin/dashboard`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/admin/dashboard');
      return response;
    } catch (error) {
      console.error('Failed to fetch admin dashboard:', error);
      throw error;
    }
  },
  getUsers: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/users`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/users');
      return response;
    } catch (error) {
      console.error('Failed to fetch admin users:', error);
      throw error;
    }
  },
  getSellers: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/sellers`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/sellers');
      return response;
    } catch (error) {
      console.error('Failed to fetch admin sellers:', error);
      throw error;
    }
  },
  getOrders: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/orders`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/orders');
      return response;
    } catch (error) {
      console.error('Failed to fetch admin orders:', error);
      throw error;
    }
  },
  getOrdersBySeller: async (sellerId: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/orders/admin/seller/${sellerId}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/webapp/orders/admin/seller/${sellerId}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch orders by seller:', error);
      throw error;
    }
  },
  getUserByTelegramId: async (telegramId: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/users/admin/telegram/${telegramId}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/webapp/users/admin/telegram/${telegramId}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch user by telegram ID:', error);
      throw error;
    }
  },
  updateSellerStatus: async (sellerId: string, status: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/sellers`;
    cache.delete(cacheKey); // Invalidate cache
    return api.put(`/webapp/sellers/${sellerId}/status`, { status });
  },
  deleteUser: async (userId: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/users`;
    cache.delete(cacheKey); // Invalidate cache
    return api.delete(`/webapp/users/${userId}`);
  },
  deleteSeller: async (sellerId: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/sellers`;
    cache.delete(cacheKey); // Invalidate cache
    return api.delete(`/webapp/sellers/${sellerId}`);
  }
};

export const dashboardApi = {
  getSellerOrders: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/orders/seller/my`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/orders/seller/my');
      return response;
    } catch (error) {
      console.error('Failed to fetch seller orders:', error);
      throw error;
    }
  },
  getSellerStats: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/webapp/dashboard/stats`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/dashboard/stats');
      return response;
    } catch (error) {
      console.error('Failed to fetch seller stats:', error);
      throw error;
    }
  }
};

export const miniAppApi = {
  getHomeData: async () => {
    // Use development API in development mode
    if (process.env.NODE_ENV === 'development') {
      return devApi.products.getProducts();
    }
    
    const cacheKey = `get:${api.defaults.baseURL}/webapp/products`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/products');
      return response;
    } catch (error) {
      console.error('Failed to fetch home data:', error);
      throw error;
    }
  },
  searchProducts: async (query: string) => {
    // Use development API in development mode
    if (process.env.NODE_ENV === 'development') {
      return devApi.products.searchProducts(query);
    }
    
    const cacheKey = `get:${api.defaults.baseURL}/webapp/products?q=${query}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/webapp/products', { params: { q: query } });
      return response;
    } catch (error) {
      console.error('Failed to search products:', error);
      throw error;
    }
  }
};



