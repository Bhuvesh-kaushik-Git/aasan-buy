import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Footer from './components/Footer';

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background font-sans text-dark overflow-x-hidden">
        <Header onOpenCart={() => setCartOpen(true)} />
        
        <main className="flex-grow pt-[80px] pb-12">
          {/* Quick debug navigation since links aren't fully wired yet */}
          <div className="bg-gray-100/50 text-center py-2 text-[11px] flex justify-center gap-4 border-b border-gray-200 text-gray-500">
            <span className="font-bold">Dev Navigation:</span>
            <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
            <Link to="/product/1" className="hover:text-secondary transition-colors">Product Page Demo</Link>
          </div>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails onOpenCart={() => setCartOpen(true)} />} />
          </Routes>
        </main>

        <Footer />
        
        {/* Drawer Overlay */}
        {cartOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-[60] transition-opacity"
            onClick={() => setCartOpen(false)}
          />
        )}

        {/* Cart Drawer - Exact FNP Replica */}
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#fcfcfc] shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col font-sans ${cartOpen ? 'translate-x-0' : 'translate-x-full'} rounded-l-2xl`}>
          
          {/* Drawer Header */}
          <div className="flex justify-between items-center px-6 py-5 bg-white rounded-tl-2xl">
            <h2 className="text-[26px] font-medium text-dark tracking-tight font-sans">Cart</h2>
            <button onClick={() => setCartOpen(false)} className="w-[36px] h-[36px] rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-dark transition-colors bg-[#f9f9f9]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto bg-[#fafafa]">
             {/* Cart Item block */}
             <div className="bg-white p-5 mx-4 mt-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="flex gap-4">
                  <div className="w-[85px] h-[85px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&h=150&fit=crop" className="w-full h-full object-cover" alt="Item" />
                  </div>
                  <div className="flex-grow relative">
                    <h4 className="text-[14px] font-medium text-dark pr-6 leading-tight">Delicious Ferrero Rocher Chocolate Cake</h4>
                    <button className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 bg-gray-50 rounded-full border border-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                    </button>
                    <div className="font-bold text-[14px] mt-1.5 flex items-center gap-1 font-sans">QAR 159</div>
                    <div className="text-[12px] text-gray-500 mt-0.5">Size: 1 Kg</div>
                    <div className="flex justify-end mt-2">
                       <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                         <button className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-dark font-medium">&minus;</button>
                         <span className="w-7 text-center text-[13px] font-bold">1</span>
                         <button className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-dark font-medium">&#43;</button>
                       </div>
                    </div>
                  </div>
                </div>
             </div>

             {/* Delivery Options Block */}
             <div className="bg-white p-5 mx-4 mt-3 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                   <span className="text-[13px] font-medium text-gray-600">Fixed Time Delivery</span>
                   <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wide">QAR 49</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                   <span className="text-[13px] font-medium text-gray-600">Standard Delivery</span>
                   <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wide">QAR 29</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button className="border border-gray-200 rounded p-2 text-[12px] font-medium hover:border-primary text-gray-600 text-center transition-colors bg-white hover:bg-gray-50">7:00 AM - 12:00 PM</button>
                  <button className="border border-gray-200 rounded p-2 text-[12px] font-medium hover:border-primary text-gray-600 text-center transition-colors bg-white hover:bg-gray-50">12:00 PM - 4:00 PM</button>
                  <button className="border border-gray-200 rounded p-2 text-[12px] font-medium hover:border-primary text-gray-600 text-center transition-colors bg-white hover:bg-gray-50">4:00 PM - 8:00 PM</button>
                  <button className="border border-gray-200 rounded p-2 text-[12px] font-medium hover:border-primary text-gray-600 text-center transition-colors bg-white hover:bg-gray-50">8:00 PM - 11:00 PM</button>
                </div>

                {/* Message Card block simulated */}
                <div className="mt-5 border-t border-gray-100 pt-4 cursor-pointer flex justify-between items-center">
                  <span className="text-[13px] font-medium text-gray-700">Your Message Card</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                </div>
             </div>
          </div>

          <div className="p-6 bg-white border-t border-gray-200 rounded-bl-2xl">
            <div className="flex items-center justify-between font-sans">
              <span className="font-bold text-[16px] text-dark">Estimated total</span>
              <span className="font-bold text-[18px]">QAR 188.00</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 mb-5">Taxes, discounts and shipping calculated at checkout.</p>
            
            <div className="flex gap-3 font-sans">
              <button 
                onClick={() => setCartOpen(false)}
                className="flex-[0.8] border border-primary text-primary bg-white py-3.5 flex rounded font-bold text-[13px] tracking-wide hover:bg-[#f6f7ef] transition-colors justify-center"
              >
                Continue Shopping
              </button>
              <button className="flex-[1.2] bg-accent text-white flex rounded font-bold text-[15px] tracking-wider py-3.5 hover:bg-[#b0b691] transition-colors justify-center">
                CHECKOUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
