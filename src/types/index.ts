export enum BusinessType {
  CAFE = 'cafe',
  RESTAURANT = 'restaurant',
  MARKET = 'market',
  BAKERY = 'bakery',
  OTHER = 'other',
}

export enum ProductCategory {
  BREAD = 'bread',
  PASTRY = 'pastry',
  MAIN_DISH = 'main_dish',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
  SNACK = 'snack',
  SALAD = 'salad',
  SOUP = 'soup',
  OTHER = 'other',
}

export enum SellerVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Product {
  id: number;
  price: number;
  originalPrice?: number;
  description?: string;
  imageUrl?: string;
  availableFrom?: string;
  availableUntil: string;
  code?: string;
  isActive: boolean;
  quantity: number;
  category?: ProductCategory;
  createdAt: string;
  updatedAt: string;
  seller: Seller;
  ratings?: Rating[];
}

export interface Seller {
  id: number;
  telegramId: string;
  phoneNumber: string;
  businessName: string;
  businessType: BusinessType;
  location: Location;
  opensAt: number;
  closesAt: number;
  status: string;
  language: string;
  businessImageUrl?: string;
  verificationStatus: SellerVerificationStatus;
  createdAt: string;
  updatedAt: string;
  distance?: number;
  isOpen?: boolean;
  averageRating?: number;
}

export interface Rating {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  user: User;
  product: Product;
}

export interface User {
  id: number;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  code: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  quantity: number;
  createdAt: string;
  product: Product;
}

export interface CreateProductDto {
  description: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  availableUntil: Date;
  availableFrom?: Date;
  category: ProductCategory;
  sellerId: number;
}

export interface UpdateProductDto {
  description?: string;
  price?: number;
  originalPrice?: number;
  quantity?: number;
  availableUntil?: Date;
  availableFrom?: Date;
  category?: ProductCategory;
}

export interface CreateSellerDto {
  telegramId: string;
  phoneNumber: string;
  businessName: string;
  businessType: BusinessType;
  location: Location;
  opensAt: number;
  closesAt: number;
  language: string;
}

export interface UpdateSellerDto {
  phoneNumber?: string;
  businessName?: string;
  businessType?: BusinessType;
  location?: Location;
  opensAt?: number;
  closesAt?: number;
  language?: string;
}

export interface CreateUserDto {
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  language: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  language?: string;
}

export interface CreateOrderDto {
  productId: number;
  quantity: number;
  totalPrice: number;
}

export interface UpdateOrderDto {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface CreateRatingDto {
  productId: number;
  rating: number;
  comment?: string;
}

export interface UpdateRatingDto {
  rating?: number;
  comment?: string;
}


