import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, Filter } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import ProductCard from '../components/ProductCard';
import { productsApi } from '../services/api';
import { Product, BusinessType, ProductCategory } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';

interface SearchFilters {
  category: BusinessType | 'all'; // business type
  productCategory: ProductCategory | 'all';
  priceRange: { min: number; max: number };
  distance: number;
  availability: 'all' | 'open' | 'closing_soon';
  sortBy: 'distance' | 'price' | 'rating' | 'newest';
}

const Search: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    productCategory: 'all',
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
      const categoryParam = filters.productCategory === 'all' ? undefined : (filters.productCategory as any);
      const response = await productsApi.searchProducts(searchQuery, categoryParam);
      let filteredProducts: Product[] = response.data || [];

      // Apply additional filters
      // Business type filter (optional)
      if (filters.category !== 'all') {
        filteredProducts = filteredProducts.filter((product: any) => {
          const type = product.store?.businessType || product.seller?.businessType;
          return type === filters.category;
        });
      }

      // Product category filter (drinks/beverages, etc.)
      if (filters.productCategory !== 'all') {
        filteredProducts = filteredProducts.filter((product: any) => (product.category as string) === filters.productCategory);
      }

      if (filters.priceRange.min > 0 || filters.priceRange.max < 100000) {
        filteredProducts = filteredProducts.filter((product: Product) => 
          product.price >= filters.priceRange.min && product.price <= filters.priceRange.max
        );
      }

      // Apply availability filter
      if (filters.availability === 'open') {
        // If explicit open/closed info is not available, treat items with future availability as open
        filteredProducts = filteredProducts.filter((product: any) => {
          const until = new Date(product.availableUntil).getTime();
          return until > Date.now();
        });
      } else if (filters.availability === 'closing_soon') {
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        filteredProducts = filteredProducts.filter((product: Product) => 
          new Date(product.availableUntil) <= twoHoursFromNow
        );
      }

      // Distance filter (<= selected distance in km when distance is available)
      if (filters.distance && Number.isFinite(filters.distance)) {
        filteredProducts = filteredProducts.filter((product: any) => {
          const d = (product.store?.distance ?? product.seller?.distance) as number | undefined;
          return d === undefined || d <= filters.distance; // keep if unknown, otherwise filter
        });
      }

      // Sort products
      filteredProducts.sort((a: Product, b: Product) => {
        switch (filters.sortBy) {
          case 'price':
            return a.price - b.price;
          case 'rating':
            const ar = (a as any).stats?.averageRating ?? (a as any).seller?.averageRating ?? 0;
            const br = (b as any).stats?.averageRating ?? (b as any).seller?.averageRating ?? 0;
            return br - ar;
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'distance':
          default:
            const ad = ((a as any).store?.distance ?? (a as any).seller?.distance ?? Number.POSITIVE_INFINITY) as number;
            const bd = ((b as any).store?.distance ?? (b as any).seller?.distance ?? Number.POSITIVE_INFINITY) as number;
            return ad - bd;
        }
      });

      setProducts(filteredProducts);
    } catch (err) {
      console.error('Search failed:', err);
      setError(t('searchFailed'));
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
      productCategory: 'all',
      priceRange: { min: 0, max: 100000 },
      distance: 10,
      availability: 'all',
      sortBy: 'distance'
    });
  };

  const businessTypes = [
    { value: 'all', label: t('allCategories') },
    { value: 'bakery', label: t('bakery') },
    { value: 'restaurant', label: t('restaurant') },
    { value: 'cafe', label: t('cafe') },
    { value: 'market', label: t('market') }
  ];

  const productCategories = [
    { value: 'all', label: t('allCategories') },
    { value: 'bread_bakery', label: t('breadBakery') },
    { value: 'pastry', label: t('pastry') },
    { value: 'main_dishes', label: t('mainDishes') },
    { value: 'desserts', label: t('desserts') },
    { value: 'beverages', label: t('beverages') }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{t('search')}</h1>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="max-w-md mx-auto relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm"
            >
              <Filter className="w-4 h-4 mr-1" />
              {t('filters')}
            </button>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="distance">{t('distance')}</option>
              <option value="price">{t('price')}</option>
              <option value="rating">{t('rating')}</option>
              <option value="newest">{t('newest')}</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {t('clear')}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="px-4 py-4 bg-white border-b">
          <div className="max-w-md mx-auto space-y-4">
            {/* Business Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
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

            {/* Product Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('category')}</label>
              <select
                value={filters.productCategory}
                onChange={(e) => handleFilterChange('productCategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {productCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder={t('min')}
                  value={filters.priceRange.min}
                  onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: parseInt(e.target.value) || 0 })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder={t('max')}
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
      <div className="max-w-md mx-auto p-4">
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
            <p className="text-gray-500 mb-2">{t('noResults')}</p>
            <p className="text-sm text-gray-400">{t('tryAdjustingSearch')}</p>
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
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{t('search')}</h3>
              <span className="text-sm text-gray-500">{products.length} {t('items') || 'items'}</span>
            </div>
            {/* Grid cards to match new design */}
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  distance={(product as any)?.seller?.distance}
                  onProductClick={() => handleProductClick(product)}
                  onSellerClick={() => handleSellerClick((product as any).seller)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNavigation currentPage="search" />
    </div>
  );
};

export default Search;

