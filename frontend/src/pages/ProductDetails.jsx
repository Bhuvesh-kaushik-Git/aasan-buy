import React, { useState } from 'react';

const SuggestionModal = ({ isOpen, onClose, onContinue }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0 font-sans">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in-up">
        {/* Header - FNP Style (minimal, centered text, x top right) */}
        <div className="p-4 flex justify-center items-center text-dark relative border-b border-gray-100 bg-[#f9f9f9]">
          <h3 className="text-lg font-bold">Make It More Special</h3>
          <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white rounded-full text-gray-500 hover:text-dark border shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-[#fafafa]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: "Dairy Milk Silk", price: "25", img: "https://images.unsplash.com/photo-1548845971-eb6df5c68b64?w=150&h=150&fit=crop" },
              { title: "Happy Birthday Balloon", price: "15", img: "https://images.unsplash.com/photo-1530103862676-de8892bf309c?w=150&h=150&fit=crop" },
              { title: "Greeting Card", price: "10", img: "https://images.unsplash.com/photo-1596482163351-7871b6980db7?w=150&h=150&fit=crop" },
              { title: "Cute Teddy Bear", price: "45", img: "https://images.unsplash.com/photo-1559981421-3e0c0d5cb1ef?w=150&h=150&fit=crop" },
            ].map((item, i) => (
              <div key={i} className="border border-gray-200 bg-white rounded-lg p-3 flex flex-col items-center text-center transition-colors">
                <img src={item.img} alt={item.title} className="w-[70px] h-[70px] object-cover rounded mb-3" />
                <span className="text-[12px] font-semibold text-gray-700 line-clamp-1 mb-1">{item.title}</span>
                <span className="text-[13px] text-dark font-bold mb-3 font-sans">QAR {item.price}</span>
                <button className="w-full text-[12px] font-bold text-primary border border-primary px-4 py-1.5 rounded hover:bg-primary hover:text-white transition-colors uppercase tracking-wide">Add</button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-4">
            <button onClick={onContinue} className="text-[13px] font-bold text-gray-500 hover:text-dark px-4 py-2 uppercase underline tracking-wider">Skip & Continue</button>
            <button onClick={onContinue} className="bg-primary text-white px-8 py-2.5 rounded font-bold uppercase hover:bg-opacity-90 shadow-sm text-[13px] tracking-wider transition-colors">Proceed</button>
        </div>
      </div>
    </div>
  );
};

const ProductDetails = ({ onOpenCart }) => {
  const [showModal, setShowModal] = useState(false);
  
  const handleAddToCart = () => {
    setShowModal(true);
  };

  return (
    <div className="w-full bg-[#fcfcfc] font-sans">
      <div className="max-w-[1250px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        
        {/* Left Col: Images Stacked (FNP Style) */}
        <div className="flex gap-4">
           {/* Thumbnails */}
           <div className="hidden md:flex flex-col gap-3 w-20">
             {[1,2,3].map((i) => (
               <div key={i} className={`aspect-square border cursor-pointer ${i === 1 ? 'border-primary border-[2px]' : 'border-gray-200'}`}>
                 <img src={`https://images.unsplash.com/photo-1563241598-6bbdb1e96723?w=150&h=150&fit=crop&q=${i}`} className="w-full h-full object-cover" />
               </div>
             ))}
           </div>
           {/* Main Carousel area */}
           <div className="flex-grow bg-white aspect-square border border-gray-100 relative">
             <img src="https://images.unsplash.com/photo-1563241598-6bbdb1e96723?w=800&h=800&fit=crop" className="w-full h-full object-cover" />
             <div className="absolute top-4 left-4 bg-white border text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide shadow-sm">Best Seller</div>
           </div>
        </div>

        {/* Right Col: Specific Details panel */}
        <div>
          <div className="bg-white border border-gray-200 rounded p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] sticky top-36">
            <h1 className="text-[22px] font-medium text-dark leading-snug tracking-tight mb-2">Red Roses Elegance With Glass Vase</h1>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center bg-green-50 px-1.5 py-0.5 rounded text-secondary text-[11px] font-bold border border-green-100">★ 4.8</div>
              <a href="#" className="flex gap-2">
                <span className="text-[12px] text-gray-500 hover:text-primary underline">124 Reviews</span>
              </a>
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-[24px] font-black text-dark font-sans tracking-tight">QAR 249</span>
              <span className="text-[15px] text-gray-400 line-through">QAR 299</span>
              <span className="text-[12px] font-bold text-secondary tracking-widest uppercase">(16% OFF)</span>
            </div>

            {/* Delivery Inputs Box */}
            <div className="bg-[#fcfcfc] border border-gray-200 rounded p-4 mb-6">
               <h4 className="font-bold text-gray-800 text-[13px] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                  Delivery Destination
               </h4>
               <input 
                  type="text" 
                  placeholder="Enter Area / Pincode" 
                  className="w-full border-b border-gray-300 bg-transparent py-2 text-[13px] focus:outline-none focus:border-primary transition-colors text-dark mb-4" 
               />
               <input 
                  type="date"
                  className="w-full border-b border-gray-300 bg-transparent py-2 text-[13px] focus:outline-none focus:border-primary text-gray-500"
               />
            </div>

            <div className="pt-2 mb-8">
              <h4 className="font-bold text-gray-800 text-[13px] uppercase tracking-wide mb-2">Description</h4>
              <ul className="text-[13px] text-gray-600 space-y-1.5 list-disc pl-4 marker:text-gray-300">
                <li>12 Premium Red Roses</li>
                <li>Premium Glass Vase Included</li>
                <li>Freshly plucked and sanitized</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAddToCart} className="flex-1 bg-primary text-white font-bold py-3.5 rounded hover:bg-opacity-90 uppercase text-[15px] tracking-wide transition-colors">
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      </div>

      <SuggestionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onContinue={() => {
          setShowModal(false);
          onOpenCart();
        }} 
      />
    </div>
  );
};

export default ProductDetails;
