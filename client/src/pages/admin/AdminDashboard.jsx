import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement, Filler,
} from 'chart.js';
import { FiPackage, FiUsers, FiShoppingBag, FiDollarSign, FiSettings, FiBarChart2, FiList, FiHome } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminSidebar = ({ active }) => {
  const navItems = [
    { path: '/admin', icon: FiBarChart2, label: 'Dashboard' },
    { path: '/admin/products', icon: FiPackage, label: 'Products' },
    { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
    { path: '/admin/users', icon: FiUsers, label: 'Users' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <MdAutoAwesome style={{ color: 'var(--accent-primary)', fontSize: '1.4rem' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ShopAI</span>
        </Link>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Admin Panel</p>
      </div>

      <nav>
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link key={path} to={path} className={`admin-nav__item ${active === path ? 'active' : ''}`}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
        <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 16px' }} />
        <Link to="/" className="admin-nav__item">
          <FiHome size={18} /> Back to Store
        </Link>
      </nav>
    </aside>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const lineData = stats ? {
    labels: stats.monthlyRevenue.map(r => `${MONTH_NAMES[r._id.month - 1]} ${r._id.year}`),
    datasets: [{
      label: 'Revenue ($)',
      data: stats.monthlyRevenue.map(r => r.revenue),
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124, 58, 237, 0.1)',
      borderWidth: 2.5,
      pointBackgroundColor: '#7c3aed',
      pointRadius: 4,
      tension: 0.4,
      fill: true,
    }],
  } : null;

  const doughnutData = stats ? {
    labels: stats.categorySales.map(c => c._id),
    datasets: [{
      data: stats.categorySales.map(c => c.revenue),
      backgroundColor: ['#7c3aed', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
      borderColor: 'var(--bg-card)',
      borderWidth: 3,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#9494a8' } }, tooltip: { backgroundColor: '#16161f', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 } },
    scales: { x: { ticks: { color: '#9494a8' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#9494a8' }, grid: { color: 'rgba(255,255,255,0.05)' } } },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: { legend: { position: 'right', labels: { color: '#9494a8', padding: 12, font: { size: 12 } } } },
    cutout: '65%',
  };

  if (loading) return (
    <div className="admin-layout">
      <AdminSidebar active="/admin" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <div className="spinner" />
      </div>
    </div>
  );

  const statCards = [
    { label: 'Total Revenue', value: `$${stats?.stats?.totalRevenue?.toFixed(0) || 0}`, icon: FiDollarSign, color: '#7c3aed', change: '+12%' },
    { label: 'Total Orders', value: stats?.stats?.totalOrders || 0, icon: FiShoppingBag, color: '#ec4899', change: '+8%' },
    { label: 'Total Customers', value: stats?.stats?.totalUsers || 0, icon: FiUsers, color: '#10b981', change: '+23%' },
    { label: 'Total Products', value: stats?.stats?.totalProducts || 0, icon: FiPackage, color: '#f59e0b', change: '+5%' },
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar active="/admin" />
      <main style={{ padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Welcome back, Admin! Here's what's happening.</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {statCards.map(({ label, value, icon: Icon, color, change }) => (
            <div key={label} className="stat-card">
              <div className="stat-card__icon" style={{ background: `${color}20`, color }}>
                <Icon size={20} />
              </div>
              <div className="stat-card__value">{value}</div>
              <div className="stat-card__label">{label}</div>
              <span className="stat-card__change positive">{change}</span>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Revenue (Last 6 Months)</h3>
            {lineData ? <Line data={lineData} options={chartOptions} /> : <p style={{ color: 'var(--text-muted)' }}>No data yet</p>}
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Sales by Category</h3>
            {doughnutData?.labels?.length > 0 ? <Doughnut data={doughnutData} options={doughnutOptions} /> : <p style={{ color: 'var(--text-muted)' }}>No data yet</p>}
          </div>
        </div>

        {/* Recent Orders & Low Stock */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Recent Orders</h3>
            <table className="data-table">
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map(order => (
                  <tr key={order._id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>#{order._id.slice(-6).toUpperCase()}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>{order.user?.name}</td>
                    <td style={{ fontWeight: 700 }}>${order.totalPrice?.toFixed(2)}</td>
                    <td><span className={`badge badge-${order.orderStatus === 'delivered' ? 'success' : order.orderStatus === 'cancelled' ? 'danger' : 'primary'}`}>{order.orderStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/admin/orders" className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>View All Orders</Link>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>⚠️ Low Stock Alerts</h3>
            {stats?.lowStockProducts?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All products are well stocked!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats?.lowStockProducts?.map(p => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={p.images?.[0]} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                    </div>
                    <span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                      {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link to="/admin/products" className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>Manage Products</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export { AdminSidebar };
export default AdminDashboard;
