import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';
import { FiUser, FiMail, FiEdit3, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, password: '', confirmPassword: '' });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const updateData = { name: form.name, email: form.email };
    if (form.password) updateData.password = form.password;

    const result = await dispatch(updateProfile(updateData));
    if (!result.error) {
      toast.success('Profile updated successfully!');
      setEditing(false);
    } else {
      toast.error(result.payload || 'Update failed');
    }
  };

  if (!user) return <div className="page-wrapper loading-container"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '40px var(--spacing-lg)', maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '32px' }}>My Profile</h1>

        <div className="card" style={{ padding: '32px' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: 'white', flexShrink: 0,
            }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>{user.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</p>
              <span className={`badge ${user.role === 'admin' ? 'badge-warning' : 'badge-primary'}`} style={{ marginTop: '6px' }}>
                {user.role === 'admin' ? '👑 Admin' : '🛍️ Customer'}
              </span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: 'auto' }}
              onClick={() => setEditing(!editing)}
            >
              {editing ? <><FiX size={14} /> Cancel</> : <><FiEdit3 size={14} /> Edit</>}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Leave password fields empty to keep current password</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-input" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                <FiSave size={15} /> Save Changes
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { icon: FiUser, label: 'Full Name', value: user.name },
                { icon: FiMail, label: 'Email Address', value: user.email },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                    <p style={{ fontWeight: 600 }}>{value}</p>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                  🔐
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</p>
                  <p style={{ fontWeight: 600 }}>••••••••</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
