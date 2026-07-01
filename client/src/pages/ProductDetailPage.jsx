import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import ProductCard from '../components/products/ProductCard';
import { StarRating } from '../components/products/ProductCard';
import api from '../services/api';
import { FiShoppingCart, FiHeart, FiShare2, FiArrowLeft, FiStar } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
        setSelectedImage(0);

        const simRes = await api.get(`/recommendations/similar/${data.product._id}?limit=4`);
        setSimilar(simRes.data.products);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to leave a review');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${product._id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="page-wrapper loading-container"><div className="spinner" /></div>;
  if (!product) return <div className="page-wrapper"><div className="container"><p>Product not found</p></div></div>;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '32px var(--spacing-lg)' }}>
        <Link to="/products" className="btn btn-secondary btn-sm" style={{ marginBottom: '24px', display: 'inline-flex' }}>
          <FiArrowLeft /> Back to Products
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '64px' }}>
          {/* Images */}
          <div>
            <div style={{ borderRadius: '20px', overflow: 'hidden', background: 'var(--bg-secondary)', marginBottom: '12px', aspectRatio: '1' }}>
              <img
                src={product.images?.[selectedImage] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
              />
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} style={{
                    width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden',
                    border: `2px solid ${i === selectedImage ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    cursor: 'pointer', background: 'none', padding: 0, transition: 'border-color 0.2s',
                  }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <span className="badge badge-primary">{product.category}</span>
              {product.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
              {product.stock < 5 && product.stock > 0 && <span className="badge badge-danger">Only {product.stock} left!</span>}
              {product.stock === 0 && <span className="badge badge-danger">Out of Stock</span>}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <StarRating rating={product.rating} count={product.numReviews} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>• {product.views} views</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>${product.price.toFixed(2)}</span>
              {product.originalPrice && <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>${product.originalPrice.toFixed(2)}</span>}
              {discount > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-success)', background: 'rgba(16,185,129,0.1)', padding: '3px 10px', borderRadius: '20px' }}>Save {discount}%</span>}
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '32px' }}>{product.description}</p>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {product.tags.map(tag => (
                  <span key={tag} className="badge badge-primary">{tag}</span>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Quantity:</span>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{product.stock} in stock</span>
            </div>

            {/* Add to Cart */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <FiShoppingCart size={18} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button className="btn btn-icon" style={{ padding: '12px 16px', fontSize: '1.1rem' }}>
                <FiHeart size={18} />
              </button>
              <button className="btn btn-icon" style={{ padding: '12px 16px' }}>
                <FiShare2 size={18} />
              </button>
            </div>

            {/* Brand Info */}
            {product.brand && (
              <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Brand: <strong style={{ color: 'var(--text-primary)' }}>{product.brand}</strong></p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '64px' }}>
          {/* Review List */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>
              Customer Reviews ({product.numReviews})
            </h2>

            {product.reviews?.length === 0 ? (
              <div style={{ padding: '32px', background: 'var(--bg-card)', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {product.reviews?.map((review) => (
                  <div key={review._id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>{review.name}</strong>
                        <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                          {Array.from({ length: 5 }, (_, i) => (
                            <FiStar key={i} style={{ color: i < review.rating ? 'var(--accent-gold)' : 'var(--text-muted)', fill: i < review.rating ? 'var(--accent-gold)' : 'none', fontSize: '0.85rem' }} />
                          ))}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Form */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>
              Write a Review
            </h2>
            {isAuthenticated ? (
              <form onSubmit={handleSubmitReview} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(r => (
                      <button key={r} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: r }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: r <= reviewForm.rating ? 'var(--accent-gold)' : 'var(--text-muted)', transition: 'color 0.15s' }}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Share your experience with this product..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="card" style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Login to leave a review</p>
                <Link to="/login" className="btn btn-primary">Login</Link>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <MdAutoAwesome style={{ color: 'var(--accent-primary)', fontSize: '1.3rem' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>You Might Also Like</h2>
            </div>
            <div className="products-grid">
              {similar.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
