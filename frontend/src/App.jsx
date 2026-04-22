import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Products from './pages/Products';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import ThankYou from './pages/ThankYou';
import Collection from './pages/Collection';
import ClaimAccount from './pages/ClaimAccount';
import Wishlist from './pages/Wishlist';
import TrackOrder from './pages/TrackOrder';
import Footer from './components/Footer';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './components/Toast';

const API_URL = import.meta.env.VITE_API_URL;

// Cart Drawer is a standalone component so it can use hooks cleanly
function CartDrawer({ cartOpen, setCartOpen }) {
  const { cart, removeFromCart, updateQuantity, getCartTotal, stockWarnings, isValidatingStock, validateCartStock, hasStockIssues } = useCart();
  const navigate = useNavigate();

  // Run stock validation every time the cart drawer opens
  useEffect(() => {
    if (cartOpen) {
      validateCartStock();
    }
  }, [cartOpen]);

  return (
    <>
      {cartOpen && (
        <div
          className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[60] transition-opacity duration-700"
          onClick={() => setCartOpen(false)}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white/80 backdrop-blur-2xl shadow-premium z-[70] transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col font-sans ${cartOpen ? 'translate-x-0' : 'translate-x-full'} rounded-l-[40px] border-l border-white/40`}>

        {/* Header */}
        <div className="flex justify-between items-center px-10 py-8 border-b border-black/5">
          <div>
            <h2 className="text-2xl font-black font-heading text-primary tracking-tight">
              My Box
            </h2>
            {isValidatingStock && <p className="text-[10px] font-black text-secondary animate-pulse uppercase mt-1 tracking-widest">Verifying Stock...</p>}
          </div>
          <button onClick={() => setCartOpen(false)} className="w-[40px] h-[40px] rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary transition-all hover:bg-white border border-transparent hover:border-gray-100 shadow-soft">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Stock Issue Banner */}
        {hasStockIssues && !isValidatingStock && (
          <div className="mx-6 mt-4 bg-cta-buy/5 border border-cta-buy/20 rounded-2xl p-4 flex items-start gap-3 animate-fade-in-up">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-cta-buy shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
            <div>
              <p className="text-[13px] font-black text-cta-buy uppercase tracking-widest leading-none">Stock Warning</p>
              <p className="text-[12px] text-cta-buy/70 mt-1.5 font-medium">Please adjust quantities to match available inventory before checkout.</p>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto bg-[#FAFAFB] px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-8 animate-fade-in">
              <div className="w-24 h-24 bg-white rounded-[32px] shadow-soft flex items-center justify-center mb-6 border border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-200"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
              </div>
              <h3 className="text-xl font-black font-heading text-dark mb-2">The Box is Empty</h3>
              <p className="text-sm text-gray-400 font-medium mb-8">Add your first joy today and curate something special.</p>
              <button onClick={() => setCartOpen(false)} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl transform active:scale-95 transition-all">Start Exploring</button>
            </div>
          ) : cart.map((item, idx) => {
            const isOutOfStock = stockWarnings[item.productId] === 0;
            const stockLow = stockWarnings[item.productId] > 0 && stockWarnings[item.productId] < item.quantity;
            const availableStock = stockWarnings[item.productId];
            return (
              <div key={idx} className={`group bg-white p-4 rounded-3xl border shadow-soft hover:shadow-premium transition-all relative ${isOutOfStock ? 'border-cta-buy/20 bg-cta-buy/5' : stockLow ? 'border-secondary/20 bg-secondary/5' : 'border-gray-100'}`}>
                
                {isOutOfStock && (
                  <div className="absolute top-2 left-2 bg-cta-buy text-white text-[9px] font-black px-2 py-0.5 rounded shadow-lg z-10 uppercase tracking-widest">Sold Out</div>
                )}

                <div className="flex gap-4">
                  <div className={`w-[90px] h-[90px] rounded-2xl overflow-hidden bg-[#F8F9FB] flex-shrink-0 border border-gray-100 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}>
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                  </div>
                  <div className="flex-grow relative pt-1">
                    <h4 className="text-[13px] font-black text-dark pr-8 leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">{item.name}</h4>
                    <button 
                        onClick={() => removeFromCart(idx)} 
                        className="absolute -top-1 -right-1 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-cta-buy hover:bg-cta-buy/5 rounded-xl transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </button>
                    
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="font-black text-[14px] text-primary">₹{item.price.toLocaleString()}</span>
                        {item.selectedSize && <span className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded font-black text-gray-400 uppercase">{item.selectedSize}</span>}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-[#F8F9FB] rounded-xl border border-gray-100 p-0.5">
                        <button onClick={() => updateQuantity(idx, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary font-black transition-colors">&minus;</button>
                        <span className="w-8 text-center text-[12px] font-black text-primary">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(idx, item.quantity + 1)}
                          disabled={availableStock !== undefined && item.quantity >= availableStock}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary font-black transition-colors disabled:opacity-20"
                        >&#43;</button>
                      </div>
                      <span className="text-[13px] font-black text-dark">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>

                    {stockLow && (
                        <p className="text-[9px] font-black text-secondary uppercase tracking-widest mt-2 animate-pulse">Only {availableStock} remaining</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-8 bg-white border-t border-gray-100 rounded-bl-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-[11px] font-black text-gray-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="text-dark">₹{getCartTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-black text-emerald-500 uppercase tracking-widest">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between items-center pt-5 border-t border-gray-100">
                <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">Total amount</span>
                <span className="text-3xl font-black text-dark tracking-tighter">₹{getCartTotal().toLocaleString()}</span>
              </div>
          </div>
          
          <div className="flex gap-4">
             <button
              onClick={() => { setCartOpen(false); navigate('/checkout'); }}
              disabled={cart.length === 0 || hasStockIssues}
              className={`flex-1 h-16 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 transform active:scale-95 ${(cart.length === 0 || hasStockIssues) ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-primary text-white hover:bg-primary-light hover:-translate-y-1 shadow-primary/20'}`}
            >
              {hasStockIssues ? 'Resolve Inventory' : 'Confirm Order'}
              {!hasStockIssues && cart.length > 0 && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function AppContent() {
  const [cartOpen, setCartOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-dark overflow-x-hidden">
      <Header settings={settings} onOpenCart={() => setCartOpen(true)} />
      <main className="flex-grow pt-[120px] md:pt-[130px] pb-12">
        <Routes>
          <Route path="/" element={<Home settings={settings} />} />
          <Route path="/product/:id" element={<ProductDetails settings={settings} onOpenCart={() => setCartOpen(true)} />} />
          <Route path="/products" element={<Products />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/collection/:id" element={<Collection />} />
          <Route path="/claim-account" element={<ClaimAccount />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/track-order" element={<TrackOrder />} />
        </Routes>
      </main>
      <Footer settings={settings} />
      <CartDrawer cartOpen={cartOpen} setCartOpen={setCartOpen} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ToastProvider>
            <Router>
              <AppContent />
            </Router>
          </ToastProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
