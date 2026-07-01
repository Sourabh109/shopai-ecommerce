import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiLock, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51ToRRsLDCwgBOCHZmKSaO8gW1BWKnHKzHUPREDPkZ9J860UHijAYdSEZvG2aN3NLAvOVeWOPYNTqhl95tfIiI6ds00UfKxRV0C');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#f1f1f5',
      fontFamily: 'Inter, sans-serif',
      '::placeholder': { color: '#5a5a72' },
    },
    invalid: { color: '#ef4444' },
  },
};

const CheckoutForm = ({ items, totals }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    street: '', city: '', state: '', zipCode: '', country: 'US',
  });
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: address, 2: payment

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      // Step 1: Create PaymentIntent
      const { data: intentData } = await api.post('/orders/payment-intent', {
        items: items.map(item => ({ productId: item.product?._id || item.product, quantity: item.quantity })),
      });

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: address.fullName, email: user?.email },
        },
      });

      if (error) {
        toast.error(error.message);
        setProcessing(false);
        return;
      }

      // Step 3: Create order in DB
      const orderItems = items.map(item => ({
        product: item.product?._id || item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      }));

      const { data: orderData } = await api.post('/orders', {
        items: orderItems,
        shippingAddress: address,
        paymentIntentId: paymentIntent.id,
        totals: intentData.totals,
      });

      toast.success('Order placed successfully! 🎉');
      navigate(`/order-confirmation/${orderData.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Progress Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
        {[{ n: 1, label: 'Shipping' }, { n: 2, label: 'Payment' }].map(({ n, label }) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: step >= n ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
              border: `2px solid ${step >= n ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: step >= n ? 'white' : 'var(--text-muted)',
            }}>{n}</div>
            <span style={{ fontSize: '0.9rem', color: step >= n ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step >= n ? 600 : 400 }}>{label}</span>
            {n < 2 && <div style={{ width: '40px', height: '2px', background: step > n ? 'var(--accent-primary)' : 'var(--border-color)' }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Shipping Address */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Shipping Address</h3>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="fullName" className="form-input" value={address.fullName} onChange={handleAddressChange} required placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input name="street" className="form-input" value={address.street} onChange={handleAddressChange} required placeholder="123 Main St" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input name="city" className="form-input" value={address.city} onChange={handleAddressChange} required placeholder="New York" />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input name="state" className="form-input" value={address.state} onChange={handleAddressChange} required placeholder="NY" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">ZIP Code</label>
              <input name="zipCode" className="form-input" value={address.zipCode} onChange={handleAddressChange} required placeholder="10001" />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <select name="country" className="form-input" value={address.country} onChange={handleAddressChange}>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="IN">India</option>
              </select>
            </div>
          </div>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep(2)}>
            Continue to Payment →
          </button>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep(1)} style={{ display: 'inline-flex', alignSelf: 'flex-start' }}>
            <FiArrowLeft /> Back to Address
          </button>

          {/* Address Summary */}
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>SHIPPING TO</p>
            <p style={{ fontSize: '0.9rem' }}>{address.fullName}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {address.street}, {address.city}, {address.state} {address.zipCode}
            </p>
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Payment Details</h3>

            <div className="stripe-input">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <FiLock size={14} style={{ color: 'var(--accent-success)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Powered by Stripe. Test card: 4242 4242 4242 4242 / Any future date / Any CVC
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={!stripe || processing}
            style={{ gap: '8px' }}
          >
            <FiLock size={16} />
            {processing ? 'Processing Payment...' : `Pay $${totals?.totalPrice?.toFixed(2) || '...'}`}
          </button>
        </div>
      )}
    </form>
  );
};

const CheckoutPage = () => {
  const { items, totalPrice } = useSelector((state) => state.cart);
  const shippingPrice = totalPrice > 100 ? 0 : 9.99;
  const taxPrice = totalPrice * 0.08;

  const totals = {
    itemsPrice: totalPrice,
    shippingPrice,
    taxPrice: parseFloat(taxPrice.toFixed(2)),
    totalPrice: parseFloat((totalPrice + shippingPrice + taxPrice).toFixed(2)),
  };

  if (items.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ padding: '80px var(--spacing-lg)', textAlign: 'center' }}>
          <h2>Your cart is empty</h2>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '16px' }}>Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '32px var(--spacing-lg)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '32px' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
          <div className="card" style={{ padding: '32px' }}>
            <Elements stripe={stripePromise}>
              <CheckoutForm items={items} totals={totals} />
            </Elements>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2 className="order-summary__title">Order Summary</h2>
            <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
              {items.map(item => (
                <div key={item.product?._id || item.product} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.3 }}>{item.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>x{item.quantity}</p>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="order-summary__row"><span>Subtotal</span><span>${totals.itemsPrice.toFixed(2)}</span></div>
            <div className="order-summary__row"><span>Shipping</span><span style={{ color: totals.shippingPrice === 0 ? 'var(--accent-success)' : undefined }}>{totals.shippingPrice === 0 ? 'FREE' : `$${totals.shippingPrice.toFixed(2)}`}</span></div>
            <div className="order-summary__row"><span>Tax</span><span>${totals.taxPrice.toFixed(2)}</span></div>
            <div className="order-summary__row total"><span>Total</span><span>${totals.totalPrice.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
