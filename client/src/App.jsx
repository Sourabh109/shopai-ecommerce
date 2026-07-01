import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import store from './store/store';
import { fetchProfile, setUser } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

// App Initializer - runs once to restore auth session
const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(fetchProfile()).then(() => {
        dispatch(fetchCart());
      });
    } else {
      // Mark as initialized even without auth
      dispatch(setUser(null));
    }
  }, [dispatch]);

  return children;
};

const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: '100vh' }}>{children}</main>
    <Footer />
  </>
);

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppInitializer>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
              error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
            }}
          />
          <Routes>
            {/* Public routes with layout */}
            <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
            <Route path="/products" element={<AppLayout><ProductsPage /></AppLayout>} />
            <Route path="/products/:id" element={<AppLayout><ProductDetailPage /></AppLayout>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes with layout */}
            <Route path="/cart" element={<AppLayout><ProtectedRoute><CartPage /></ProtectedRoute></AppLayout>} />
            <Route path="/checkout" element={<AppLayout><ProtectedRoute><CheckoutPage /></ProtectedRoute></AppLayout>} />
            <Route path="/order-confirmation/:id" element={<AppLayout><ProtectedRoute><OrderConfirmationPage /></ProtectedRoute></AppLayout>} />
            <Route path="/orders" element={<AppLayout><ProtectedRoute><OrdersPage /></ProtectedRoute></AppLayout>} />
            <Route path="/profile" element={<AppLayout><ProtectedRoute><ProfilePage /></ProtectedRoute></AppLayout>} />

            {/* Admin routes (no standard layout - admin has own sidebar) */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={
              <AppLayout>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', paddingTop: '72px' }}>
                  <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🌌</div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, marginBottom: '8px' }}>404</h1>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>This page doesn't exist in our universe.</p>
                  <a href="/" className="btn btn-primary">Back to Home</a>
                </div>
              </AppLayout>
            } />
          </Routes>
        </AppInitializer>
      </Router>
    </Provider>
  );
};

export default App;
