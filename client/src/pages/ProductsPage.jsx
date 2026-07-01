import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import api from '../services/api';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Toys', 'Automotive', 'Food'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(true);

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sort: searchParams.get('sort') || 'newest',
    isFeatured: searchParams.get('isFeatured') || '',
  });

  const [searchInput, setSearchInput] = useState(filters.keyword);

  const fetchProducts = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set('page', currentPage);
      params.set('limit', 12);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters, page);
  }, [filters, page, fetchProducts]);

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('keyword', searchInput);
  };

  const clearFilters = () => {
    const reset = { keyword: '', category: '', minPrice: '', maxPrice: '', minRating: '', sort: 'newest', isFeatured: '' };
    setFilters(reset);
    setSearchInput('');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => v && k !== 'sort');

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '32px var(--spacing-lg)' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>
            {filters.category || 'All Products'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>{total} products found</p>
        </div>

        {/* Search + Sort bar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '250px' }}>
            <div className="search-bar">
              <FiSearch className="search-bar__icon" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                className="search-bar__input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </form>

          <select
            className="form-input"
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
            <FiFilter size={16} /> Filters
          </button>

          {hasActiveFilters && (
            <button className="btn btn-danger" onClick={clearFilters}>
              <FiX size={16} /> Clear
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showFilters ? '240px 1fr' : '1fr', gap: '24px' }}>
          {/* Sidebar */}
          {showFilters && (
            <aside className="filter-sidebar">
              {/* Categories */}
              <div className="filter-section">
                <p className="filter-title">Category</p>
                <label className="filter-option" onClick={() => updateFilter('category', '')}>
                  <input type="radio" name="category" checked={!filters.category} readOnly />
                  All Categories
                </label>
                {CATEGORIES.map(cat => (
                  <label key={cat} className={`filter-option ${filters.category === cat ? 'active' : ''}`} onClick={() => updateFilter('category', cat)}>
                    <input type="radio" name="category" checked={filters.category === cat} readOnly />
                    {cat}
                  </label>
                ))}
              </div>

              {/* Price Range */}
              <div className="filter-section">
                <p className="filter-title">Price Range</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="Min"
                    className="form-input"
                    style={{ width: '90px', padding: '8px 10px' }}
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="form-input"
                    style={{ width: '90px', padding: '8px 10px' }}
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  />
                </div>

                {/* Quick price ranges */}
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[['Under $50', '', '50'], ['$50 – $200', '50', '200'], ['$200 – $500', '200', '500'], ['$500+', '500', '']].map(([label, min, max]) => (
                    <button key={label} className="filter-option" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => { updateFilter('minPrice', min); setTimeout(() => updateFilter('maxPrice', max), 10); }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="filter-section">
                <p className="filter-title">Min Rating</p>
                {[4, 3, 2, 1].map(r => (
                  <label key={r} className={`filter-option ${filters.minRating == r ? 'active' : ''}`} onClick={() => updateFilter('minRating', filters.minRating == r ? '' : r)}>
                    <input type="checkbox" checked={filters.minRating == r} readOnly />
                    {'⭐'.repeat(r)} & up
                  </label>
                ))}
              </div>

              {/* Featured */}
              <div className="filter-section">
                <p className="filter-title">Other</p>
                <label className={`filter-option ${filters.isFeatured ? 'active' : ''}`} onClick={() => updateFilter('isFeatured', filters.isFeatured ? '' : 'true')}>
                  <input type="checkbox" checked={!!filters.isFeatured} readOnly />
                  Featured Only
                </label>
              </div>
            </aside>
          )}

          {/* Products Grid */}
          <div>
            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ marginBottom: '8px' }}>No products found</h3>
                <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
                    <button
                      className="btn btn-secondary"
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >← Prev</button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = page <= 3 ? i + 1 : page + i - 2;
                      if (pageNum < 1 || pageNum > totalPages) return null;
                      return (
                        <button key={pageNum} className={`btn ${pageNum === page ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setPage(pageNum)}>
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      className="btn btn-secondary"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
