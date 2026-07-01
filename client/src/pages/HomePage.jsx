import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProductCard from '../components/products/ProductCard';
import api from '../services/api';
import { FiArrowRight, FiZap, FiTrendingUp, FiBriefcase, FiShield } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';

const CATEGORIES = [
  { name: 'Electronics', emoji: '💻', color: '#7c3aed' },
  { name: 'Fashion', emoji: '👗', color: '#ec4899' },
  { name: 'Home & Garden', emoji: '🏠', color: '#10b981' },
  { name: 'Sports', emoji: '⚡', color: '#f59e0b' },
  { name: 'Books', emoji: '📚', color: '#3b82f6' },
  { name: 'Beauty', emoji: '✨', color: '#a855f7' },
];

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, trendingRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/recommendations/trending?limit=8'),
        ]);
        setFeaturedProducts(featuredRes.data.products);
        setTrending(trendingRes.data.products);

        if (isAuthenticated) {
          const recsRes = await api.get('/recommendations?limit=8');
          setRecommendations(recsRes.data.recommendations);
        }
      } catch (err) {
        console.error('Failed to fetch homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  return (
    <div className="page-wrapper">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero__bg-orb hero__bg-orb--1" />
        <div className="hero__bg-orb hero__bg-orb--2" />

        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
            <div className="hero__content">
              <div className="hero__eyebrow">
                <MdAutoAwesome /> AI-Powered Shopping
              </div>
              <h1 className="hero__title">
                Discover Products <span className="gradient-text">Curated for You</span>
              </h1>
              <p className="hero__description">
                Experience the future of e-commerce with AI-powered recommendations, seamless checkout, and an unmatched collection of premium products.
              </p>
              <div className="hero__actions">
                <Link to="/products" className="btn btn-primary btn-lg">
                  Shop Now <FiArrowRight />
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="btn btn-secondary btn-lg">
                    Get Started Free
                  </Link>
                )}
              </div>

              <div className="hero__stats">
                <div className="hero__stat">
                  <span className="hero__stat-value">10K+</span>
                  <span className="hero__stat-label">Products</span>
                </div>
                <div className="hero__stat">
                  <span className="hero__stat-value">50K+</span>
                  <span className="hero__stat-label">Customers</span>
                </div>
                <div className="hero__stat">
                  <span className="hero__stat-value">98%</span>
                  <span className="hero__stat-label">Satisfaction</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '420px', height: '420px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              }}>
                {/* Floating product cards */}
                {featuredProducts.slice(0, 3).map((p, i) => (
                  <div key={p._id} style={{
                    position: 'absolute',
                    background: 'var(--bg-glass)', backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-color)', borderRadius: '16px',
                    padding: '12px', display: 'flex', alignItems: 'center', gap: '10px',
                    boxShadow: 'var(--shadow-md)',
                    top: i === 0 ? '10%' : i === 1 ? '45%' : '70%',
                    left: i === 0 ? '5%' : i === 1 ? '55%' : '10%',
                    width: '180px',
                    animation: `orbFloat ${4 + i}s ease-in-out infinite`,
                    animationDelay: `${i * 1.5}s`,
                  }}>
                    <img src={p.images?.[0]} alt={p.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}>{p.name}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>${p.price}</div>
                    </div>
                  </div>
                ))}

                {/* AI Badge */}
                <div style={{
                  position: 'absolute', bottom: '5%', right: '5%',
                  background: 'var(--gradient-primary)', borderRadius: '12px',
                  padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: 'var(--shadow-glow)', fontSize: '0.8rem', fontWeight: 700, color: 'white',
                }}>
                  <MdAutoAwesome /> AI Recommendations ON
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ padding: '60px 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { icon: FiZap, title: 'Lightning Fast', desc: 'Instant search and one-click checkout', color: '#f59e0b' },
              { icon: MdAutoAwesome, title: 'AI Powered', desc: 'Smart product recommendations just for you', color: '#7c3aed' },
              { icon: FiShield, title: 'Secure Payments', desc: 'Stripe-secured transactions with fraud protection', color: '#10b981' },
              { icon: FiBriefcase, title: 'Free Returns', desc: '30-day hassle-free returns on all orders', color: '#3b82f6' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px',
                padding: '24px', background: 'var(--bg-card)', borderRadius: '16px',
                border: '1px solid var(--border-color)', transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: '4px', fontSize: '0.95rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Browse</span>
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
            {CATEGORIES.map(({ name, emoji, color }) => (
              <Link key={name} to={`/products?category=${encodeURIComponent(name)}`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                  padding: '24px 16px', background: 'var(--bg-card)', borderRadius: '16px',
                  border: '1px solid var(--border-color)', transition: 'all 0.3s', textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}10`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'none'; }}>
                <span style={{ fontSize: '2rem' }}>{emoji}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI RECOMMENDATIONS ===== */}
      {isAuthenticated && recommendations.length > 0 && (
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <MdAutoAwesome /> AI Curated
              </span>
              <h2 className="section-title">Recommended for You</h2>
              <p className="section-subtitle">Personalized picks based on your shopping history</p>
            </div>
            <div className="products-grid">
              {recommendations.map(({ product, reason }) => (
                <ProductCard key={product._id} product={product} recommendationReason={reason} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FEATURED ===== */}
      {featuredProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left' }}>
              <div>
                <span className="section-eyebrow">Handpicked</span>
                <h2 className="section-title" style={{ margin: 0 }}>Featured Products</h2>
              </div>
              <Link to="/products?isFeatured=true" className="btn btn-secondary">
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== TRENDING ===== */}
      {trending.length > 0 && (
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left' }}>
              <div>
                <span className="section-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiTrendingUp /> Trending</span>
                <h2 className="section-title" style={{ margin: 0 }}>What's Hot Right Now</h2>
              </div>
              <Link to="/products?sort=popular" className="btn btn-secondary">
                See More <FiArrowRight />
              </Link>
            </div>
            <div className="products-grid">
              {trending.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA BANNER ===== */}
      {!isAuthenticated && (
        <section className="section">
          <div className="container">
            <div style={{
              background: 'linear-gradient(135deg, #1a0a2e, #0d1a3a)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '24px', padding: '64px 48px', textAlign: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(124,58,237,0.15)', borderRadius: '50%', filter: 'blur(60px)' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>
                Start Your <span className="gradient-text">AI Shopping</span> Journey
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.05rem' }}>
                Join 50,000+ shoppers getting personalized recommendations every day.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
                <Link to="/products" className="btn btn-secondary btn-lg">Browse Products</Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
