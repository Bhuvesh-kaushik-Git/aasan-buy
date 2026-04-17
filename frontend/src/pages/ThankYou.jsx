import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Prevent users from just navigating here without a recent order
  useEffect(() => {
    if (!location.state?.orderSuccess) {
      const timer = setTimeout(() => {
        // Optional redirect logic if not from checkout
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans px-4 py-12 text-center">
      <div className="w-24 h-24 bg-[#E8F5E9] rounded-[32px] flex items-center justify-center mb-8 shadow-soft mx-auto border border-green-200">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-12 h-12 text-green-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      
      <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight text-dark mb-4 drop-shadow-sm">
        Thank You For Your Order!
      </h1>
      
      <p className="text-gray-500 font-medium max-w-md mx-auto mb-10 text-[15px] leading-relaxed">
        Your order has been successfully placed. We're getting your premium box beautifully wrapped and ready for dispatch.
      </p>
      
      <Link 
        to="/products" 
        className="bg-primary hover:bg-primary-light hover:-translate-y-1 transition-all text-white font-black px-8 py-4 rounded-xl shadow-xl shadow-primary/20 uppercase tracking-widest text-sm inline-flex items-center gap-3"
      >
        Continue Shopping
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
      </Link>
    </div>
  );
};

export default ThankYou;
