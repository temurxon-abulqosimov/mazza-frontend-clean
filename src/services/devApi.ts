// Development API service with mock data for testing
import { Product, Seller } from '../types';

// Mock products data
const mockProducts: Product[] = [
  {
    id: 1,
    price: 15000,
    originalPrice: 25000,
    description: "Fresh Artisan Bread - Sourdough Loaf",
    name: "Fresh Artisan Bread - Sourdough Loaf",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300",
    availableUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    isActive: true,
    quantity: 5,
    category: "bread" as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seller: {
      id: 1,
      telegramId: "987654321",
      phoneNumber: "+998901234567",
      businessName: "Bakery Corner",
      businessType: "bakery" as any,
      location: { latitude: 41.2995, longitude: 69.2401 },
      opensAt: 8,
      closesAt: 20,
      status: "approved",
      language: "uz",
      verificationStatus: "verified" as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      distance: 0.5,
      averageRating: 4.8
    },
    store: {
      id: 1,
      businessName: "Bakery Corner",
      businessType: "bakery",
      distance: 0.5,
      location: { latitude: 41.2995, longitude: 69.2401 },
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300"
    },
    stats: {
      averageRating: 4.8,
      totalRatings: 24
    }
  },
  {
    id: 2,
    price: 25000,
    originalPrice: 40000,
    description: "Margherita Pizza Slice - Fresh Mozzarella",
    name: "Margherita Pizza Slice - Fresh Mozzarella",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300",
    availableUntil: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    isActive: true,
    quantity: 8,
    category: "main_dish" as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seller: {
      id: 2,
      telegramId: "987654322",
      phoneNumber: "+998901234568",
      businessName: "Pizza Palace",
      businessType: "restaurant" as any,
      location: { latitude: 41.3015, longitude: 69.2421 },
      opensAt: 10,
      closesAt: 22,
      status: "approved",
      language: "uz",
      verificationStatus: "verified" as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      distance: 1.2,
      averageRating: 4.6
    },
    store: {
      id: 2,
      businessName: "Pizza Palace",
      businessType: "restaurant",
      distance: 1.2,
      location: { latitude: 41.3015, longitude: 69.2421 },
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300"
    },
    stats: {
      averageRating: 4.6,
      totalRatings: 18
    }
  },
  {
    id: 3,
    price: 12000,
    originalPrice: 20000,
    description: "Chocolate Croissant - Buttery & Flaky",
    name: "Chocolate Croissant - Buttery & Flaky",
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300",
    availableUntil: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours from now
    isActive: true,
    quantity: 12,
    category: "pastry" as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seller: {
      id: 3,
      telegramId: "987654323",
      phoneNumber: "+998901234569",
      businessName: "Sweet Dreams Bakery",
      businessType: "bakery" as any,
      location: { latitude: 41.2985, longitude: 69.2381 },
      opensAt: 7,
      closesAt: 19,
      status: "approved",
      language: "uz",
      verificationStatus: "verified" as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      distance: 0.8,
      averageRating: 4.9
    },
    store: {
      id: 3,
      businessName: "Sweet Dreams Bakery",
      businessType: "bakery",
      distance: 0.8,
      location: { latitude: 41.2985, longitude: 69.2381 },
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300"
    },
    stats: {
      averageRating: 4.9,
      totalRatings: 31
    }
  }
];

// Mock sellers data
const mockSellers: Seller[] = [
  {
    id: 1,
    telegramId: "987654321",
    phoneNumber: "+998901234567",
    businessName: "Bakery Corner",
    businessType: "bakery" as any,
    location: { latitude: 41.2995, longitude: 69.2401 },
    opensAt: 8,
    closesAt: 20,
    status: "approved",
    language: "uz",
    verificationStatus: "verified" as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    distance: 0.5,
    averageRating: 4.8
  },
  {
    id: 2,
    telegramId: "987654322",
    phoneNumber: "+998901234568",
    businessName: "Pizza Palace",
    businessType: "restaurant" as any,
    location: { latitude: 41.3015, longitude: 69.2421 },
    opensAt: 10,
    closesAt: 22,
    status: "approved",
    language: "uz",
    verificationStatus: "verified" as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    distance: 1.2,
    averageRating: 4.6
  }
];

// Mock orders data
const mockOrders = [
  {
    id: 1,
    code: "ORD001",
    status: "completed" as const,
    totalPrice: 15000,
    quantity: 1,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    product: mockProducts[0]
  },
  {
    id: 2,
    code: "ORD002", 
    status: "pending" as const,
    totalPrice: 25000,
    quantity: 1,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    product: mockProducts[1]
  }
];

// Development API service
export const devApi = {
  products: {
    getProducts: async (params?: any) => {
      console.log('DEV API: Getting products with params:', params);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return { data: { products: mockProducts } };
    },
    searchProducts: async (query: string, category?: string) => {
      console.log('DEV API: Searching products:', { query, category });
      await new Promise(resolve => setTimeout(resolve, 300));
      const filtered = mockProducts.filter(p => 
        p.description?.toLowerCase().includes(query.toLowerCase()) ||
        p.name?.toLowerCase().includes(query.toLowerCase())
      );
      return { data: { products: filtered } };
    },
    getProductById: async (id: string) => {
      console.log('DEV API: Getting product by ID:', id);
      await new Promise(resolve => setTimeout(resolve, 200));
      const product = mockProducts.find(p => p.id.toString() === id);
      return { data: product || null };
    }
  },
  sellers: {
    getSellers: async () => {
      console.log('DEV API: Getting sellers');
      await new Promise(resolve => setTimeout(resolve, 400));
      return { data: mockSellers };
    },
    getSellerById: async (id: string) => {
      console.log('DEV API: Getting seller by ID:', id);
      await new Promise(resolve => setTimeout(resolve, 200));
      const seller = mockSellers.find(s => s.id.toString() === id);
      return { data: seller || null };
    }
  },
  orders: {
    getUserOrders: async (userId: string) => {
      console.log('DEV API: Getting user orders for:', userId);
      await new Promise(resolve => setTimeout(resolve, 300));
      return { data: mockOrders };
    },
    getMyOrders: async () => {
      console.log('DEV API: Getting my orders');
      await new Promise(resolve => setTimeout(resolve, 300));
      return { data: mockOrders };
    },
    getOrders: async () => {
      console.log('DEV API: Getting all orders');
      await new Promise(resolve => setTimeout(resolve, 400));
      return { data: mockOrders };
    }
  }
};
