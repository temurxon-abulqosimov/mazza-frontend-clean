// Mock data service to fix API connection issues
export const mockSellers = [
  {
    id: 1,
    telegramId: "123456789",
    phoneNumber: "+998901234567",
    businessName: "Bakery Corner",
    businessType: "bakery",
    location: { latitude: 41.3111, longitude: 69.2797 },
    opensAt: 480, // 8:00 AM
    closesAt: 1200, // 8:00 PM
    status: "approved",
    language: "uz",
    businessImageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    verificationStatus: "verified",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    products: [
      {
        id: 1,
        price: 15000,
        originalPrice: 25000,
        description: "Fresh Artisan Bread - Sourdough Loaf",
        availableUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        quantity: 5,
        category: "bread",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        seller: null as any, // Will be populated
      }
    ],
    distance: 0.5,
    isOpen: true,
    averageRating: 4.8
  },
  {
    id: 2,
    telegramId: "987654321",
    phoneNumber: "+998901234568",
    businessName: "Pizza Palace",
    businessType: "restaurant",
    location: { latitude: 41.3121, longitude: 69.2807 },
    opensAt: 600, // 10:00 AM
    closesAt: 1320, // 10:00 PM
    status: "approved",
    language: "uz",
    businessImageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
    verificationStatus: "verified",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    products: [
      {
        id: 2,
        price: 25000,
        originalPrice: 40000,
        description: "Margherita Pizza Slice - Fresh Mozzarella",
        availableUntil: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        quantity: 8,
        category: "main_dish",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        seller: null as any,
      }
    ],
    distance: 1.2,
    isOpen: true,
    averageRating: 4.6
  },
  {
    id: 3,
    telegramId: "456789123",
    phoneNumber: "+998901234569",
    businessName: "Sweet Dreams Bakery",
    businessType: "bakery",
    location: { latitude: 41.3101, longitude: 69.2787 },
    opensAt: 420, // 7:00 AM
    closesAt: 1140, // 7:00 PM
    status: "approved",
    language: "uz",
    businessImageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
    verificationStatus: "verified",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    products: [
      {
        id: 3,
        price: 12000,
        originalPrice: 20000,
        description: "Chocolate Croissant - Buttery & Flaky",
        availableUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        quantity: 3,
        category: "pastry",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        seller: null as any,
      }
    ],
    distance: 0.8,
    isOpen: true,
    averageRating: 4.9
  }
];

// Add seller reference to products
mockSellers.forEach(seller => {
  seller.products?.forEach(product => {
    product.seller = seller;
  });
});

export const mockProducts = mockSellers.flatMap(seller => 
  seller.products?.map(product => ({
    ...product,
    seller: seller
  })) || []
);



