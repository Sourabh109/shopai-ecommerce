import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FiPackage, FiClock, FiTruck, FiCheck, FiX } from 'react-icons/fi';

const STATUS_MAP = {
  pending: { label: 'Pending', color: '#f59e0b', icon: FiClock },
  processing: { label: 'Processing', color: '#3b82f6', icon: FiPackage },
  shipped: { label: 'Shipped', color: '#7c3aed', icon: FiTruck },
  delivered: { label: 'Delivered', color: '#10b981', icon: FiCheck },
  cancelled: { label: 'Cancelled', color: '#ef4444', icon: FiX },
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-wrapper loading-container"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '32px var(--spacing-lg)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '32px' }}>My Orders</h1>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📦</div>
            <h3 style={{ marginBottom: '8px' }}>No orders yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Start shopping to see your orders here.</p>
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => {
              const status = STATUS_MAP[order.orderStatus] || STATUS_MAP.pending;
              const StatusIcon = status.icon;
              return (
                <div key={order._id} className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ORDER ID</p>
                      <p style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-secondary)' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: `${status.color}15`, border: `1px solid ${status.color}30` }}>
                      <StatusIcon size={14} style={{ color: status.color }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: status.color }}>{status.label}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>${order.totalPrice?.toFixed(2)}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {order.items?.slice(0, 4).map((item, i) => (
                      <div key={i} style={{ flexShrink: 0, position: 'relative' }}>
                        <img src={item.image} alt={item.name} style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                        {item.quantity > 1 && (
                          <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--accent-primary)', color: 'white', fontSize: '0.65rem', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                    {order.items?.length > 4 && (
                      <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to={`/order-confirmation/${order._id}`} className="btn btn-secondary btn-sm">View Details</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
