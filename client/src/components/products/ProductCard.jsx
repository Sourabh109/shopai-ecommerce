import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StarRating = ({ rating, count }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push(<FaStar key={i} className="star" />);
    else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className="star" />);
    else stars.push(<FaRegStar key={i} className="star empty" />);
  }
  return (
    <div className="product-card__rating">
      <div className="stars">{stars}</div>
      {count !== undefined && <span className="rating-count">({count})</span>}
    </div>
  );
};

const ProductCard = ({ product, recommendationReason }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card" style={{ display: 'block' }}>
      <div className="product-card__image-wrapper">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
        />

        {/* Badges */}
        {discount > 0 && (
          <span className="product-card__badge product-card__badge--sale">-{discount}%</span>
        )}
        {product.isFeatured && !discount && (
          <span className="product-card__badge product-card__badge--featured">⭐ Featured</span>
        )}

        {/* Hover Actions */}
        <div className="product-card__actions">
          <button className="btn btn-icon" title="Quick View">
            <FiEye size={15} />
          </button>
          <button className="btn btn-icon" title="Wishlist">
            <FiHeart size={15} />
          </button>
        </div>
      </div>

      <div className="product-card__body">
        {recommendationReason && (
          <div className="recommendation-badge" style={{ marginBottom: '8px' }}>
            ✨ {recommendationReason}
          </div>
        )}

        <p className="product-card__category">{product.category}</p>
        <h3 className="product-card__name">{product.name}</h3>

        <StarRating rating={product.rating} count={product.numReviews} />

        <div className="product-card__price">
          <span className="price-current">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="price-original">${product.originalPrice.toFixed(2)}</span>
          )}
          {discount > 0 && (
            <span className="price-discount">Save {discount}%</span>
          )}
        </div>

        {product.stock === 0 ? (
          <button className="btn btn-secondary w-full" disabled>Out of Stock</button>
        ) : (
          <button
            className="btn btn-primary w-full"
            onClick={handleAddToCart}
            style={{ gap: '8px' }}
          >
            <FiShoppingCart size={15} />
            Add to Cart
          </button>
        )}

        {product.stock > 0 && product.stock < 5 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', marginTop: '6px', textAlign: 'center' }}>
            Only {product.stock} left!
          </p>
        )}
      </div>
    </Link>
  );
};

export { StarRating };
export default ProductCard;
