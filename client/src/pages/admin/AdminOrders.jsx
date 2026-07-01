import { useEffect, useState } from 'react';
import api from '../../services/api';
import { AdminSidebar } from './AdminDashboard';
import { FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = { pending: '#f59e0b', processing: '#3b82f6', shipped: '#7c3aed', delivered: '#10b981', cancelled: '#ef4444' };

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filterStatus) params.set('status', filterStatus);
      const { data } = await api.get(`/orders?${params.toString()}`);
      setOrders(data.orders);
      setTotal(data.total);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [page, filterStatus]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: status }));
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar active="/admin/orders" />
      <main style={{ padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>Orders</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{total} total orders</p>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['', ...STATUS_OPTIONS].map(s => (
            <button key={s || 'all'} className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => { setFilterStatus(s); setPage(1); }}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 380px' : '1fr', gap: '24px' }}>
          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? <div className="loading-container"><div className="spinner" /></div> : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>#{order._id.slice(-6).toUpperCase()}</span></td>
                        <td>
                          <div>
                            <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>{order.user?.name}</p>
                            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{order.user?.email}</p>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.items?.length} items</td>
                        <td style={{ fontWeight: 700 }}>${order.totalPrice?.toFixed(2)}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <select
                            className="form-input"
                            value={order.orderStatus}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            style={{ width: 'auto', fontSize: '0.78rem', padding: '4px 8px', color: STATUS_COLORS[order.orderStatus] || 'white' }}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          <button className="btn btn-icon btn-sm" onClick={() => setSelectedOrder(order === selectedOrder ? null : order)}>
                            <FiEye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order Detail Panel */}
          {selectedOrder && (
            <div className="card" style={{ padding: '24px', position: 'sticky', top: '32px', height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: 700 }}>Order Details</h3>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Order #{selectedOrder._id.slice(-8).toUpperCase()}</p>
              <p style={{ fontSize: '0.85rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>{new Date(selectedOrder.createdAt).toLocaleString()}</p>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Customer</p>
                <p style={{ fontWeight: 600 }}>{selectedOrder.user?.name}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedOrder.user?.email}</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Shipping Address</p>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {selectedOrder.shippingAddress?.fullName}<br />
                  {selectedOrder.shippingAddress?.street}<br />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Items</p>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                    <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>×{item.quantity} @ ${item.price?.toFixed(2)}</p>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent-success)', fontSize: '1.1rem' }}>${selectedOrder.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {Math.ceil(total / 15) > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {page} of {Math.ceil(total / 15)}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrders;
