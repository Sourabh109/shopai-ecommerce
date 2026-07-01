import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { logoutUser } from '../../store/slices/authSlice';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiPackage, FiLogOut, FiSettings } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
    setUserDropdown(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <MdAutoAwesome />
          ShopAI
        </Link>

        {/* Desktop Nav */}
        <div className="navbar__nav">
          <Link to="/products" className="navbar__link">Products</Link>
          <Link to="/products?category=Electronics" className="navbar__link">Electronics</Link>
          <Link to="/products?category=Fashion" className="navbar__link">Fashion</Link>
          <Link to="/products?category=Home+%26+Garden" className="navbar__link">Home</Link>
        </div>

        {/* Actions */}
        <div className="navbar__actions">
          <Link to="/products" className="btn btn-icon" title="Search">
            <FiSearch size={18} />
          </Link>

          {isAuthenticated && (
            <Link to="/cart" className="btn btn-icon cart-badge" title="Cart">
              <FiShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="cart-badge__count">{totalItems > 99 ? '99+' : totalItems}</span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setUserDropdown(!userDropdown)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px' }}
              >
                <FiUser size={16} />
                <span style={{ fontSize: '0.85rem' }}>{user?.name?.split(' ')[0]}</span>
              </button>

              {userDropdown && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%',
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)', padding: '8px',
                  minWidth: '180px', zIndex: 1000, boxShadow: 'var(--shadow-lg)',
                  animation: 'slideUp 0.15s ease',
                }}>
                  <Link to="/profile"
                    onClick={() => setUserDropdown(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <FiUser size={14} /> Profile
                  </Link>
                  <Link to="/orders"
                    onClick={() => setUserDropdown(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <FiPackage size={14} /> My Orders
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin"
                      onClick={() => setUserDropdown(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: 'var(--accent-secondary)', fontSize: '0.9rem', transition: 'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <FiSettings size={14} /> Admin Panel
                    </Link>
                  )}
                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />
                  <button
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: 'var(--accent-danger)', fontSize: '0.9rem', width: '100%', background: 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {userDropdown && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setUserDropdown(false)} />
      )}
    </nav>
  );
};

export default Navbar;
