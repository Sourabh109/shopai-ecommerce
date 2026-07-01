import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FiCheck, FiPackage, FiHome } from 'react-icons/fi';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-wrapper loading-container"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '60px var(--spacing-lg)', maxWidth: '680px', margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)', border: '3px solid var(--accent-success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: '2.5rem',
          }}>
            <FiCheck style={{ color: 'var(--accent-success)', strokeWidth: 3 }} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--accent-success)' }}>
            Order Confirmed!
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
            Thank you for your order 🎉
          </p>
          {order && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
              Order ID: <strong style={{ color: 'var(--accent-secondary)' }}>#{order._id?.slice(-8).toUpperCase()}</strong>
            </p>
          )}

          {order && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Order Details</h3>
              {order.items?.map(item => (
                <div key={item.product} style={{ display: 'flex', gap: '12px', marginBottom: '12px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Qty: {item.quantity}</p>
                  </div>
                  <span style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', paddingTop: '12px' }}>
                <span>Total Paid</span>
                <span style={{ color: 'var(--accent-success)' }}>${order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/orders" className="btn btn-secondary">
              <FiPackage /> View Orders
            </Link>
            <Link to="/" className="btn btn-primary">
              <FiHome /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
