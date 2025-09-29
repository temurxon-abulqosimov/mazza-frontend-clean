import axios from 'axios';
import { mockSellers, mockProducts } from './mockData';

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
    return api.post('/auth/login', data);
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
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: { role: 'user', id: 1, name: 'Mock User' } });
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
    const cacheKey = `get:${api.defaults.baseURL}/sellers`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/sellers');
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: mockSellers });
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
      console.warn('API call failed, using mock data');
      const mockSeller = mockSellers.find(s => s.id.toString() === id);
      return Promise.resolve({ data: mockSeller || null });
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
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: mockSellers[0] });
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
    const cacheKey = `get:${api.defaults.baseURL}/products${params ? `?${new URLSearchParams(params).toString()}` : ''}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/products', { params });
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: mockProducts });
    }
  },
  getProductById: async (id: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/products/${id}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/products/${id}`);
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      const mockProduct = mockProducts.find(p => p.id.toString() === id);
      return Promise.resolve({ data: mockProduct || null });
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
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: mockProducts });
    }
  },
  searchProducts: async (query: string, category?: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/products/search?q=${query}&category=${category || ''}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/products/search', { 
        params: { q: query, category } 
      });
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      const filteredProducts = mockProducts.filter(p => 
        p.description.toLowerCase().includes(query.toLowerCase())
      );
      return Promise.resolve({ data: filteredProducts });
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
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: [] });
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
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: null });
    }
  },
  getUserOrders: async (userId: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/orders/user/${userId}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get(`/orders/user/${userId}`);
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: [] });
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
      console.warn('API call failed, using mock data');
      return Promise.resolve({ 
        data: {
          totalUsers: 0, 
          totalSellers: 0, 
          totalProducts: 0, 
          totalOrders: 0,
          recentOrders: [],
          topSellers: []
        }
      });
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
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: [] });
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
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: [] });
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
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: [] });
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
      console.warn('API call failed, using mock data');
      return Promise.resolve({ data: [] });
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
      console.warn('API call failed, using mock data');
      return Promise.resolve({ 
        data: {
          totalOrders: 0, 
          totalRevenue: 0, 
          totalProducts: 0,
          pendingOrders: 0
        } 
      });
    }
  }
};

export const miniAppApi = {
  getHomeData: async () => {
    const cacheKey = `get:${api.defaults.baseURL}/mini-app/home`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/mini-app/home');
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      return Promise.resolve({ 
        data: { 
          products: mockProducts,
          sellers: mockSellers
        } 
      });
    }
  },
  searchProducts: async (query: string) => {
    const cacheKey = `get:${api.defaults.baseURL}/mini-app/search?q=${query}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) return Promise.resolve({ data: cachedData });
    
    try {
      const response = await api.get('/mini-app/search', { params: { q: query } });
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data');
      const filteredProducts = mockProducts.filter(p => 
        p.description.toLowerCase().includes(query.toLowerCase())
      );
      return Promise.resolve({ data: filteredProducts });
    }
  }
};


