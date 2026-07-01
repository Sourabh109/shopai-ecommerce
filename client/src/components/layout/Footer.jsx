import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '48px 0 24px',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '40px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <MdAutoAwesome style={{ color: 'var(--accent-primary)', fontSize: '1.4rem' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ShopAI</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              The future of shopping, powered by AI recommendations and seamless checkout.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              {[FiGithub, FiTwitter, FiInstagram].map((Icon, i) => (
                <button key={i} className="btn-icon" style={{ width: '36px', height: '36px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>Shop</h4>
            {['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books'].map(cat => (
              <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`}
                style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '4px 0', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                {cat}
              </Link>
            ))}
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>Account</h4>
            {[['Profile', '/profile'], ['My Orders', '/orders'], ['Cart', '/cart'], ['Login', '/login']].map(([label, path]) => (
              <Link key={path} to={path}
                style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '4px 0', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                {label}
              </Link>
            ))}
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>Newsletter</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>Get AI-curated deals in your inbox.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="email" placeholder="your@email.com" className="form-input" style={{ flex: 1 }} />
              <button className="btn btn-primary btn-sm"><FiMail size={14} /></button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © 2026 ShopAI. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <span key={item} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
