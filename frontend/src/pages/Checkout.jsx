import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const API_URL = import.meta.env.VITE_API_URL;
const CURRENCY = 'INR'; // India market – Razorpay native currency

const TrustBadges = () => (
  <div className="mt-5 pt-4 border-t border-gray-100">
    <div className="flex items-center justify-center gap-4 flex-wrap">
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
        SSL Secured
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>
        Secure Payments
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-amber-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
        Free Delivery
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-500"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
        100% Genuine
      </div>
    </div>
    <div className="flex items-center justify-center gap-2 mt-3">
      {['VISA', 'MC', 'UPI', 'COD'].map(m => (
        <span key={m} className="border border-gray-200 text-[10px] font-black text-gray-400 px-2 py-1 rounded">{m}</span>
      ))}
    </div>
  </div>
);

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState(null); // { type: 'success'|'error', text, amount }
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }, []);

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 font-sans">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 text-gray-200"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
        <p className="text-gray-500 font-bold text-lg">Your cart is empty</p>
        <Link to="/products" className="bg-secondary text-white font-bold px-6 py-3 rounded-xl hover:bg-amber-500 transition-colors">Start Shopping</Link>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const finalTotal = Math.max(0, subtotal - discount);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderTotal: subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setDiscount(data.discountAmount);
        setCouponMsg({ type: 'success', text: `Coupon applied! You saved ₹${data.discountAmount}`, amount: data.discountAmount });
      } else {
        setDiscount(0);
        setCouponMsg({ type: 'error', text: data.error || 'Invalid coupon' });
      }
    } catch {
      setCouponMsg({ type: 'error', text: 'Could not validate coupon. Try again.' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setCouponCode('');
    setCouponMsg(null);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        customerDetails: formData,
        items: cart,
        totalAmount: subtotal,
        paymentMethod,
        couponCode: discount > 0 ? couponCode : undefined,
        currency: CURRENCY,
      };
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      if (paymentMethod === 'cod') {
        clearCart();
        showToast('🎉 Order placed successfully! You will pay on delivery.', 'success');
        navigate(`/thank-you?orderId=${data.order._id}`);
      } else {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: CURRENCY,
          name: 'AasanBuy',
          description: 'Secure Checkout',
          order_id: data.razorpayOrderId,
          handler: async (response) => {
            const verifyRes = await fetch(`${API_URL}/api/orders/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                order_id: data.order._id,
              }),
            });
            const vData = await verifyRes.json();
            if (vData.success) {
              clearCart();
              showToast('✅ Payment verified! Order confirmed.', 'success');
              showToast('✅ Payment verified! Order confirmed.', 'success');
              navigate(`/thank-you?orderId=${data.order._id}`);
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          },
          prefill: { name: formData.fullName, email: formData.email, contact: formData.phone },
          theme: { color: '#f59c1a' },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (r) => setError('Payment failed: ' + r.error.description));
        rzp.open();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 font-sans">
      <h1 className="text-2xl font-black text-dark mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-secondary"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
        Secure Checkout
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Left: Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-5">Shipping Information</h2>
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Full Name</label>
                <input required name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Email</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@email.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Phone</label>
                  <input required name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 ..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Street Address</label>
                <input required name="address" value={formData.address} onChange={handleInputChange} placeholder="Building, Street, Area" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {['city', 'state', 'pincode'].map(field => (
                  <div key={field}>
                    <label className="text-xs font-bold text-gray-500 block mb-1 capitalize">{field}</label>
                    <input required name={field} value={formData[field]} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all" />
                  </div>
                ))}
              </div>
            </form>
          </div>

          {/* Payment */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-5">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: 'razorpay', label: 'Razorpay', sub: 'Cards, UPI, Netbanking', icon: '💳' },
                { val: 'cod', label: 'Cash on Delivery', sub: 'Pay when delivered', icon: '💵' },
              ].map(opt => (
                <label key={opt.val} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === opt.val ? 'border-secondary bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value={opt.val} checked={paymentMethod === opt.val} onChange={() => setPaymentMethod(opt.val)} className="mt-1 accent-secondary" />
                  <div>
                    <p className="font-bold text-dark text-sm">{opt.icon} {opt.label}</p>
                    <p className="text-[11px] text-gray-500">{opt.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-36">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Order Summary</h2>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 mb-4">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <img src={item.image} className="w-12 h-12 object-cover rounded-lg" alt={item.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-dark line-clamp-1">{item.name}</p>
                    {item.selectedColor && <p className="text-[10px] text-gray-500">Color: {item.selectedColor.name}</p>}
                    <p className="text-[11px] font-bold text-secondary">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-black text-dark text-[13px] shrink-0">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Promo Code</label>
              {discount > 0 ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                  <div>
                    <p className="text-sm font-bold text-green-700">{couponCode.toUpperCase()} applied</p>
                    <p className="text-[11px] text-green-600">Saving ₹{discount}</p>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponMsg(null); }}
                    placeholder="Enter code"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold uppercase focus:outline-none focus:border-secondary transition-all"
                  />
                  <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              {couponMsg && !discount && (
                <p className={`text-[11px] mt-1.5 font-medium ${couponMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{couponMsg.text}</p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₹{subtotal}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm font-bold text-green-600"><span>Discount</span><span>- ₹{discount}</span></div>}
              <div className="flex justify-between text-sm text-gray-500"><span>Shipping</span><span className="text-green-500 font-bold">FREE</span></div>
              <div className="flex justify-between font-black text-[18px] text-dark pt-2 border-t border-gray-100">
                <span>Total</span><span>₹{finalTotal}</span>
              </div>
            </div>

            <button
              type="submit" form="checkout-form" disabled={loading}
              className="w-full mt-5 bg-secondary text-white font-black py-4 rounded-xl shadow-lg shadow-amber-200 hover:-translate-y-0.5 transition-all text-[15px] uppercase tracking-wider disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Processing...' : `Place Order · ₹${finalTotal}`}
            </button>

            <TrustBadges />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
