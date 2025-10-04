// Mock API that always returns success to test if API calls are causing the white screen
export const mockApi = {
  productsApi: {
    getProducts: async () => Promise.resolve({ data: [] }),
    getProductById: async (id: string) => Promise.resolve({ data: null }),
    getSellerProducts: async () => Promise.resolve({ data: [] }),
    searchProducts: async (query: string, category?: string) => Promise.resolve({ data: [] }),
    createProduct: async (data: any) => Promise.resolve({ data: { id: 1, ...data } }),
    updateProduct: async (id: string, data: any) => Promise.resolve({ data: { id, ...data } }),
    deleteProduct: async (id: string) => Promise.resolve({ data: { success: true } })
  },
  ordersApi: {
    getOrders: async () => Promise.resolve({ data: [] }),
    getOrderById: async (id: string) => Promise.resolve({ data: null }),
    getUserOrders: async (userId: string) => Promise.resolve({ data: [] }),
    createOrder: async (data: any) => Promise.resolve({ data: { id: 1, ...data } }),
    updateOrder: async (id: string, data: any) => Promise.resolve({ data: { id, ...data } }),
    updateOrderStatus: async (orderId: string, status: string) => Promise.resolve({ data: { success: true } }),
    deleteOrder: async (id: string) => Promise.resolve({ data: { success: true } })
  },
  adminApi: {
    getDashboard: async () => Promise.resolve({ 
      data: { 
        totalUsers: 0, 
        totalSellers: 0, 
        totalProducts: 0, 
        totalOrders: 0,
        recentOrders: [],
        topSellers: [],
        pendingSellers: 0,
        recentActivity: []
      }
    }),
    getUsers: async () => Promise.resolve({ data: [] }),
    getSellers: async () => Promise.resolve({ data: [] }),
    getOrders: async () => Promise.resolve({ data: [] }),
    updateSellerStatus: async (sellerId: string, status: string) => Promise.resolve({ data: { success: true } }),
    deleteUser: async (userId: string) => Promise.resolve({ data: { success: true } }),
    deleteSeller: async (sellerId: string) => Promise.resolve({ data: { success: true } })
  },
  dashboardApi: {
    getSellerOrders: async () => Promise.resolve({ data: [] }),
    getSellerStats: async () => Promise.resolve({ 
      data: { 
        totalOrders: 0, 
        totalRevenue: 0, 
        totalProducts: 0,
        pendingOrders: 0
      } 
    })
  },
  sellersApi: {
    getSellers: async () => Promise.resolve({ data: [] }),
    getSellerById: async (id: string) => Promise.resolve({ data: null }),
    getSellerProfile: async () => Promise.resolve({ data: null }),
    createSeller: async (data: any) => Promise.resolve({ data: { id: 1, ...data } }),
    updateSeller: async (id: string, data: any) => Promise.resolve({ data: { id, ...data } }),
    updateSellerProfile: async (data: any) => Promise.resolve({ data: { success: true } }),
    deleteSeller: async (id: string) => Promise.resolve({ data: { success: true } })
  }
};
