import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, Filter, MapPin, Star, Clock } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import ProductCard from '../components/ProductCard';
import { productsApi } from '../services/api';
import { Product, BusinessType } from '../types';

interface SearchFilters {
  category: BusinessType | 'all';
  priceRange: { min: number; max: number };
  distance: number;
  availability: 'all' | 'open' | 'closing_soon';
  sortBy: 'distance' | 'price' | 'rating' | 'newest';
}

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    priceRange: { min: 0, max: 100000 },
    distance: 10,
    availability: 'all',
    sortBy: 'distance'
  });

  const searchProducts = useCallback(async () => {
    if (!searchQuery.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await productsApi.searchProducts(searchQuery, filters.category);
      let filteredProducts: Product[] = response.data || [];

      // Apply additional filters
      if (filters.priceRange.min > 0 || filters.priceRange.max < 100000) {
        filteredProducts = filteredProducts.filter((product: Product) => 
          product.price >= filters.priceRange.min && product.price <= filters.priceRange.max
        );
      }

      // Apply availability filter
      if (filters.availability === 'open') {
        filteredProducts = filteredProducts.filter((product: Product) => product.seller.isOpen);
      } else if (filters.availability === 'closing_soon') {
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        filteredProducts = filteredProducts.filter((product: Product) => 
          new Date(product.availableUntil) <= twoHoursFromNow
        );
      }

      // Sort products
      filteredProducts.sort((a: Product, b: Product) => {
        switch (filters.sortBy) {
          case 'price':
            return a.price - b.price;
          case 'rating':
            return (b.seller.averageRating || 0) - (a.seller.averageRating || 0);
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'distance':
          default:
            return (a.seller.distance || 0) - (b.seller.distance || 0);
        }
      });

      setProducts(filteredProducts);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchProducts]);

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleSellerClick = (seller: any) => {
    navigate(`/seller-detail/${seller.id}`);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      priceRange: { min: 0, max: 100000 },
      distance: 10,
      availability: 'all',
      sortBy: 'distance'
    });
  };

  const businessTypes = [
    { value: 'all', label: 'All Categories' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'market', label: 'Market' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Search</h1>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products or sellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </button>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="distance">Distance</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="px-4 py-4 bg-white border-b">
          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {businessTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: parseInt(e.target.value) || 0 })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: parseInt(e.target.value) || 100000 })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All</option>
                <option value="open">Open Now</option>
                <option value="closing_soon">Closing Soon</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="p-4">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Searching...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={searchProducts}
              className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && searchQuery && products.length === 0 && (
          <div className="text-center py-8">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No results found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}

        {!loading && !error && !searchQuery && (
          <div className="text-center py-8">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Start searching</p>
            <p className="text-sm text-gray-400">Enter a product name or seller to begin</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
              <span className="text-sm text-gray-500">{products.length} items</span>
            </div>
            
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                distance={product.seller.distance}
                onProductClick={() => handleProductClick(product)}
                onSellerClick={() => handleSellerClick(product.seller)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNavigation currentPage="search" />
    </div>
  );
};

export default Search;

