import React, { useState, useMemo, useEffect } from 'react';
import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Check,
  PackageOpen,
  ArrowUpDown,
  FolderTree,
  Gauge,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

interface CatalogPageProps {
  navigate: (route: string) => void;
  initialCategorySlug?: string;
  initialSearchQuery?: string;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  navigate,
  initialCategorySlug,
  initialSearchQuery = '',
}) => {
  const { publishedProducts, activeCategories, formatPrice } = useStore();

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (initialCategorySlug && activeCategories.length > 0) {
      const match = activeCategories.find((c) => c.slug === initialCategorySlug);
      return match ? match.name : 'all';
    }
    return 'all';
  });
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name-asc'>('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Synchronize category selection when URL route or activeCategories load
  useEffect(() => {
    if (initialCategorySlug) {
      const match = activeCategories.find((c) => c.slug === initialCategorySlug);
      if (match) {
        setSelectedCategory(match.name);
      }
    } else {
      setSelectedCategory('all');
    }
  }, [initialCategorySlug, activeCategories]);

  // Handle selecting a category cleanly
  const handleSelectCategory = (catName: string, catSlug?: string) => {
    setSelectedCategory(catName);
    if (catName === 'all') {
      navigate('/catalog');
    } else if (catSlug) {
      navigate(`/category/${catSlug}`);
    } else {
      const match = activeCategories.find((c) => c.name === catName);
      if (match) {
        navigate(`/category/${match.slug}`);
      } else {
        navigate('/catalog');
      }
    }
  };

  // Extract unique brands from published products
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    publishedProducts.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [publishedProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return publishedProducts.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
        return false;
      }

      // In-stock filter
      if (inStockOnly && p.stock <= 0) {
        return false;
      }

      // Search query filter (search across title, sku, brand, category, tags, specs)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = p.title.toLowerCase().includes(q);
        const inSku = p.sku?.toLowerCase().includes(q);
        const inBrand = p.brand?.toLowerCase().includes(q);
        const inCategory = p.category?.toLowerCase().includes(q);
        const inTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        const inSpecs = Object.values(p.specifications || {}).some((v) =>
          String(v).toLowerCase().includes(q)
        );

        if (!inTitle && !inSku && !inBrand && !inCategory && !inTags && !inSpecs) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') {
        const pA = a.salePrice || a.price;
        const pB = b.salePrice || b.price;
        return pA - pB;
      }
      if (sortBy === 'price-desc') {
        const pA = a.salePrice || a.price;
        const pB = b.salePrice || b.price;
        return pB - pA;
      }
      if (sortBy === 'name-asc') {
        return a.title.localeCompare(b.title);
      }
      // default newest
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [publishedProducts, selectedCategory, selectedBrand, inStockOnly, searchQuery, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setInStockOnly(false);
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    inStockOnly;

  return (
    <div className="bg-neutral-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title & Breadcrumb */}
        <div className="mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-1">
                <button
                  onClick={() => handleSelectCategory('all')}
                  className="hover:text-orange-600 transition-colors cursor-pointer"
                >
                  All Products
                </button>
                {selectedCategory !== 'all' && (
                  <>
                    <span>/</span>
                    <span className="text-orange-600 font-bold">{selectedCategory}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {selectedCategory !== 'all' ? selectedCategory : 'All Industrial Products'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Showing {filteredProducts.length} of {publishedProducts.length} certified instruments
              </p>
            </div>

            {/* Mobile Filter Toggle Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                <span>Filters {hasActiveFilters && '•'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VISIBLE CATEGORIES NAVIGATION SECTION */}
        {/* ========================================================= */}
        <div className="mb-6 bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-orange-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Browse Categories
              </h2>
              <span className="text-[11px] font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                {activeCategories.length}
              </span>
            </div>

            {selectedCategory !== 'all' && (
              <button
                onClick={() => handleSelectCategory('all')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Return to All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Horizontally scrollable category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-neutral-200">
            {/* All Products pill */}
            <button
              onClick={() => handleSelectCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs ring-2 ring-neutral-900/20'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 hover:text-neutral-900'
              }`}
            >
              <span>All Products</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  selectedCategory === 'all'
                    ? 'bg-neutral-800 text-orange-400'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {publishedProducts.length}
              </span>
            </button>

            {/* Dynamic categories from Firestore */}
            {activeCategories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              const count = publishedProducts.filter((p) => p.category === cat.name).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.name, cat.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20 ring-2 ring-orange-600/30'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 hover:text-neutral-900'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-orange-700 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {activeCategories.length === 0 && (
              <span className="text-xs text-neutral-400 py-1.5 px-2">
                No categories available in database.
              </span>
            )}
          </div>
        </div>

        {/* Selected Category Highlight Banner */}
        {selectedCategory !== 'all' && (
          <div className="mb-6 p-4 rounded-xl bg-orange-50/90 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                  Filtered by Category
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-neutral-900">
                  {selectedCategory}
                </h3>
              </div>
            </div>

            <button
              onClick={() => handleSelectCategory('all')}
              className="px-3.5 py-2 rounded-lg bg-white border border-neutral-300 hover:border-orange-500 hover:text-orange-600 text-neutral-700 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer shadow-2xs"
            >
              <X className="w-3.5 h-3.5 text-neutral-500" />
              <span>Show All Products</span>
            </button>
          </div>
        )}

        {/* Top Control Bar: Search & Sort */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-3 sm:p-4 mb-6 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, SKU, brand, range..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Active Filter Pills & Sort Dropdown */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-neutral-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid with Sidebar Filter Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Left Filter Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-600" />
                  Filter Catalog
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-orange-600 hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* In-Stock Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-neutral-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-neutral-800">In Stock Ready for Dispatch</span>
                </label>
              </div>

              {/* Categories Filter */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Categories
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-orange-50 text-orange-700 font-bold'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-[11px] text-neutral-400">({publishedProducts.length})</span>
                  </button>

                  {activeCategories.map((cat) => {
                    const count = publishedProducts.filter((p) => p.category === cat.name).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.name, cat.slug)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          selectedCategory === cat.name
                            ? 'bg-orange-50 text-orange-700 font-bold'
                            : 'text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[11px] text-neutral-400">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brands Filter */}
              {availableBrands.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Brands
                  </h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedBrand('all')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        selectedBrand === 'all'
                          ? 'bg-orange-50 text-orange-700 font-bold'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span>All Brands</span>
                    </button>
                    {availableBrands.map((brand) => {
                      const count = publishedProducts.filter((p) => p.brand === brand).length;
                      return (
                        <button
                          key={brand}
                          onClick={() => setSelectedBrand(brand)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                            selectedBrand === brand
                              ? 'bg-orange-50 text-orange-700 font-bold'
                              : 'text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <span className="truncate">{brand}</span>
                          <span className="text-[11px] text-neutral-400">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Grid (3 cols on desktop) */}
          <div className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onNavigate={(slug) => navigate(`/product/${slug}`)}
                  />
                ))}
              </div>
            ) : (
              /* Professional Empty State */
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-lg mx-auto my-8 shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-1">
                  {selectedCategory !== 'all'
                    ? `No Products in "${selectedCategory}"`
                    : 'No Products Found'}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mb-6 leading-relaxed">
                  {selectedCategory !== 'all'
                    ? 'There are currently no certified industrial instruments published under this category.'
                    : hasActiveFilters
                    ? 'No products matched your specific search or filter criteria. Try adjusting or clearing your filters.'
                    : 'The Gauge House catalog is currently being prepared with certified instrumentation. Contact our Lahore office for custom inquiries.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {selectedCategory !== 'all' && (
                    <button
                      onClick={() => handleSelectCategory('all')}
                      className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Return to All Products
                    </button>
                  )}
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-all cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Slide-over Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-neutral-900/60 backdrop-blur-xs">
          <div className="ml-auto w-full max-w-xs bg-white h-full p-5 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <h3 className="font-bold text-base text-neutral-900">Filters</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* In-Stock Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-neutral-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-neutral-800">In Stock Ready</span>
                </label>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Category
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleSelectCategory('all');
                      setMobileFiltersOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                      selectedCategory === 'all' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-neutral-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {activeCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        handleSelectCategory(cat.name, cat.slug);
                        setMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                        selectedCategory === cat.name ? 'bg-orange-50 text-orange-600 font-bold' : 'text-neutral-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              {availableBrands.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Brand
                  </h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedBrand('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                        selectedBrand === 'all' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-neutral-700'
                      }`}
                    >
                      All Brands
                    </button>
                    {availableBrands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                          selectedBrand === brand ? 'bg-orange-50 text-orange-600 font-bold' : 'text-neutral-700'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-neutral-200 flex gap-2">
              <button
                onClick={() => {
                  resetFilters();
                  setMobileFiltersOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-xs"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
