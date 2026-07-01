import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateCartItem, removeFromCart, clearCart } from '../store/slices/cartSlice';
import { FiTrash2, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

const CartPage = () => {
  const dispatch = useDispatch();
  const { items, totalItems, totalPrice, loading } = useSelector((state) => state.cart);

  const shippingPrice = totalPrice > 100 ? 0 : 9.99;
  const taxPrice = totalPrice * 0.08;
  const orderTotal = totalPrice + shippingPrice + taxPrice;

  if (items.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ padding: '80px var(--spacing-lg)', textAlign: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: '24px' }}>🛒</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '12px' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            <FiShoppingBag /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '32px var(--spacing-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <Link to="/products" className="btn btn-secondary btn-sm" style={{ marginBottom: '8px', display: 'inline-flex' }}>
              <FiArrowLeft /> Continue Shopping
            </Link>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>
              Shopping Cart
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => dispatch(clearCart())}
            disabled={loading}
          >
            <FiTrash2 size={14} /> Clear Cart
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item) => (
              <div key={item.product?._id || item.product} className="cart-item">
                <Link to={`/products/${item.product?._id || item.product}`}>
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                    alt={item.name}
                    className="cart-item__image"
                  />
                </Link>
                <div className="cart-item__info">
                  <Link to={`/products/${item.product?._id || item.product}`}>
                    <h3 className="cart-item__name">{item.name}</h3>
                  </Link>
                  <p className="cart-item__price">${item.price.toFixed(2)} each</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                  <div className="qty-control">
                    <button className="qty-btn"
                      onClick={() => dispatch(updateCartItem({ productId: item.product?._id || item.product, quantity: item.quantity - 1 }))}>
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn"
                      onClick={() => dispatch(updateCartItem({ productId: item.product?._id || item.product, quantity: item.quantity + 1 }))}>
                      +
                    </button>
                  </div>

                  <strong style={{ fontSize: '1rem' }}>${(item.price * item.quantity).toFixed(2)}</strong>

                  <button
                    onClick={() => dispatch(removeFromCart(item.product?._id || item.product))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)', padding: '4px', borderRadius: '6px', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2 className="order-summary__title">Order Summary</h2>

            <div className="order-summary__row">
              <span>Subtotal ({totalItems} items)</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="order-summary__row">
              <span>Shipping</span>
              <span style={{ color: shippingPrice === 0 ? 'var(--accent-success)' : undefined }}>
                {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
              </span>
            </div>
            {shippingPrice === 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--accent-success)', marginBottom: '8px' }}>
                🎉 Free shipping on orders over $100!
              </p>
            )}
            {shippingPrice > 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Add ${(100 - totalPrice).toFixed(2)} more for free shipping
              </p>
            )}
            <div className="order-summary__row">
              <span>Tax (8%)</span>
              <span>${taxPrice.toFixed(2)}</span>
            </div>
            <div className="order-summary__row total">
              <span>Total</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>

            <Link to="/checkout" className="btn btn-primary btn-lg w-full" style={{ marginTop: '20px', justifyContent: 'center' }}>
              Proceed to Checkout
            </Link>

            {/* Secure badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
              {['🔒 Secure Checkout', '💳 Stripe Protected', '🔄 Free Returns'].map(b => (
                <span key={b} style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
