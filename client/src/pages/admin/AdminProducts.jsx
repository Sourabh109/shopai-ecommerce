import { useEffect, useState } from 'react';
import api from '../../services/api';
import { AdminSidebar } from './AdminDashboard';
import { FiPlus, FiEdit3, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Toys', 'Automotive', 'Food', 'Other'];

const emptyProduct = {
  name: '', description: '', price: '', originalPrice: '', category: 'Electronics',
  brand: '', stock: '', tags: '', images: '', isFeatured: false,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products?limit=100&sort=newest');
      setProducts(data.products);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => { setForm(emptyProduct); setEditingId(null); setModal('add'); };
  const openEdit = (product) => {
    setForm({
      ...product,
      images: product.images?.join(', ') || '',
      tags: product.tags?.join(', ') || '',
      originalPrice: product.originalPrice || '',
    });
    setEditingId(product._id);
    setModal('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (modal === 'edit') {
        await api.put(`/products/${editingId}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      setModal(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-layout">
      <AdminSidebar active="/admin/products" />
      <main style={{ padding: '32px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>Products</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{products.length} products total</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Product</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input type="text" className="form-input" placeholder="Search products..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: '320px' }} />
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => (
                    <tr key={product._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={product.images?.[0]} alt={product.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{product.name}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-primary">{product.category}</span></td>
                      <td style={{ fontWeight: 700 }}>${product.price.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${product.stock === 0 ? 'badge-danger' : product.stock < 10 ? 'badge-warning' : 'badge-success'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td>⭐ {product.rating?.toFixed(1)}</td>
                      <td>
                        <span className={`badge ${product.isFeatured ? 'badge-warning' : ''}`} style={!product.isFeatured ? { color: 'var(--text-muted)' } : {}}>
                          {product.isFeatured ? '★ Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-icon btn-sm" onClick={() => openEdit(product)}><FiEdit3 size={14} /></button>
                          <button className="btn btn-icon btn-sm" style={{ color: 'var(--accent-danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                            onClick={() => handleDelete(product._id, product.name)}>
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {modal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
            <div className="modal">
              <div className="modal__header">
                <h2 className="modal__title">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
                <button onClick={() => setModal(null)} className="btn btn-icon"><FiX size={18} /></button>
              </div>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Price *</label>
                    <input type="number" step="0.01" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Original Price</label>
                    <input type="number" step="0.01" className="form-input" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} placeholder="Leave empty if no discount" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock *</label>
                    <input type="number" className="form-input" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input className="form-input" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URLs (comma-separated)</label>
                  <input className="form-input" value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="tag1, tag2, tag3" />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />
                  <span style={{ fontSize: '0.9rem' }}>Featured Product</span>
                </label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}><FiSave size={15} /> {saving ? 'Saving...' : 'Save Product'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProducts;
